'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { CalendarClock, CheckCircle2, Search, Swords, Trophy, type LucideIcon } from 'lucide-react'
import type { Match, MatchStatus, Team, Tournament } from '@/types'
import { api } from '@/services/api'
import { mensagemDoErro } from '@/services/errors'
import { useToast } from '@/context/ToastContext'
import { PageHeader } from '@/components/ui/PageHeader'
import { Tabs } from '@/components/ui/Tabs'
import { EmptyState, ErrorState } from '@/components/ui/EmptyState'
import { SkeletonGrid } from '@/components/ui/Loader'
import { MatchCard } from '@/components/matches/MatchCard'
import { ScoreModal } from '@/components/matches/ScoreModal'
import { ScheduleModal } from '@/components/matches/ScheduleModal'
import { matchRoundLabel } from '@/utils/bracket'
import { teamsPorId, tournamentsPorId } from '@/utils/standings'

interface Dados {
  tournaments: Tournament[]
  teams: Team[]
  matches: Match[]
}

interface Secao {
  status: MatchStatus
  titulo: string
  icon?: LucideIcon
}

// A seção já com as partidas que vão aparecer nela
interface SecaoComPartidas extends Secao {
  partidas: Match[]
}

// As três seções da tela, na ordem em que aparecem
const SECOES: Secao[] = [
  { status: 'EM_ANDAMENTO', titulo: 'Ao vivo' },
  { status: 'AGENDADO', titulo: 'Agendadas', icon: CalendarClock },
  { status: 'FINALIZADO', titulo: 'Finalizadas', icon: CheckCircle2 },
]

function porData(a: Match, b: Match): number {
  if (!a.data_hora) return 1
  if (!b.data_hora) return -1
  return new Date(a.data_hora).getTime() - new Date(b.data_hora).getTime()
}

