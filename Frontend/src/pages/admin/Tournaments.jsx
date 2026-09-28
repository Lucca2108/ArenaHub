import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Plus, Search, Trash2, Trophy } from 'lucide-react'
import { api } from '../../services/api'
import { useToast } from '../../context/ToastContext'
import { PageHeader } from '../../components/ui/PageHeader'
import { Button } from '../../components/ui/Button'
import { Tabs } from '../../components/ui/Tabs'
import { EmptyState, ErrorState } from '../../components/ui/EmptyState'
import { SkeletonGrid } from '../../components/ui/Loader'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { TournamentCard } from '../../components/tournaments/TournamentCard'
import { TournamentForm } from '../../components/tournaments/TournamentForm'
import { indexById, tournamentProgress } from '../../utils/standings'

export function Tournaments() {
  const toast = useToast()
  const navigate = useNavigate()
  const [params] = useSearchParams()

  const [dados, setDados] = useState(null)
  const [erro, setErro] = useState(null)
  const [filtro, setFiltro] = useState('todos')
  const [busca, setBusca] = useState('')

  // Controle dos modais. "?novo=1" na URL já abre o formulário (atalho do topo e do dashboard)
  const [formAberto, setFormAberto] = useState(params.get('novo') === '1')
  const [editando, setEditando] = useState(null) // campeonato sendo editado (null = criando um novo)
  const [excluindo, setExcluindo] = useState(null) // campeonato que vai ser excluído

  async function carregar() {
    try {
      const [tournaments, teams, matches] = await Promise.all([api.tournaments.list(), api.teams.list(), api.matches.list()])
      setDados({ tournaments, teams, matches })
      setErro(null)
    } catch (e) {
      setErro(e)
    }
  }

  useEffect(() => {
    carregar()
  }, [])

  function abrirNovo() {
    setEditando(null)
    setFormAberto(true)
  }

  function abrirEdicao(tournament) {
    setEditando(tournament)
    setFormAberto(true)
  }

  async function salvar(campos) {
    if (editando) {
      await api.tournaments.update(editando.id, campos)
      toast.success('Campeonato atualizado')
      setFormAberto(false)
      carregar()
    } else {
      const novo = await api.tournaments.create(campos)
      toast.success('Campeonato criado!', 'Agora inscreva as equipes participantes.')
      navigate(`/admin/campeonatos/${novo.id}`) // vai direto para os detalhes
    }
  }

  async function excluir() {
    try {
      await api.tournaments.remove(excluindo.id)
      toast.success('Campeonato excluído', excluindo.nome)
      setExcluindo(null)
      carregar()
    } catch (e) {
      toast.error('Não foi possível excluir', e.message)
    }
  }

  const tournaments = dados ? dados.tournaments : []

  // Quantos campeonatos em cada status (números que aparecem nas abas)
  function contar(status) {
    return tournaments.filter((t) => t.status === status).length
  }

  // Aplica o filtro da aba e a busca
  const visiveis = tournaments.filter((t) => {
    const passaFiltro = filtro === 'todos' || t.status === filtro
    const passaBusca = `${t.nome} ${t.jogo}`.toLowerCase().includes(busca.toLowerCase())
    return passaFiltro && passaBusca
  })

  function conteudo() {
    if (erro) return <ErrorState error={erro} onRetry={carregar} />
    if (!dados) return <SkeletonGrid count={3} height={340} />
    if (visiveis.length === 0) {
      return (
        <EmptyState icon={Trophy} title="Nenhum campeonato encontrado">
          Crie um campeonato ou tente outro filtro.
        </EmptyState>
      )
    }

    const teamsById = indexById(dados.teams)
    return (
      <div className="grid-cards">
        {visiveis.map((t, indice) => (
          <TournamentCard
            key={t.id}
            tournament={t}
            teamsById={teamsById}
            progress={tournamentProgress(dados.matches.filter((m) => m.tournament_id === t.id))}
            delay={indice * 0.07}
            onEdit={() => abrirEdicao(t)}
            onDelete={() => setExcluindo(t)}
          />
        ))}
      </div>
    )
  }

  // Não deixa mudar o formato de um campeonato que já tem partidas
  const edicaoTemPartidas = editando != null && dados != null && dados.matches.some((m) => m.tournament_id === editando.id)

  return (
    <>
      <PageHeader
        eyebrow="Gestão"
        title="Campeonatos"
        subtitle="Crie torneios, defina o formato e acompanhe o andamento de cada um."
        actions={
          <Button icon={Plus} onClick={abrirNovo}>
            Novo campeonato
          </Button>
        }
      />

      <div className="toolbar">
        <Tabs
          items={[
            { id: 'todos', label: 'Todos', count: tournaments.length },
            { id: 'INSCRICOES_ABERTAS', label: 'Inscrições', count: contar('INSCRICOES_ABERTAS') },
            { id: 'EM_ANDAMENTO', label: 'Em andamento', count: contar('EM_ANDAMENTO') },
            { id: 'FINALIZADO', label: 'Finalizados', count: contar('FINALIZADO') },
          ]}
          value={filtro}
          onChange={setFiltro}
        />
        <div className="field__control has-icon search">
          <Search size={18} className="field__icon" />
          <input className="input" placeholder="Buscar por nome ou jogo…" value={busca} onChange={(e) => setBusca(e.target.value)} aria-label="Buscar campeonato" />
        </div>
      </div>

      {conteudo()}

      {formAberto && <TournamentForm tournament={editando} lockFormat={edicaoTemPartidas} onClose={() => setFormAberto(false)} onSubmit={salvar} />}

      {excluindo && (
        <ConfirmDialog title="Excluir campeonato?" confirmLabel="Excluir" icon={Trash2} onConfirm={excluir} onClose={() => setExcluindo(null)}>
          <strong>{excluindo.nome}</strong> e todas as suas partidas serão removidos. Essa ação não pode ser desfeita.
        </ConfirmDialog>
      )}
    </>
  )
}
