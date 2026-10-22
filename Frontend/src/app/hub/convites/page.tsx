'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Check, Inbox, X } from 'lucide-react'
import { Background } from '@/components/layout/Background'
import { BrandMark } from '@/components/layout/BrandMark'
import { Button } from '@/components/ui/Button'
import { api } from '@/services/api'
import { mensagemDoErro } from '@/services/errors'
import type { ReceivedInvite } from '@/types'

export default function InvitesPage() {
  const [invites, setInvites] = useState<ReceivedInvite[]>([])
  const [loading, setLoading] = useState(true)
  const [message, setMessage] = useState('')

  async function load() {
    try { setInvites(await api.athlete.invites()) } catch (error) { setMessage(mensagemDoErro(error)) } finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  async function accept(invite: ReceivedInvite) {
    try { await api.athlete.acceptReceivedInvite(invite.id); setMessage('Convite aceito. A equipe agora está em Minhas equipes.'); await load() } catch (error) { setMessage(mensagemDoErro(error)) }
  }

  async function decline(invite: ReceivedInvite) {
    try { await api.athlete.declineInvite(invite.id); await load() } catch (error) { setMessage(mensagemDoErro(error)) }
  }

  return <main className="public-shell"><Background /><header className="public-header"><BrandMark /><nav className="public-nav"><Link href="/hub">Hub</Link><Link href="/hub/equipes">Minhas equipes</Link><Link href="/hub/convites">Convites</Link><Link href="/hub/perfil">Perfil</Link></nav></header><section className="hub-content"><div className="hub-hero"><div><span className="eyebrow">CENTRAL DE CONVITES</span><h1>Convites recebidos</h1><p> aceite apenas convites destinados à sua conta.</p></div></div>{message && <div className="hub-error">{message}</div>}{loading ? <p className="muted">Carregando convites…</p> : !invites.length ? <div className="hub-empty"><div className="empty-icon"><Inbox /></div><strong>Nenhum convite pendente</strong><span>Quando um capitão convidar você, o convite aparecerá aqui.</span></div> : <div className="hub-grid">{invites.map((invite) => <article className="hub-panel" key={invite.id}><div className="panel-heading"><div className="team-invite-brand" style={{ '--team': invite.team_cor } as React.CSSProperties}><span>{invite.team_tag.slice(0, 3)}</span></div><div><h2>{invite.team_nome}</h2><p className="muted">Capitão: {invite.capitao}</p></div></div><p>Convite enviado em {new Date(invite.created_at).toLocaleDateString('pt-BR')}.</p><div className="invite-actions"><Button icon={Check} onClick={() => accept(invite)}>Aceitar convite</Button><Button variant="ghost" icon={X} onClick={() => decline(invite)}>Recusar</Button></div></article>)}</div>}</section></main>
}
