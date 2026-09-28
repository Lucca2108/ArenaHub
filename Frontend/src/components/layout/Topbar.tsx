'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ChevronRight, Menu, Plus } from 'lucide-react'
import { Button } from '../ui/Button'
import { doisDigitos, formatDateTime } from '@/utils/format'

const TITULOS: Record<string, string> = {
  campeonatos: 'Campeonatos',
  equipes: 'Equipes',
  partidas: 'Partidas',
}

// Relógio que atualiza a cada segundo
function Relogio() {
  const [agora, setAgora] = useState<Date | null>(null)

  useEffect(() => {
    setAgora(new Date())
    const timer = setInterval(() => setAgora(new Date()), 1000)
    return () => clearInterval(timer) // limpa o timer quando o componente sai da tela
  }, [])

  // antes de montar no navegador ainda não tem hora para mostrar
  if (!agora) return null

  return (
    <div className="clock" aria-label="Horário atual">
      <span className="clock__time">
        {formatDateTime(agora)}
        <small>{doisDigitos(agora.getSeconds())}</small>
      </span>
    </div>
  )
}

export function Topbar({ onMenu }: { onMenu: () => void }) {
  const pathname = usePathname()
  const router = useRouter()

  // "/admin/campeonatos/3".split('/') -> ['', 'admin', 'campeonatos', '3']
  const partes = pathname.split('/')
  const secao = partes[2] // 'campeonatos', 'equipes', 'partidas' ou undefined (dashboard)
  const ehDetalhe = partes.length > 3 // tem um id no final

  return (
    <header className="topbar">
      <button type="button" className="icon-btn topbar__menu" onClick={onMenu} aria-label="Abrir menu">
        <Menu size={20} />
      </button>

      {/* Caminho: Painel > Campeonatos > Detalhes */}
      <nav className="crumbs" aria-label="Você está em">
        <Link href="/admin">Painel</Link>
        <ChevronRight size={14} />
        {!secao && <span>Dashboard</span>}
        {secao && !ehDetalhe && <span>{TITULOS[secao]}</span>}
        {secao && ehDetalhe && (
          <>
            <Link href={`/admin/${secao}`}>{TITULOS[secao]}</Link>
            <ChevronRight size={14} />
            <span>Detalhes</span>
          </>
        )}
      </nav>

      <div className="topbar__right">
        <Relogio />
        <Button size="sm" icon={Plus} className="topbar__cta" onClick={() => router.push('/admin/campeonatos?novo=1')}>
          Novo campeonato
        </Button>
      </div>
    </header>
  )
}
