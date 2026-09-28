import { motion } from 'framer-motion'

export function PageHeader({ eyebrow, title, subtitle, actions }) {
  return (
    <header className="page-header">
      <div>
        {eyebrow && (
          <motion.span className="eyebrow" initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
            {eyebrow}
          </motion.span>
        )}
        <motion.h1
          className="page-title"
          initial={{ opacity: 0, y: 18, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1], delay: 0.05 }}
        >
          {title}
        </motion.h1>
        {subtitle && (
          <motion.p className="page-subtitle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
            {subtitle}
          </motion.p>
        )}
      </div>
      {actions && (
        <motion.div className="page-actions" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          {actions}
        </motion.div>
      )}
    </header>
  )
}
