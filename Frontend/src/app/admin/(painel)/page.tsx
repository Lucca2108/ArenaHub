'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { CalendarClock, ChevronRight, Plus, Radio, Shield, Swords, Trophy, UserPlus, Users } from 'lucide-react'
import type { Match, Team, Tournament } from '@/types'
import { api } from '@/services/api'
import { mensagemDoErro } from '@/services/errors'
import { useAuth } from '@/context/AuthContext'
import { AnimatedNumber } from '@/components/ui/AnimatedNumber'
import { Button } from '@/components/ui/Button'
import { TournamentBadge } from '@/components/ui/Badge'
import { EmptyState, ErrorState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Loader'
import { SpotlightCard } from '@/components/ui/SpotlightCard'
import { MatchCard } from '@/components/matches/MatchCard'
import { getGame } from '@/utils/constants'
import { matchRoundLabel } from '@/utils/bracket'
import { teamsPorId, tournamentProgress, tournamentsPorId } from '@/utils/standings'
import { plural } from '@/utils/format'

// Tudo que a tela precisa carregar
interface Dados {
  tournaments: Tournament[]
  teams: Team[]
  matches: Match[]
}

function saudacao(): string {
  const hora = new Date().getHours()
  if (hora < 12) return 'Bom dia'
  if (hora < 18) return 'Boa tarde'
  return 'Boa noite'
}

function ehHoje(data: string | null): boolean {
  if (!data) return false
  return new Date(data).toDateString() === new Date().toDateString()
}

// ordena partidas pela data (as sem data vão para o final)
function porData(a: Match, b: Match): number {
  if (!a.data_hora) return 1
  if (!b.data_hora) return -1
  return new Date(a.data_hora).getTime() - new Date(b.data_hora).getTime()
}

// Página /admin
export default function DashboardPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [dados, setDados] = useState<Dados | null>(null)
  const [erro, setErro] = useState<string | null>(null)

  async function carregar() {
    try {
      // Promise.all faz as 3 buscas ao mesmo tempo e espera todas terminarem
      const [tournaments, teams, matches] = await Promise.all([api.tournaments.list(), api.teams.list(), api.matches.list()])
      setDados({ tournaments, teams, matches })
      setErro(null)
    } catch (e) {
      setErro(mensagemDoErro(e))
    }
  }

  // [] = roda só uma vez, quando a tela abre
  useEffect(() => {
    carregar()
  }, [])

  if (erro) return <ErrorState mensagem={erro} onRetry={carregar} />
  if (!dados) {
    return (
      <div className="stack-lg">
        <Skeleton height={200} />
        <Skeleton height={150} />
        <Skeleton height={400} />
      </div>
    )
  }

  const { tournaments, teams, matches } = dados
  const teamsById = teamsPorId(teams)
  const tournamentsById = tournamentsPorId(tournaments)

  // Números do painel
  const partidasReais = matches.filter((m) => m.team_b_id !== null) // ignora "byes"
  const aoVivo = partidasReais.filter((m) => m.status === 'EM_ANDAMENTO')
  const agendadas = partidasReais.filter((m) => m.status === 'AGENDADO').sort(porData)
  const finalizadas = partidasReais.filter((m) => m.status === 'FINALIZADO')
  const campeonatosAtivos = tournaments.filter((t) => t.status !== 'FINALIZADO')
  const partidasHoje = agendadas.filter((m) => ehHoje(m.data_hora)).length + aoVivo.length
  const primeiroNome = user ? user.nome.split(' ')[0] : ''

  const indicadores = [
    { label: 'Campeonatos ativos', value: campeonatosAtivos.length, sub: `${tournaments.length} no total`, icon: Trophy, cor: 'var(--cyan)' },
    { label: 'Equipes', value: teams.length, sub: 'cadastradas no sistema', icon: Users, cor: 'var(--violet)' },
    { label: 'Partidas agendadas', value: agendadas.length, sub: `${finalizadas.length} já finalizadas`, icon: CalendarClock, cor: 'var(--amber)' },
    { label: 'Ao vivo agora', value: aoVivo.length, sub: aoVivo.length > 0 ? 'Acompanhe o placar' : 'Nenhuma partida rolando', icon: Radio, cor: 'var(--red)' },
  ]

  function mostrarPartida(m: Match, indice: number) {
    const tournament = tournamentsById[m.tournament_id]
    return (
      <MatchCard
        key={m.id}
        match={m}
        teamA={teamsById[m.team_a_id]}
        teamB={m.team_b_id !== null ? teamsById[m.team_b_id] : undefined}
        label={`${tournament.nome} · ${matchRoundLabel(m, tournament, matches)}`}
        delay={indice * 0.08}
      />
    )
  }

  return (
    <div className="stack-lg">
      {/* Boas-vindas */}
      <motion.section className="hero" initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}>
        <div className="hero__content">
          <span className="eyebrow">Painel do organizador</span>
          <h1 className="hero__title">
            {saudacao()}, <span className="text-grad text-grad--animated">{primeiroNome}</span>
          </h1>
          <p className="hero__text">
            {partidasHoje > 0 ? `Hoje tem ${plural(partidasHoje, 'partida')} na sua arena.` : 'Nenhuma partida para hoje. Que tal agendar a próxima rodada?'}
          </p>
          <div className="hero__actions">
            <Button icon={Plus} onClick={() => router.push('/admin/campeonatos?novo=1')}>
              Novo campeonato
            </Button>
            <Button variant="ghost" icon={Swords} onClick={() => router.push('/admin/partidas')}>
              Gerenciar partidas
            </Button>
          </div>
        </div>
        <div className="hero__art" aria-hidden="true">
          <div className="hero__ring hero__ring--1" />
          <div className="hero__ring hero__ring--2" />
          <div className="hero__ring hero__ring--3" />
          <div className="hero__trophy">
            <Trophy size={64} strokeWidth={1.4} />
          </div>
        </div>
        <div className="hero__stripes" aria-hidden="true" />
      </motion.section>

      {/* Indicadores */}
      <section className="stats">
        {indicadores.map((item, indice) => {
          const Icone = item.icon
          return (
            <SpotlightCard
              key={item.label}
              className="stat"
              style={{ '--tone': item.cor }}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 + indice * 0.08 }}
            >
              <div className="stat__deco" />
              <span className="stat__icon">
                <Icone size={22} />
              </span>
              <div className="stat__value">
                <AnimatedNumber value={item.value} />
              </div>
              <div className="stat__label">{item.label}</div>
              <div className="stat__sub">{item.sub}</div>
            </SpotlightCard>
          )
        })}
      </section>

      {aoVivo.length > 0 && (
        <section>
          <div className="section-head">
            <h2 className="section-title section-title--live">
              <span className="live-dot live-dot--red" /> Ao vivo agora
            </h2>
            <button type="button" className="link-btn" onClick={() => router.push('/admin/partidas')}>
              Atualizar placar <ChevronRight size={16} />
            </button>
          </div>
          <div className="grid-matches">{aoVivo.map(mostrarPartida)}</div>
        </section>
      )}

      <div className="dash-grid">
        <section className="panel">
          <div className="panel__head">
            <h2 className="panel__title">
              <CalendarClock size={18} /> Próximas partidas
            </h2>
            <button type="button" className="link-btn" onClick={() => router.push('/admin/partidas')}>
              Ver todas <ChevronRight size={16} />
            </button>
          </div>
          <div className="panel__body">
            {agendadas.length === 0 ? (
              <EmptyState icon={Swords} title="Sem partidas agendadas">
                Gere as partidas de um campeonato para elas aparecerem aqui.
              </EmptyState>
            ) : (
              <div className="stack">{agendadas.slice(0, 4).map(mostrarPartida)}</div>
            )}
          </div>
        </section>

        <div className="stack">
          <section className="panel">
            <div className="panel__head">
              <h2 className="panel__title">
                <Trophy size={18} /> Campeonatos
              </h2>
              <button type="button" className="link-btn" onClick={() => router.push('/admin/campeonatos')}>
                Ver todos <ChevronRight size={16} />
              </button>
            </div>
            <div className="panel__body">
              <ul className="t-rows">
                {tournaments.slice(0, 5).map((t) => {
                  const progresso = tournamentProgress(matches.filter((m) => m.tournament_id === t.id))
                  return (
                    <li key={t.id}>
                      <button type="button" className="t-row" style={{ '--game': getGame(t.jogo).color }} onClick={() => router.push(`/admin/campeonatos/${t.id}`)}>
                        <span className="t-row__bar" />
                        <span className="t-row__main">
                          <strong>{t.nome}</strong>
                          <small>
                            {t.jogo} · {t.team_ids.length}/{t.max_equipes} equipes
                          </small>
                          <span className="t-row__progress">
                            <motion.span initial={{ width: 0 }} animate={{ width: `${progresso.pct}%` }} transition={{ duration: 1, delay: 0.4 }} />
                          </span>
                        </span>
                        <TournamentBadge status={t.status} />
                      </button>
                    </li>
                  )
                })}
              </ul>
            </div>
          </section>

          <section className="panel">
            <div className="panel__head">
              <h2 className="panel__title">
                <Shield size={18} /> Ações rápidas
              </h2>
            </div>
            <div className="panel__body quick-actions">
              <button type="button" className="quick-action" onClick={() => router.push('/admin/campeonatos?novo=1')}>
                <Trophy size={22} />
                <span>Criar campeonato</span>
              </button>
              <button type="button" className="quick-action" onClick={() => router.push('/admin/equipes?nova=1')}>
                <UserPlus size={22} />
                <span>Cadastrar equipe</span>
              </button>
              <button type="button" className="quick-action" onClick={() => router.push('/admin/partidas?status=EM_ANDAMENTO')}>
                <Radio size={22} />
                <span>Placar ao vivo</span>
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
