import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { Background } from '@/components/layout/Background'
import { GlitchText } from '@/components/ui/GlitchText'

// Página mostrada quando o endereço não existe (erro 404)
export default function NotFound() {
  return (
    <div className="notfound">
      <Background />
      <div className="notfound__box">
        <h1 className="notfound__code">
          <GlitchText text="404" />
        </h1>
        <p className="notfound__title">Você saiu do mapa</p>
        <p className="muted">Essa página não existe ou foi removida.</p>
        <Link href="/admin" className="btn btn--primary btn--md">
          <ArrowLeft size={18} />
          <span>Voltar ao painel</span>
        </Link>
      </div>
    </div>
  )
}
