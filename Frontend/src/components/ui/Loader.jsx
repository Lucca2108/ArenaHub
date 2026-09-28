export function HexLoader({ label = 'Carregando' }) {
  return (
    <div className="hex-loader" role="status">
      <svg viewBox="0 0 100 100" aria-hidden="true">
        <polygon className="hex-loader__track" points="50,4 92,28 92,72 50,96 8,72 8,28" />
        <polygon className="hex-loader__bar" points="50,4 92,28 92,72 50,96 8,72 8,28" />
      </svg>
      <span>{label}</span>
    </div>
  )
}

export function Skeleton({ height = 120, className = '' }) {
  return <div className={`skeleton ${className}`} style={{ height }} />
}

export function SkeletonGrid({ count = 6, height = 220, className = 'grid-cards' }) {
  return (
    <div className={className}>
      {Array.from({ length: count }, (_, i) => (
        <Skeleton key={i} height={height} />
      ))}
    </div>
  )
}
