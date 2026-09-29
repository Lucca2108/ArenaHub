import type { LucideIcon } from 'lucide-react'

type FieldProps = {
  label?: string
  hint?: string // texto de ajuda embaixo do campo
  error?: string // mensagem de erro (fica vermelha)
  icon?: LucideIcon
  className?: string
  as?: 'label' | 'div' // "div" quando o campo tem vários botões dentro
  children: React.ReactNode
}

// Envolve um campo de formulário com título, ícone e mensagem de erro
export function Field({ label, hint, error, icon: Icon, className = '', as = 'label', children }: FieldProps) {
  const Elemento = as
  return (
    <Elemento className={`field ${error ? 'has-error' : ''} ${className}`}>
      {label && <span className="field__label">{label}</span>}
      <div className={`field__control ${Icon ? 'has-icon' : ''}`}>
        {Icon && <Icon size={18} className="field__icon" />}
        {children}
      </div>
      {error ? <span className="field__error">{error}</span> : hint && <span className="field__hint">{hint}</span>}
    </Elemento>
  )
}
