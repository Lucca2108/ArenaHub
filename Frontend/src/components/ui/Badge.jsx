import { MATCH_STATUS, TOURNAMENT_STATUS } from '../../utils/constants'

export function Badge({ tone = 'muted', icon: Icon, children, className = '' }) {
  return (
    <span className={`badge badge--${tone} ${className}`}>
      {tone === 'live' ? <span className="live-dot" /> : Icon && <Icon size={13} />}
      {children}
    </span>
  )
}

export function StatusBadge({ status, kind = 'tournament' }) {
  const map = kind === 'match' ? MATCH_STATUS : TOURNAMENT_STATUS
  const info = map[status] || { label: status, tone: 'muted' }
  return <Badge tone={info.tone}>{info.label}</Badge>
}
