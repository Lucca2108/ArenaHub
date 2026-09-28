import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { Plus, Search, Shield, Trash2 } from 'lucide-react'
import { api } from '../../services/api'
import { useToast } from '../../context/ToastContext'
import { PageHeader } from '../../components/ui/PageHeader'
import { Button } from '../../components/ui/Button'
import { EmptyState, ErrorState } from '../../components/ui/EmptyState'
import { SkeletonGrid } from '../../components/ui/Loader'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { TeamCard } from '../../components/teams/TeamCard'
import { TeamForm } from '../../components/teams/TeamForm'

export function Teams() {
  const toast = useToast()
  const [params] = useSearchParams()

  const [dados, setDados] = useState(null)
  const [erro, setErro] = useState(null)
  const [busca, setBusca] = useState('')

  // "?nova=1" na URL já abre o formulário (atalho do dashboard)
  const [formAberto, setFormAberto] = useState(params.get('nova') === '1')
  const [editando, setEditando] = useState(null)
  const [excluindo, setExcluindo] = useState(null)

  async function carregar() {
    try {
      const [teams, tournaments] = await Promise.all([api.teams.list(), api.tournaments.list()])
      setDados({ teams, tournaments })
      setErro(null)
    } catch (e) {
      setErro(e)
    }
  }

  useEffect(() => {
    carregar()
  }, [])

  function abrirNova() {
    setEditando(null)
    setFormAberto(true)
  }

  function abrirEdicao(team) {
    setEditando(team)
    setFormAberto(true)
  }

  async function salvar(campos) {
    if (editando) {
      await api.teams.update(editando.id, campos)
      toast.success('Equipe atualizada', campos.nome)
    } else {
      await api.teams.create(campos)
      toast.success('Equipe cadastrada!', `${campos.nome} já pode ser inscrita em campeonatos.`)
    }
    setFormAberto(false)
    carregar()
  }

  async function excluir() {
    try {
      await api.teams.remove(excluindo.id)
      toast.success('Equipe excluída', excluindo.nome)
      carregar()
    } catch (e) {
      toast.error('Não foi possível excluir', e.message)
    }
    setExcluindo(null)
  }

  // Em quantos campeonatos a equipe está inscrita
  function contarCampeonatos(teamId) {
    return dados.tournaments.filter((t) => t.team_ids.includes(teamId)).length
  }

  const teams = dados ? dados.teams : []

  // Busca pelo nome, tag ou nick de algum jogador
  const visiveis = teams.filter((team) => {
    const texto = `${team.nome} ${team.tag} ${team.jogadores.join(' ')}`.toLowerCase()
    return texto.includes(busca.toLowerCase())
  })

  function conteudo() {
    if (erro) return <ErrorState error={erro} onRetry={carregar} />
    if (!dados) return <SkeletonGrid count={8} height={250} className="grid-teams" />
    if (visiveis.length === 0) {
      return (
        <EmptyState icon={Shield} title="Nenhuma equipe encontrada">
          Cadastre uma equipe ou tente outro termo de busca.
        </EmptyState>
      )
    }
    return (
      <div className="grid-teams">
        {visiveis.map((team, indice) => (
          <TeamCard
            key={team.id}
            team={team}
            tournamentsCount={contarCampeonatos(team.id)}
            delay={indice * 0.05}
            onEdit={() => abrirEdicao(team)}
            onDelete={() => setExcluindo(team)}
          />
        ))}
      </div>
    )
  }

  return (
    <>
      <PageHeader
        eyebrow="Gestão"
        title="Equipes"
        subtitle="Cadastre as equipes, monte os elencos e defina os capitães."
        actions={
          <Button icon={Plus} onClick={abrirNova}>
            Nova equipe
          </Button>
        }
      />

      <div className="toolbar">
        <div className="field__control has-icon search">
          <Search size={18} className="field__icon" />
          <input className="input" placeholder="Buscar equipe, tag ou jogador…" value={busca} onChange={(e) => setBusca(e.target.value)} aria-label="Buscar equipe" />
        </div>
        {dados && (
          <span className="muted">
            {visiveis.length} de {teams.length} equipes
          </span>
        )}
      </div>

      {conteudo()}

      {formAberto && <TeamForm team={editando} onClose={() => setFormAberto(false)} onSubmit={salvar} />}

      {excluindo && (
        <ConfirmDialog title="Excluir equipe?" confirmLabel="Excluir" icon={Trash2} onConfirm={excluir} onClose={() => setExcluindo(null)}>
          <strong>{excluindo.nome}</strong> será removida de todos os campeonatos em que está inscrita. Equipes que já disputaram partidas não podem ser excluídas.
        </ConfirmDialog>
      )}
    </>
  )
}
