import { motion } from 'framer-motion'
import { CircleAlert } from 'lucide-react'

export function EmptyState({ icon: Icon, title, children, action }) {
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

export function ErrorState({ error, onRetry }) {
  return (
    <EmptyState
      icon={CircleAlert}
      title="Algo deu errado"
      action={
        onRetry && (
          <button type="button" className="btn btn--ghost btn--sm" onClick={onRetry}>
            <span>Tentar de novo</span>
          </button>
        )
      }
    >
      {error.message}
    </EmptyState>
  )
}
