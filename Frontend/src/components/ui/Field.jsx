export function Field({ label, hint, error, icon: Icon, className = '', children, as: Tag = 'label' }) {
  return (
    <Tag className={`field ${error ? 'has-error' : ''} ${className}`}>
      {label && <span className="field__label">{label}</span>}
      <div className={`field__control ${Icon ? 'has-icon' : ''}`}>
        {Icon && <Icon size={18} className="field__icon" />}
        {children}
      </div>
      {error ? <span className="field__error">{error}</span> : hint && <span className="field__hint">{hint}</span>}
    </Tag>
  )
}
