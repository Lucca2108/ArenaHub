'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { CalendarDays, LogOut, Plus, Shield, Swords, Trophy, Users } from 'lucide-react'
import { Background } from '@/components/layout/Background'
import { BrandMark } from '@/components/layout/BrandMark'
import { Button } from '@/components/ui/Button'
import { TeamForm } from '@/components/teams/TeamForm'
import { api } from '@/services/api'
import { clearSession, getSession } from '@/services/session'
import { mensagemDoErro } from '@/services/errors'
import type { Match, Team, Tournament, User } from '@/types'

export default function HubPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [teams, setTeams] = useState<Team[]>([])
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [matches, setMatches] = useState<Match[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [teamForm, setTeamForm] = useState(false)
  const [saving, setSaving] = useState(false)

  async function carregar() {
    try {
      const sessao = getSession()
      if (!sessao) { router.replace('/login'); return }
      if (sessao.user.role === 'organizador') { router.replace('/admin'); return }
      setUser(sessao.user)
      const [perfil, minhasEquipes, meusCampeonatos, minhasPartidas] = await Promise.all([
        api.profile.get(), api.athlete.teams(), api.athlete.tournaments(), api.athlete.matches(),
      ])
      setUser(perfil); setTeams(minhasEquipes); setTournaments(meusCampeonatos); setMatches(minhasPartidas); setError('')
    } catch (e) { setError(mensagemDoErro(e)) } finally { setLoading(false) }
  }

  useEffect(() => { carregar() }, [])

  async function criarEquipe(dados: Parameters<typeof api.teams.create>[0]) {
    setSaving(true)
    try { await api.teams.create(dados); setTeamForm(false); await carregar() }
    catch (e) { setError(mensagemDoErro(e)) }
    finally { setSaving(false) }
  }

  async function inscrever(tournament: Tournament) {
    const equipe = teams[0]
    if (!equipe) { setError('Crie uma equipe antes de fazer uma inscrição.'); return }
    try { await api.athlete.enrollTeam(tournament.id, equipe.id); await carregar() }
    catch (e) { setError(mensagemDoErro(e)) }
  }

  function sair() {
    clearSession(); router.replace('/login')
  }

  const proximas = matches.filter((match) => match.status !== 'FINALIZADO').slice(0, 5)

  return (
    <main className="public-shell">
      <Background />
      <header className="public-header"><BrandMark /><nav className="public-nav"><Link href="/hub">Hub</Link><Link href="/campeonatos">Campeonatos</Link><Link href="/hub/equipes">Minhas equipes</Link><Link href="/hub/perfil">Perfil</Link></nav><button className="account-button" onClick={sair}><LogOut size={16} /> Sair</button></header>
      <section className="hub-content">
        <div className="hub-hero"><div><span className="eyebrow">PORTAL DO ATLETA</span><h1>Bem-vindo, <strong>{user?.nickname || user?.nome || 'atleta'}</strong>.</h1><p>Acompanhe suas equipes, campeonatos e próximas partidas em um só lugar.</p></div><Button icon={Plus} onClick={() => setTeamForm(true)}>Criar equipe</Button></div>
        {error && <div className="hub-error">{error}</div>}
        <div className="hub-stats"><article><Trophy /><strong>{loading ? '—' : tournaments.length}</strong><span>Campeonatos</span></article><article><Users /><strong>{loading ? '—' : teams.length}</strong><span>Equipes</span></article><article><CalendarDays /><strong>{loading ? '—' : proximas.length}</strong><span>Próximas partidas</span></article><article><Swords /><strong>{loading ? '—' : matches.filter((m) => m.status === 'FINALIZADO').length}</strong><span>Partidas finalizadas</span></article></div>
        <div className="hub-grid">
          <section className="hub-panel"><div className="panel-heading"><h2>Minhas equipes</h2><Link href="/hub/equipes">Ver todas</Link></div>{teams.length === 0 && !loading ? <Empty icon={<Shield />} title="Você ainda não tem equipe" text="Crie sua equipe e torne-se capitão." action={() => setTeamForm(true)} /> : teams.map((team) => <div className="hub-row" key={team.id}><Shield /><div><strong>{team.nome}</strong><span>{team.tag} · {team.jogadores.length} integrantes</span></div><span className="status-pill">Capitão</span></div>)}</section>
          <section className="hub-panel"><div className="panel-heading"><h2>Meus campeonatos</h2><Link href="/campeonatos">Explorar</Link></div>{tournaments.length === 0 && !loading ? <Empty icon={<Trophy />} title="Nenhuma inscrição ainda" text="Explore campeonatos abertos e inscreva sua equipe." action={() => router.push('/campeonatos')} /> : tournaments.map((tournament) => <div className="hub-row" key={tournament.id}><Trophy /><div><strong>{tournament.nome}</strong><span>{tournament.jogo} · {tournament.status}</span></div></div>)}</section>
        </div>
        <section className="hub-panel hub-panel-wide"><div className="panel-heading"><h2>Campeonatos abertos para inscrição</h2><Link href="/campeonatos">Ver campeonatos</Link></div>{loading ? <p className="muted">Carregando dados da API…</p> : <PublicTournaments onEnroll={inscrever} />}</section>
      </section>
      {teamForm && <TeamForm team={null} onClose={() => setTeamForm(false)} onSubmit={criarEquipe} />}
      {saving && <div className="hub-saving">Salvando…</div>}
    </main>
  )
}

function Empty({ icon, title, text, action }: { icon: React.ReactNode; title: string; text: string; action: () => void }) {
  return <div className="hub-empty"><div className="empty-icon">{icon}</div><strong>{title}</strong><span>{text}</span><button onClick={action}>Começar agora</button></div>
}

function PublicTournaments({ onEnroll }: { onEnroll: (tournament: Tournament) => void }) {
  const [items, setItems] = useState<Tournament[]>([])
  useEffect(() => { api.tournaments.list().then((all) => setItems(all.filter((item) => item.status === 'INSCRICOES_ABERTAS'))).catch(() => setItems([])) }, [])
  if (!items.length) return <p className="muted">Nenhum campeonato aberto no momento.</p>
  return <div className="hub-tournaments">{items.slice(0, 4).map((item) => <div className="hub-row" key={item.id}><Trophy /><div><strong>{item.nome}</strong><span>{item.jogo} · até {item.max_equipes} equipes</span></div><button className="inline-action" onClick={() => onEnroll(item)}>Inscrever equipe</button></div>)}</div>
}
