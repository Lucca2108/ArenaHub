import { LoaderCircle, type LucideIcon } from 'lucide-react'

// Props = tudo que um <button> normal aceita (onClick, disabled, type...) + as nossas opções
type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'ghost' | 'subtle' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  icon?: LucideIcon
  loading?: boolean
}

export function Button({ variant = 'primary', size = 'md', icon: Icon, loading = false, className = '', children, disabled, type = 'button', ...props }: ButtonProps) {
  const tamanhoIcone = size === 'sm' ? 16 : 18
  return (
    <button type={type} className={`btn btn--${variant} btn--${size} ${className}`} disabled={disabled || loading} {...props}>
      {/* carregando: mostra o ícone girando no lugar do ícone normal */}
      {loading ? <LoaderCircle size={tamanhoIcone} className="spin" /> : Icon && <Icon size={tamanhoIcone} />}
      {children && <span>{children}</span>}
    </button>
  )
}

type IconButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  icon: LucideIcon
  label: string // texto para leitores de tela e para o "tooltip"
  tone?: 'default' | 'danger'
}

// Botão só com ícone (editar, excluir...)
export function IconButton({ icon: Icon, label, tone = 'default', className = '', ...props }: IconButtonProps) {
  return (
    <button type="button" className={`icon-btn icon-btn--${tone} ${className}`} aria-label={label} title={label} {...props}>
      <Icon size={17} />
    </button>
  )
}
