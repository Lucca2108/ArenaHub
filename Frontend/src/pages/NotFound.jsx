import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft } from 'lucide-react'
import { Background } from '../components/layout/Background'
import { GlitchText } from '../components/ui/GlitchText'

export function NotFound() {
  return (
    <div className="notfound">
      <Background />
      <motion.div className="notfound__box" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
        <h1 className="notfound__code">
          <GlitchText text="404" />
        </h1>
        <p className="notfound__title">Você saiu do mapa</p>
        <p className="muted">Essa página não existe ou foi removida.</p>
        <Link to="/admin" className="btn btn--primary btn--md">
          <ArrowLeft size={18} />
          <span>Voltar ao painel</span>
        </Link>
      </motion.div>
    </div>
  )
}
