'use client'

import { Suspense, useState } from 'react'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import { Background } from './Background'
import { Sidebar } from './Sidebar'
import { Topbar } from './Topbar'

// Estrutura de todas as telas do organizador: fundo + menu lateral + barra do topo + página atual
export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [menuAberto, setMenuAberto] = useState(false) // menu lateral no celular

  return (
    <div className="admin">
      <Background />
      <Sidebar open={menuAberto} onClose={() => setMenuAberto(false)} />
      <div className="main">
        <Topbar onMenu={() => setMenuAberto(true)} />
        {/* A "key" muda quando muda a página, então o React recria o bloco e a animação de entrada roda de novo */}
        <motion.main key={pathname} className="page" initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
          {/* O Next exige um <Suspense> em volta de páginas que leem a URL com useSearchParams */}
          <Suspense>{children}</Suspense>
        </motion.main>
      </div>
    </div>
  )
}
