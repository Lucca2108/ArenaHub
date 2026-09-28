import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Database, LayoutDashboard, LogOut, RotateCcw, Server, Swords, Trophy, Users } from 'lucide-react'
import { BrandMark } from './BrandMark'
import { useAuth } from '../../context/AuthContext'
import { api } from '../../services/api'
import { IS_MOCK } from '../../services/config'
import { ConfirmDialog } from '../ui/ConfirmDialog'

const MENU = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/admin/campeonatos', label: 'Campeonatos', icon: Trophy },
  { to: '/admin/equipes', label: 'Equipes', icon: Users },
  { to: '/admin/partidas', label: 'Partidas', icon: Swords },
]

// Pega as iniciais do nome: "Cauã Muniz" -> "CM"
function iniciais(nome) {
  const partes = nome.split(' ')
  let resultado = partes[0][0]
  if (partes.length > 1) resultado += partes[1][0]
  return resultado.toUpperCase()
}

export function Sidebar({ open, onClose }) {
  const { user, logout } = useAuth()
  const [confirmarReset, setConfirmarReset] = useState(false)

  async function restaurarDemo() {
    await api.resetDemo()
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
            return (
              // NavLink sabe se é a página atual e nos passa isActive
              <NavLink key={item.to} to={item.to} end={item.to === '/admin'} className="nav__link" onClick={onClose}>
                {({ isActive }) => (
                  <>
                    {/* layoutId faz o destaque deslizar de um item para o outro */}
                    {isActive && <motion.span layoutId="menu-ativo" className="nav__active" />}
                    <Icone size={20} className="nav__icon" />
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
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
