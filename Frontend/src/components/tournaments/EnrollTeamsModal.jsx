import { useState } from 'react'
import { Check, Search, UserPlus } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { TeamLogo } from '../ui/TeamLogo'
import { api } from '../../services/api'
import { useToast } from '../../context/ToastContext'

// Modal para escolher quais equipes entram no campeonato
export function EnrollTeamsModal({ tournament, teams, onClose, onSaved }) {
  const toast = useToast()
  const [selecionadas, setSelecionadas] = useState([]) // ids das equipes marcadas
  const [busca, setBusca] = useState('')
  const [salvando, setSalvando] = useState(false)

  const vagas = tournament.max_equipes - tournament.team_ids.length

  // Equipes que ainda não estão inscritas e que batem com a busca
  const disponiveis = teams.filter((team) => {
    const jaInscrita = tournament.team_ids.includes(team.id)
    const bateBusca = team.nome.toLowerCase().includes(busca.toLowerCase())
    return !jaInscrita && bateBusca
  })

  function marcarOuDesmarcar(id) {
    if (selecionadas.includes(id)) {
      setSelecionadas(selecionadas.filter((x) => x !== id))
    } else if (selecionadas.length < vagas) {
      setSelecionadas([...selecionadas, id])
    }
  }

  async function inscrever() {
    if (selecionadas.length === 0) return
    setSalvando(true)
    try {
      await api.tournaments.enrollTeams(tournament.id, selecionadas)
      toast.success(selecionadas.length === 1 ? 'Equipe inscrita!' : `${selecionadas.length} equipes inscritas!`)
      onSaved()
      onClose()
    } catch (e) {
      toast.error('Não foi possível inscrever', e.message)
      setSalvando(false)
    }
  }

  return (
    <Modal
      title="Inscrever equipes"
      subtitle={`${vagas - selecionadas.length} vaga(s) restante(s) em ${tournament.nome}`}
      icon={UserPlus}
      onClose={onClose}
      onSubmit={inscrever}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" icon={UserPlus} loading={salvando} disabled={selecionadas.length === 0}>
            Inscrever {selecionadas.length > 0 && `(${selecionadas.length})`}
          </Button>
        </>
      }
    >
      <div className="field__control has-icon enroll__search">
        <Search size={18} className="field__icon" />
        <input className="input" placeholder="Buscar equipe…" value={busca} onChange={(e) => setBusca(e.target.value)} aria-label="Buscar equipe" />
      </div>

      {disponiveis.length === 0 && <p className="muted enroll__empty">Nenhuma equipe disponível.</p>}

      <ul className="enroll__list">
        {disponiveis.map((team) => {
          const marcada = selecionadas.includes(team.id)
          const bloqueada = !marcada && selecionadas.length >= vagas // acabaram as vagas
          return (
            <li key={team.id}>
              <button
                type="button"
                className={`enroll__item ${marcada ? 'is-checked' : ''}`}
                onClick={() => marcarOuDesmarcar(team.id)}
                disabled={bloqueada}
                style={{ '--team': team.cor }}
              >
                <TeamLogo team={team} size={38} />
                <span className="enroll__name">
                  <strong>{team.nome}</strong>
                  <small>{team.jogadores.length} jogadores</small>
                </span>
                <span className="enroll__check">{marcada && <Check size={16} />}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </Modal>
  )
}
