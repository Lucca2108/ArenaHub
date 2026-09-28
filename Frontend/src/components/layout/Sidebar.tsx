'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Database, LayoutDashboard, LogOut, RotateCcw, Server, Swords, Trophy, Users } from 'lucide-react'
import { BrandMark } from './BrandMark'
import { useAuth } from '@/context/AuthContext'
import { api } from '@/services/api'
import { IS_MOCK } from '@/services/config'
import { ConfirmDialog } from '../ui/ConfirmDialog'

const MENU = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/campeonatos', label: 'Campeonatos', icon: Trophy },
  { href: '/admin/equipes', label: 'Equipes', icon: Users },
  { href: '/admin/partidas', label: 'Partidas', icon: Swords },
]

// Pega as iniciais do nome: "Cauã Muniz" -> "CM"
function iniciais(nome: string): string {
  const partes = nome.split(' ')
  let resultado = partes[0][0]
  if (partes.length > 1) resultado += partes[1][0]
  return resultado.toUpperCase()
}

type SidebarProps = {
  open: boolean // menu aberto no celular?
  onClose: () => void
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const { user, logout } = useAuth()
  const pathname = usePathname() // endereço atual, ex.: "/admin/equipes"
  const [confirmarReset, setConfirmarReset] = useState(false)

  // O item está ativo se é a página atual (ou uma página "dentro" dele, como /admin/campeonatos/3)
  function estaAtivo(href: string): boolean {
    if (href === '/admin') return pathname === '/admin'
    return pathname.startsWith(href)
  }

  async function restaurarDemo() {
    if (api.resetDemo) await api.resetDemo()
    window.location.assign('/admin') // recarrega a página com os dados de exemplo
  }

  return (
    <>
      <div className={`sidebar-overlay ${open ? 'is-open' : ''}`} onClick={onClose} />
      <aside className={`sidebar ${open ? 'is-open' : ''}`}>
        <BrandMark />

        <span className="sidebar__label">Menu</span>
        <nav className="nav">
          {MENU.map((item) => {
            const Icone = item.icon
            const ativo = estaAtivo(item.href)
            return (
              <Link key={item.href} href={item.href} className={`nav__link ${ativo ? 'active' : ''}`} onClick={onClose}>
                {/* layoutId faz o destaque deslizar de um item para o outro */}
                {ativo && <motion.span layoutId="menu-ativo" className="nav__active" />}
                <Icone size={20} className="nav__icon" />
                <span>{item.label}</span>
              </Link>
            )
          })}
        </nav>

        <div className="sidebar__footer">
          <div className={`mode-chip ${IS_MOCK ? 'mode-chip--mock' : 'mode-chip--api'}`}>
            {IS_MOCK ? <Database size={15} /> : <Server size={15} />}
            <span>{IS_MOCK ? 'Modo demo · dados locais' : 'Conectado à API'}</span>
          </div>
          {IS_MOCK && (
            <button type="button" className="sidebar__reset" onClick={() => setConfirmarReset(true)}>
              <RotateCcw size={14} /> Restaurar dados demo
            </button>
          )}

          {user && (
            <div className="user-card">
              <div className="avatar">{iniciais(user.nome)}</div>
              <div className="user-card__info">
                <strong>{user.nome}</strong>
                <span>{user.email}</span>
              </div>
              <button type="button" className="icon-btn" onClick={logout} aria-label="Sair" title="Sair">
                <LogOut size={17} />
              </button>
            </div>
          )}
        </div>
      </aside>

      {confirmarReset && (
        <ConfirmDialog
          title="Restaurar dados de demonstração?"
          confirmLabel="Restaurar"
          icon={RotateCcw}
          onConfirm={restaurarDemo}
          onClose={() => setConfirmarReset(false)}
        >
          Tudo que você criou no modo demo será apagado e os dados de exemplo voltam ao estado inicial.
        </ConfirmDialog>
      )}
    </>
  )
}
