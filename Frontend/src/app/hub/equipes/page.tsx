'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Plus, Shield, UserPlus } from 'lucide-react'
import { Background } from '@/components/layout/Background'
import { BrandMark } from '@/components/layout/BrandMark'
import { Button } from '@/components/ui/Button'
import { TeamForm } from '@/components/teams/TeamForm'
import { api } from '@/services/api'
import { getSession } from '@/services/session'
import { mensagemDoErro } from '@/services/errors'
import type { Team } from '@/types'

export default function MyTeamsPage() {
  const [teams, setTeams] = useState<Team[]>([])
  const [form, setForm] = useState(false)
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(true)
  async function load() { try { if (!getSession()) return; setTeams(await api.athlete.teams()) } catch (e) { setMessage(mensagemDoErro(e)) } finally { setLoading(false) } }
  useEffect(() => { load() }, [])
  async function create(data: Parameters<typeof api.teams.create>[0]) { await api.teams.create(data); setForm(false); await load() }
  async function invite(team: Team) {
    const nickname = window.prompt('Nickname do atleta que receberá o convite:')
    if (!nickname) return
    try { const result = await api.athlete.inviteMember(team.id, { nickname }); setMessage(`Convite criado para ${result.nickname}. Token: ${result.invite_token || 'enviado'}`); await load() } catch (e) { setMessage(mensagemDoErro(e)) }
  }
  return <main className="public-shell"><Background /><header className="public-header"><BrandMark /><nav className="public-nav"><Link href="/hub">Hub</Link><Link href="/campeonatos">Campeonatos</Link><Link href="/hub/equipes">Minhas equipes</Link><Link href="/hub/perfil">Perfil</Link></nav></header><section className="hub-content"><div className="hub-hero"><div><span className="eyebrow">ELENCOS</span><h1>Minhas equipes</h1><p>Crie uma equipe, gerencie o elenco e convide outros atletas.</p></div><Button icon={Plus} onClick={() => setForm(true)}>Nova equipe</Button></div>{message && <div className="hub-error">{message}</div>}{loading ? <p className="muted">Carregando equipes…</p> : <div className="hub-grid">{teams.map((team) => <section className="hub-panel" key={team.id}><div className="panel-heading"><h2><Shield size={18} /> {team.nome}</h2><button className="account-button" onClick={() => invite(team)}><UserPlus size={15} /> Convidar</button></div><p className="muted">{team.tag} · capitão: {team.capitao}</p><div className="hub-tournaments">{(team.members?.length ? team.members.map((member) => `${member.nickname} · ${member.status}`) : team.jogadores).map((member) => <div className="hub-row" key={member}><UsersIcon /><span>{member}</span></div>)}</div></section>)}{!teams.length && <p className="muted">Você ainda não criou uma equipe.</p>}</div>}{form && <TeamForm team={null} onClose={() => setForm(false)} onSubmit={create} />}</section></main>
}

function UsersIcon() { return <UserPlus size={15} /> }
