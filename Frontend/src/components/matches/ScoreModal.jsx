import { useState } from 'react'
import { motion } from 'framer-motion'
import { Flag, Minus, Plus, Save, Zap } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { TeamLogo } from '../ui/TeamLogo'
import { api } from '../../services/api'
import { useToast } from '../../context/ToastContext'

// Um lado do placar: escudo, nome e os botões - e +
function LadoPlacar({ team, valor, onChange, vencendo }) {
  return (
    <div className={`score-side ${vencendo ? 'is-leading' : ''}`} style={{ '--team': team.cor }}>
      <TeamLogo team={team} size={72} glow={vencendo} />
      <strong className="score-side__name">{team.nome}</strong>
      <div className="score-stepper">
        <button type="button" className="score-stepper__btn" onClick={() => onChange(Math.max(0, valor - 1))} aria-label={`Diminuir placar de ${team.nome}`}>
          <Minus size={18} />
        </button>
        <div className="score-stepper__value">
          {/* key={valor}: cada número novo é um elemento novo, então a animação roda a cada mudança */}
          <motion.span key={valor} initial={{ y: -30, opacity: 0 }} animate={{ y: 0, opacity: 1 }}>
            {valor}
          </motion.span>
        </div>
        <button type="button" className="score-stepper__btn" onClick={() => onChange(valor + 1)} aria-label={`Aumentar placar de ${team.nome}`}>
          <Plus size={18} />
        </button>
      </div>
    </div>
  )
}

export function ScoreModal({ match, teamA, teamB, tournament, onClose, onSaved }) {
  const toast = useToast()
  const [placarA, setPlacarA] = useState(match.score_a)
  const [placarB, setPlacarB] = useState(match.score_b)
  const [salvando, setSalvando] = useState(false)
  const [erro, setErro] = useState('')

  const finalizada = match.status === 'FINALIZADO'
  const ehMataMata = tournament.formato === 'eliminatoria'

  // finalizar = false -> placar parcial (continua ao vivo) | true -> encerra a partida
  async function salvar(finalizar) {
    if (finalizar && ehMataMata && placarA === placarB) {
      setErro('No mata-mata não existe empate. Defina um vencedor antes de finalizar.')
      return
    }
    setSalvando(true)
    setErro('')
    try {
      await api.matches.saveResult(match.id, { score_a: placarA, score_b: placarB, finalizar })
      if (!finalizar) {
        toast.info('Placar parcial salvo', `${teamA.tag} ${placarA} x ${placarB} ${teamB.tag}`)
      } else if (placarA === placarB) {
        toast.success('Empate registrado', `Placar final ${placarA} x ${placarB}.`)
      } else {
        const vencedor = placarA > placarB ? teamA : teamB
        toast.success(`Vitória de ${vencedor.nome}!`, `Placar final ${placarA} x ${placarB}.`)
      }
      onSaved()
      onClose()
    } catch (e) {
      setErro(e.message)
      setSalvando(false)
    }
  }

  return (
    <Modal
      title={finalizada ? 'Corrigir resultado' : 'Registrar placar'}
      subtitle={tournament.nome}
      icon={Zap}
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" onClick={onClose} disabled={salvando}>
            Cancelar
          </Button>
          {!finalizada && (
            <Button variant="subtle" icon={Save} disabled={salvando} onClick={() => salvar(false)}>
              Salvar parcial
            </Button>
          )}
          <Button icon={Flag} loading={salvando} onClick={() => salvar(true)}>
            {finalizada ? 'Salvar correção' : 'Finalizar partida'}
          </Button>
        </>
      }
    >
      <div className="score-board">
        <LadoPlacar team={teamA} valor={placarA} onChange={setPlacarA} vencendo={placarA > placarB} />
        <div className="score-board__vs">
          <span>VS</span>
        </div>
        <LadoPlacar team={teamB} valor={placarB} onChange={setPlacarB} vencendo={placarB > placarA} />
      </div>

      {erro && <p className="form-error">{erro}</p>}
      {!finalizada && <p className="score-hint">“Salvar parcial” mantém a partida ao vivo. “Finalizar” encerra e conta para a classificação.</p>}
    </Modal>
  )
}
