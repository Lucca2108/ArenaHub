import { LoaderCircle } from 'lucide-react'

export function Button({ variant = 'primary', size = 'md', icon: Icon, loading = false, className = '', children, disabled, type = 'button', ...props }) {
  const iconSize = size === 'sm' ? 16 : 18
  return (
    <button type={type} className={`btn btn--${variant} btn--${size} ${className}`} disabled={disabled || loading} {...props}>
      {loading ? <LoaderCircle size={iconSize} className="spin" /> : Icon && <Icon size={iconSize} />}
      {children && <span>{children}</span>}
    </button>
  )
}

export function IconButton({ icon: Icon, label, tone = 'default', className = '', ...props }) {
  return (
    <button type="button" className={`icon-btn icon-btn--${tone} ${className}`} aria-label={label} title={label} {...props}>
      <Icon size={17} />
    </button>
  )
}
