import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'

// Janela sobreposta (modal). Quem usa decide quando mostrar:
//   {formAberto && <Modal title="..." onClose={...}>conteúdo</Modal>}
export function Modal({ title, subtitle, icon: Icon, size = 'md', onClose, onSubmit, footer, children }) {
  // Fecha o modal ao apertar Esc
  useEffect(() => {
    function aoApertarTecla(evento) {
      if (evento.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', aoApertarTecla)
    return () => window.removeEventListener('keydown', aoApertarTecla)
  }, [onClose])

  function enviar(evento) {
    evento.preventDefault() // impede o navegador de recarregar a página
    if (onSubmit) onSubmit()
  }

  function clicarFora(evento) {
    // só fecha se o clique foi no fundo escuro, e não dentro da janela
    if (evento.target === evento.currentTarget) onClose()
  }

  // createPortal desenha o modal direto no <body>, por cima de todo o resto da página
  return createPortal(
    <motion.div className="modal-backdrop" onMouseDown={clicarFora} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <motion.form
        className={`modal modal--${size}`}
        onSubmit={enviar}
        noValidate
        role="dialog"
        aria-modal="true"
        aria-label={title}
        initial={{ opacity: 0, y: 40, scale: 0.94 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
      >
        <header className="modal__header">
          {Icon && (
            <span className="modal__icon">
              <Icon size={22} />
            </span>
          )}
          <div className="modal__titles">
            <h2>{title}</h2>
            {subtitle && <p>{subtitle}</p>}
          </div>
          <button type="button" className="icon-btn modal__close" onClick={onClose} aria-label="Fechar">
            <X size={18} />
          </button>
        </header>
        <div className="modal__body">{children}</div>
        {footer && <footer className="modal__footer">{footer}</footer>}
      </motion.form>
    </motion.div>,
    document.body,
  )
}
