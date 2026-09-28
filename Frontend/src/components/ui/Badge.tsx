import type { LucideIcon } from 'lucide-react'
import type { MatchStatus, TournamentStatus } from '@/types'
import { MATCH_STATUS, TOURNAMENT_STATUS } from '@/utils/constants'

type BadgeProps = {
  tone?: string // cor: 'cyan', 'live', 'muted', 'violet'
  icon?: LucideIcon
  children: React.ReactNode
}

// Etiqueta arredondada. tone="live" mostra a bolinha vermelha piscando.
export function Badge({ tone = 'muted', icon: Icon, children }: BadgeProps) {
  return (
    <span className={`badge badge--${tone}`}>
      {tone === 'live' ? <span className="live-dot" /> : Icon && <Icon size={13} />}
      {children}
    </span>
  )
}

export function TournamentBadge({ status }: { status: TournamentStatus }) {
  const info = TOURNAMENT_STATUS[status]
  return <Badge tone={info.tone}>{info.label}</Badge>
}

export function MatchBadge({ status }: { status: MatchStatus }) {
  const info = MATCH_STATUS[status]
  return <Badge tone={info.tone}>{info.label}</Badge>
}
