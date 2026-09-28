// Blocos cinza com brilho passando, mostrados enquanto os dados carregam

export function Skeleton({ height = 120 }: { height?: number }) {
  return <div className="skeleton" style={{ height }} />
}

export function SkeletonGrid({ count = 6, height = 220, className = 'grid-cards' }: { count?: number; height?: number; className?: string }) {
  const blocos = []
  for (let i = 0; i < count; i++) blocos.push(<Skeleton key={i} height={height} />)
  return <div className={className}>{blocos}</div>
}
