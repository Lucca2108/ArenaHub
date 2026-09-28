'use client'

import { motion } from 'framer-motion'

type PageHeaderProps = {
  eyebrow?: string // textinho em cima do título
  title: string
  subtitle?: string
  actions?: React.ReactNode // botões do lado direito
}

// Título das páginas, com animação de entrada
export function PageHeader({ eyebrow, title, subtitle, actions }: PageHeaderProps) {
  return (
    <header className="page-header">
      <div>
        {eyebrow && (
          <motion.span className="eyebrow" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}>
            {eyebrow}
          </motion.span>
        )}
        <motion.h1 className="page-title" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p className="page-subtitle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            {subtitle}
          </motion.p>
        )}
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </header>
  )
}
