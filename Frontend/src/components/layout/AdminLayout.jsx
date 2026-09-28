import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Background } from './Background'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

// Estrutura de todas as telas do organizador: fundo + menu lateral + barra do topo + página atual
export function AdminLayout() {
  const location = useLocation()
  const [menuAberto, setMenuAberto] = useState(false) // menu lateral no celular

  return (
    <div className="admin">
      <Background />
      <Sidebar open={menuAberto} onClose={() => setMenuAberto(false)} />
      <div className="main">
        <Topbar onMenu={() => setMenuAberto(true)} />
        {/* A "key" muda quando muda a página, então o React recria o bloco e a animação de entrada roda de novo.
            <Outlet /> é onde o React Router coloca a página da rota atual. */}
        <motion.main
          key={location.pathname + location.search}
          className="page"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35 }}
        >
          <Outlet />
        </motion.main>
      </div>
    </div>
  )
}
