import { motion } from 'framer-motion'

// Card com um brilho que segue o mouse.
// Guardamos a posição do mouse nas variáveis CSS --mx e --my, e o CSS (.spot) desenha o brilho nesse ponto.
export function SpotlightCard({ className = '', children, ...props }) {
  function aoMoverMouse(evento) {
    const card = evento.currentTarget
    const posicao = card.getBoundingClientRect()
    card.style.setProperty('--mx', `${evento.clientX - posicao.left}px`)
    card.style.setProperty('--my', `${evento.clientY - posicao.top}px`)
  }

  return (
    <motion.div className={`spot ${className}`} onMouseMove={aoMoverMouse} {...props}>
      {children}
    </motion.div>
  )
}
