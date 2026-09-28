import { useState } from 'react'
import { Award, GitBranch, ListOrdered, Save, Trophy, Users } from 'lucide-react'
import { Modal } from '../ui/Modal'
import { Button } from '../ui/Button'
import { Field } from '../ui/Field'
import { FORMATS, GAMES, TOURNAMENT_STATUS } from '../../utils/constants'
import { toInputDate } from '../../utils/format'

const TAMANHOS = [4, 8, 16, 32]

// Converte "2026-10-04" (valor do input de data) para o formato ISO que vai para a API
function dataParaIso(valor, hora) {
  if (!valor) return null
  return new Date(`${valor}T${hora}`).toISOString()
}

// Formulário de criar/editar campeonato.
// Se receber "tournament", é edição (campos já preenchidos); senão é criação.
export function TournamentForm({ tournament, lockFormat = false, onClose, onSubmit }) {
  const editando = tournament != null

  // Um estado para cada campo do formulário
  const [nome, setNome] = useState(editando ? tournament.nome : '')
  const [jogo, setJogo] = useState(editando ? tournament.jogo : 'Valorant')
  const [formato, setFormato] = useState(editando ? tournament.formato : 'pontos_corridos')
  const [descricao, setDescricao] = useState(editando ? tournament.descricao : '')
  const [dataInicio, setDataInicio] = useState(editando ? toInputDate(tournament.data_inicio) : '')
  const [dataFim, setDataFim] = useState(editando ? toInputDate(tournament.data_fim) : '')
  const [maxEquipes, setMaxEquipes] = useState(editando ? tournament.max_equipes : 8)
  const [premiacao, setPremiacao] = useState(editando ? tournament.premiacao : '')
  const [status, setStatus] = useState(editando ? tournament.status : 'INSCRICOES_ABERTAS')

  const [erros, setErros] = useState({})
  const [erroServidor, setErroServidor] = useState('')
  const [salvando, setSalvando] = useState(false)

  function validar() {
    const novosErros = {}
    if (nome.trim().length < 3) novosErros.nome = 'O nome precisa ter pelo menos 3 caracteres.'
    if (Number(maxEquipes) < 2 || Number(maxEquipes) > 64) novosErros.max_equipes = 'Use entre 2 e 64 equipes.'
    if (dataInicio && dataFim && dataFim < dataInicio) novosErros.data_fim = 'O fim não pode ser antes do início.'
    setErros(novosErros)
    // se o objeto de erros está vazio, o formulário é válido
    return Object.keys(novosErros).length === 0
  }

  async function salvar() {
    if (!validar()) return

    const dados = {
      nome: nome.trim(),
      jogo,
      formato,
      descricao: descricao.trim(),
      data_inicio: dataParaIso(dataInicio, '19:00'),
      data_fim: dataParaIso(dataFim, '23:00'),
      max_equipes: Number(maxEquipes),
      premiacao: premiacao.trim(),
    }
    if (editando) dados.status = status

    setSalvando(true)
    setErroServidor('')
    try {
      await onSubmit(dados)
    } catch (e) {
      setErroServidor(e.message)
      setSalvando(false)
    }
  }

  return (
    <Modal
      title={editando ? 'Editar campeonato' : 'Novo campeonato'}
      subtitle={editando ? tournament.nome : 'Configure o torneio; depois é só inscrever as equipes.'}
      icon={Trophy}
      size="lg"
      onClose={onClose}
      onSubmit={salvar}
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button type="submit" icon={Save} loading={salvando}>
            {editando ? 'Salvar alterações' : 'Criar campeonato'}
          </Button>
        </>
      }
    >
      <div className="form-grid">
        <Field label="Nome do campeonato" error={erros.nome} icon={Trophy} className="span-2">
          <input className="input" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Ex.: Copa UNIT Valorant" maxLength={80} autoFocus />
        </Field>

        <Field label="Jogo" as="div" className="span-2">
          <div className="game-picker">
            {GAMES.map((game) => (
              <button
                key={game.id}
                type="button"
                className={`game-chip ${jogo === game.id ? 'is-active' : ''}`}
                style={{ '--game': game.color }}
                onClick={() => setJogo(game.id)}
              >
                <span className="game-chip__short">{game.short}</span>
                <span className="game-chip__name">{game.id}</span>
              </button>
            ))}
          </div>
        </Field>

        <Field label="Formato" as="div" className="span-2" hint={lockFormat ? 'O formato não muda depois que as partidas foram geradas.' : undefined}>
          <div className="format-picker">
            <button
              type="button"
              className={`format-card ${formato === 'pontos_corridos' ? 'is-active' : ''}`}
              onClick={() => setFormato('pontos_corridos')}
              disabled={lockFormat && formato !== 'pontos_corridos'}
            >
              <ListOrdered size={24} />
              <div>
                <strong>{FORMATS.pontos_corridos.label}</strong>
                <span>{FORMATS.pontos_corridos.description}</span>
              </div>
            </button>
            <button
              type="button"
              className={`format-card ${formato === 'eliminatoria' ? 'is-active' : ''}`}
              onClick={() => setFormato('eliminatoria')}
              disabled={lockFormat && formato !== 'eliminatoria'}
            >
              <GitBranch size={24} />
              <div>
                <strong>{FORMATS.eliminatoria.label}</strong>
                <span>{FORMATS.eliminatoria.description}</span>
              </div>
            </button>
          </div>
        </Field>

        <Field label="Descrição" className="span-2">
          <textarea className="input" value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="Regras, formato das partidas (MD1, MD3), requisitos…" rows={3} maxLength={500} />
        </Field>

        <Field label="Início">
          <input className="input" type="date" value={dataInicio} onChange={(e) => setDataInicio(e.target.value)} />
        </Field>
        <Field label="Término" error={erros.data_fim}>
          <input className="input" type="date" value={dataFim} onChange={(e) => setDataFim(e.target.value)} />
        </Field>

        <Field label="Máximo de equipes" error={erros.max_equipes} as="div">
          <div className="size-picker">
            {TAMANHOS.map((n) => (
              <button key={n} type="button" className={`size-chip ${Number(maxEquipes) === n ? 'is-active' : ''}`} onClick={() => setMaxEquipes(n)}>
                {n}
              </button>
            ))}
            <div className="field__control has-icon size-picker__input">
              <Users size={18} className="field__icon" />
              <input className="input" type="number" min={2} max={64} value={maxEquipes} onChange={(e) => setMaxEquipes(e.target.value)} aria-label="Máximo de equipes" />
            </div>
          </div>
        </Field>

        <Field label="Premiação" icon={Award}>
          <input className="input" value={premiacao} onChange={(e) => setPremiacao(e.target.value)} placeholder="Ex.: R$ 500 + troféu" maxLength={80} />
        </Field>

        {editando && (
          <Field label="Status" className="span-2">
            <select className="input" value={status} onChange={(e) => setStatus(e.target.value)}>
              <option value="INSCRICOES_ABERTAS">{TOURNAMENT_STATUS.INSCRICOES_ABERTAS.label}</option>
              <option value="EM_ANDAMENTO">{TOURNAMENT_STATUS.EM_ANDAMENTO.label}</option>
              <option value="FINALIZADO">{TOURNAMENT_STATUS.FINALIZADO.label}</option>
            </select>
          </Field>
        )}
      </div>

      {erroServidor && <p className="form-error">{erroServidor}</p>}
    </Modal>
  )
}
