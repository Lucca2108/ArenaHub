'use client'

import { motion } from 'framer-motion'
import { CircleAlert, type LucideIcon } from 'lucide-react'

type EmptyStateProps = {
  icon?: LucideIcon
  title: string
  children?: React.ReactNode
  action?: React.ReactNode
}

// Mensagem de "lista vazia" (ex.: nenhuma equipe encontrada)
export function EmptyState({ icon: Icon, title, children, action }: EmptyStateProps) {
  return (
    <motion.div className="empty" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
      {Icon && (
        <div className="empty__icon">
          <Icon size={30} />
        </div>
      )}
      <h3>{title}</h3>
      {children && <p>{children}</p>}
      {action}
    </motion.div>
  )
}

// Mensagem de erro com botão "Tentar de novo"
export function ErrorState({ mensagem, onRetry }: { mensagem: string; onRetry: () => void }) {
  return (
    <EmptyState
      icon={CircleAlert}
      title="Algo deu errado"
      action={
        <button type="button" className="btn btn--ghost btn--sm" onClick={onRetry}>
          <span>Tentar de novo</span>
        </button>
      }
    >
      {mensagem}
    </EmptyState>
  )
}
