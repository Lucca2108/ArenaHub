'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Background } from '@/components/layout/Background'
import { BrandMark } from '@/components/layout/BrandMark'
import { api } from '@/services/api'
import { mensagemDoErro } from '@/services/errors'
import { getSession } from '@/services/session'
import type { User } from '@/types'

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null)
  const [nome, setNome] = useState('')
  const [nickname, setNickname] = useState('')
  const [message, setMessage] = useState('')
  useEffect(() => { if (getSession()) api.profile.get().then((profile) => { setUser(profile); setNome(profile.nome); setNickname(profile.nickname || '') }).catch((e) => setMessage(mensagemDoErro(e))) }, [])
  async function save(event: React.FormEvent) { event.preventDefault(); try { const profile = await api.profile.update({ nome, nickname }); setUser(profile); setMessage('Perfil atualizado.') } catch (e) { setMessage(mensagemDoErro(e)) } }
  return <main className="public-shell"><Background /><header className="public-header"><BrandMark /><nav className="public-nav"><Link href="/hub">Hub</Link><Link href="/campeonatos">Campeonatos</Link><Link href="/hub/equipes">Minhas equipes</Link><Link href="/hub/perfil">Perfil</Link></nav></header><section className="hub-content"><div className="hub-hero"><div><span className="eyebrow">CONTA</span><h1>Perfil do atleta</h1><p>Atualize os dados públicos usados nas equipes e campeonatos.</p></div></div><form className="hub-panel" onSubmit={save} style={{ maxWidth: 620 }}><label className="field"><span>Nome completo</span><input className="input" value={nome} onChange={(e) => setNome(e.target.value)} required /></label><label className="field"><span>Nickname</span><input className="input" value={nickname} onChange={(e) => setNickname(e.target.value)} required /></label><label className="field"><span>E-mail</span><input className="input" value={user?.email || ''} disabled /></label><button className="account-button" type="submit">Salvar alterações</button>{message && <p className="muted">{message}</p>}</form></section></main>
}
