'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { ArrowLeft, Shield, User } from 'lucide-react'
import { Background } from '@/components/layout/Background'
import { BrandMark } from '@/components/layout/BrandMark'
import { api } from '@/services/api'
import type { Team } from '@/types'

export default function TeamDetailsPage() {
  const params = useParams()
  const [team, setTeam] = useState<Team | null>(null)
  const [loading, setLoading] = useState(true)
  useEffect(() => { api.teams.get(Number(params?.id)).then(setTeam).catch(() => setTeam(null)).finally(() => setLoading(false)) }, [params])
  return <main className="public-shell"><Background /><header className="public-header"><BrandMark /><nav className="public-nav"><Link href="/">Início</Link><Link href="/campeonatos">Campeonatos</Link><Link href="/times">Equipes</Link><Link href="/hub">Hub do atleta</Link></nav><Link className="account-button" href="/login">Entrar</Link></header><section className="hub-content"><Link href="/times" className="panel-heading"> <ArrowLeft size={16} /> Voltar para equipes</Link>{loading ? <p className="muted">Carregando equipe…</p> : !team ? <div className="hub-error">Equipe não encontrada.</div> : <><div className="hub-hero"><div><span className="eyebrow">EQUIPE</span><h1>{team.nome}</h1><p>{team.tag} · Capitão: {team.capitao || 'não informado'}</p></div></div><section className="hub-panel"><div className="panel-heading"><h2><Shield size={18} /> Elenco confirmado</h2><span className="muted">{team.members?.filter((m) => m.status === 'ATIVO').length || team.jogadores.length} integrantes</span></div>{team.members?.length ? team.members.filter((m) => m.status === 'ATIVO').map((member) => <div className="hub-row" key={member.id}><User size={16} /><div><strong>{member.nickname}</strong><span>{member.papel === 'CAPITAO' ? 'Capitão' : 'Membro'}</span></div></div>) : team.jogadores.length ? team.jogadores.map((nickname) => <div className="hub-row" key={nickname}><User size={16} /><strong>{nickname}</strong></div>) : <p className="muted">Nenhum integrante confirmado.</p>}</section></>}</section></main>
}
