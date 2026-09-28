import type { Team } from '@/types'
import { makeTag } from '@/utils/format'

type TeamLogoProps = {
  // só precisa do nome, tag e cor (assim dá para usar na prévia do formulário também)
  team?: Pick<Team, 'nome' | 'tag' | 'cor'> | null
  size?: number
  glow?: boolean
}

// Escudo hexagonal da equipe, desenhado em SVG com a cor e a tag (sigla) dela
export function TeamLogo({ team, size = 44, glow = false }: TeamLogoProps) {
  const cor = team ? team.cor : '#4b5578'
  const tag = team ? team.tag || makeTag(team.nome) : '?'

  // siglas maiores usam letra menor para caber no escudo
  let tamanhoLetra = 32
  if (tag.length === 3) tamanhoLetra = 26
  if (tag.length >= 4) tamanhoLetra = 21

  return (
    // '--team' é uma variável CSS usada para o brilho (ver .team-logo--glow)
    <div className={`team-logo ${glow ? 'team-logo--glow' : ''}`} style={{ width: size, height: size, '--team': cor }}>
      <svg viewBox="0 0 100 100" aria-hidden="true">
        {/* hexágono de fora (borda) e de dentro (preenchimento suave) */}
        <polygon points="50,3 93,27 93,73 50,97 7,73 7,27" fill="#0a0d1a" stroke={cor} strokeWidth="5" />
        <polygon points="50,15 82,33 82,67 50,85 18,67 18,33" fill={cor} opacity="0.15" />
        <text x="50" y="52" dominantBaseline="middle" textAnchor="middle" fill={cor} fontSize={tamanhoLetra} fontWeight="800" fontFamily="Orbitron, sans-serif">
          {tag}
        </text>
      </svg>
    </div>
  )
}