// Página /admin/partidas
export default function PartidasPage() {
  const toast = useToast()
  const params = useSearchParams()

  const [dados, setDados] = useState<Dados | null>(null)
  const [erro, setErro] = useState<string | null>(null)
  // "?status=EM_ANDAMENTO" na URL já abre filtrado (atalho do dashboard)
  const [filtroStatus, setFiltroStatus] = useState(params.get('status') || 'todas')
  const [filtroCampeonato, setFiltroCampeonato] = useState('')
  const [busca, setBusca] = useState('')

  // Partida escolhida para cada modal (null = modal fechado)
  const [partidaAgendar, setPartidaAgendar] = useState<Match | null>(null)
  const [partidaPlacar, setPartidaPlacar] = useState<Match | null>(null)
  const [iniciandoId, setIniciandoId] = useState<number | null>(null) // mostra "carregando" no botão Iniciar

  async function carregar() {
    try {
      const [tournaments, teams, matches] = await Promise.all([api.tournaments.list(), api.teams.list(), api.matches.list()])
      setDados({ tournaments, teams, matches })
      setErro(null)
    } catch (e) {
      setErro(mensagemDoErro(e))
    }
  }

  useEffect(() => {
    carregar()
  }, [])

  async function iniciar(partida: Match) {
    setIniciandoId(partida.id)
    try {
      await api.matches.start(partida.id)
      toast.success('Partida iniciada!', 'Ela já aparece como AO VIVO.')
      await carregar()
    } catch (e) {
      toast.error('Não foi possível iniciar', mensagemDoErro(e))
    }
    setIniciandoId(null)
  }

  if (erro) return <ErrorState mensagem={erro} onRetry={carregar} />

  const teamsById: Record<number, Team> = dados ? teamsPorId(dados.teams) : {}
  const tournamentsById: Record<number, Tournament> = dados ? tournamentsPorId(dados.tournaments) : {}
  const todas = dados ? dados.matches : []

  // Aplica os filtros de campeonato e de busca (e esconde os "byes")
  const filtradas = todas.filter((m) => {
    if (m.team_b_id === null) return false
    if (filtroCampeonato && m.tournament_id !== Number(filtroCampeonato)) return false
    const nomes = `${teamsById[m.team_a_id].nome} ${teamsById[m.team_b_id].nome}`.toLowerCase()
    return nomes.includes(busca.toLowerCase())
  })

  function contar(status: MatchStatus): number {
    return filtradas.filter((m) => m.status === status).length
  }

  // 1) Seções da aba escolhida, cada uma com suas partidas
  const secoes: SecaoComPartidas[] = []
  for (const secao of SECOES) {
    if (filtroStatus !== 'todas' && secao.status !== filtroStatus) continue
    const partidas = filtradas.filter((m) => m.status === secao.status).sort(porData)
    if (secao.status === 'FINALIZADO') partidas.reverse() // finalizadas: mais recentes primeiro
    // 2) Só entra na tela se tiver alguma partida
    if (partidas.length > 0) secoes.push({ ...secao, partidas })
  }

  function conteudo() {
    if (!dados) return <SkeletonGrid count={4} height={190} className="grid-matches" />
    if (secoes.length === 0) {
      return (
        <EmptyState icon={Swords} title="Nenhuma partida por aqui">
          As partidas aparecem depois que você gera a tabela de um campeonato.
        </EmptyState>
      )
    }

    return (
      <div className="stack-lg">
        {secoes.map((secao) => {
          const Icone = secao.icon
          return (
            <section key={secao.status}>
              <div className="section-head">
                <h2 className={`section-title ${secao.status === 'EM_ANDAMENTO' ? 'section-title--live' : ''}`}>
                  {Icone ? <Icone size={18} /> : <span className="live-dot live-dot--red" />} {secao.titulo}
                  <span className="section-title__count">{secao.partidas.length}</span>
                </h2>
              </div>
              <div className="grid-matches">
                {secao.partidas.map((m, indice) => {
                  const tournament = tournamentsById[m.tournament_id]
                  return (
                    <MatchCard
                      key={m.id}
                      match={m}
                      teamA={teamsById[m.team_a_id]}
                      teamB={m.team_b_id !== null ? teamsById[m.team_b_id] : undefined}
                      label={`${tournament.nome} · ${matchRoundLabel(m, tournament, todas)}`}
                      delay={indice * 0.05}
                      busy={iniciandoId === m.id}
                      onSchedule={setPartidaAgendar}
                      onStart={iniciar}
                      onResult={setPartidaPlacar}
                    />
                  )
                })}
              </div>
            </section>
          )
        })}
      </div>
    )
  }

  return (
    <>
      <PageHeader eyebrow="Operação" title="Partidas" subtitle="Agende horários, inicie as partidas e registre os placares em tempo real." />

      <div className="toolbar">
        <Tabs
          items={[
            { id: 'todas', label: 'Todas', count: filtradas.length },
            { id: 'EM_ANDAMENTO', label: 'Ao vivo', count: contar('EM_ANDAMENTO') },
            { id: 'AGENDADO', label: 'Agendadas', count: contar('AGENDADO') },
            { id: 'FINALIZADO', label: 'Finalizadas', count: contar('FINALIZADO') },
          ]}
          value={filtroStatus}
          onChange={setFiltroStatus}
        />
        <div className="toolbar__group">
          <div className="field__control has-icon">
            <Trophy size={18} className="field__icon" />
            <select className="input" value={filtroCampeonato} onChange={(e) => setFiltroCampeonato(e.target.value)} aria-label="Filtrar por campeonato">
              <option value="">Todos os campeonatos</option>
              {dados &&
                dados.tournaments.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nome}
                  </option>
                ))}
            </select>
          </div>
          <div className="field__control has-icon search">
            <Search size={18} className="field__icon" />
            <input className="input" placeholder="Buscar equipe…" value={busca} onChange={(e) => setBusca(e.target.value)} aria-label="Buscar por equipe" />
          </div>
        </div>
      </div>

      {conteudo()}

      {partidaAgendar && partidaAgendar.team_b_id !== null && (
        <ScheduleModal
          match={partidaAgendar}
          teamA={teamsById[partidaAgendar.team_a_id]}
          teamB={teamsById[partidaAgendar.team_b_id]}
          onClose={() => setPartidaAgendar(null)}
          onSaved={carregar}
        />
      )}

      {partidaPlacar && partidaPlacar.team_b_id !== null && (
        <ScoreModal
          match={partidaPlacar}
          teamA={teamsById[partidaPlacar.team_a_id]}
          teamB={teamsById[partidaPlacar.team_b_id]}
          tournament={tournamentsById[partidaPlacar.tournament_id]}
          onClose={() => setPartidaPlacar(null)}
          onSaved={carregar}
        />
      )}
    </>
  )
}
