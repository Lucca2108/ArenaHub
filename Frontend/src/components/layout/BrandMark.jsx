import { GlitchText } from '../ui/GlitchText'

export function BrandMark({ compact = false }) {
  return (
    <div className="brand">
      <div className="brand__mark">
        <svg viewBox="0 0 64 64" aria-hidden="true">
          <defs>
            <linearGradient id="brandGrad" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0" stopColor="#00f0ff" />
              <stop offset="1" stopColor="#ff2bd6" />
            </linearGradient>
          </defs>
          <path className="brand__hex" d="M32 3 58 18v28L32 61 6 46V18z" fill="#0b0e1a" stroke="url(#brandGrad)" strokeWidth="3.5" />
          <path d="M32 16 45 46h-7l-2.6-6.5h-6.8L26 46h-7zm0 11-2.1 6.4h4.2z" fill="url(#brandGrad)" />
        </svg>
      </div>
      {!compact && (
        <div className="brand__text">
          <span className="brand__name">
            <GlitchText text="ARENA" />
            <b>HUB</b>
          </span>
          <span className="brand__sub">Organizador</span>
        </div>
      )}
    </div>
  )
}
