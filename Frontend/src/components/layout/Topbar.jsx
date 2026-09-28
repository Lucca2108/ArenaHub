import { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ChevronRight, Menu, Plus } from 'lucide-react'
import { Button } from '../ui/Button'
import { formatDateTime } from '../../utils/format'

const TITULOS = {
  campeonatos: 'Campeonatos',
  equipes: 'Equipes',
  partidas: 'Partidas',
}

// Relógio que atualiza a cada segundo
function Relogio() {
  const [agora, setAgora] = useState(new Date())

  useEffect(() => {
    const timer = setInterval(() => setAgora(new Date()), 1000)
    return () => clearInterval(timer) // limpa o timer quando o componente sai da tela
  }, [])

  const segundos = agora.getSeconds() < 10 ? `0${agora.getSeconds()}` : agora.getSeconds()
  return (
    <div className="clock" aria-label="Horário atual">
      <span className="clock__time">
        {formatDateTime(agora)}
        <small>{segundos}</small>
      </span>
    </div>
  )
}

export function Topbar({ onMenu }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()

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
        <Link to="/admin">Painel</Link>
        <ChevronRight size={14} />
        {!secao && <span>Dashboard</span>}
        {secao && !ehDetalhe && <span>{TITULOS[secao]}</span>}
        {secao && ehDetalhe && (
          <>
            <Link to={`/admin/${secao}`}>{TITULOS[secao]}</Link>
            <ChevronRight size={14} />
            <span>Detalhes</span>
          </>
        )}
      </nav>

      <div className="topbar__right">
        <Relogio />
        <Button size="sm" icon={Plus} className="topbar__cta" onClick={() => navigate('/admin/campeonatos?novo=1')}>
          Novo campeonato
        </Button>
      </div>
    </header>
  )
}
