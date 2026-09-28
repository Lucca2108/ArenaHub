// Fundo animado da arena. Quase tudo é CSS (ver .arena-bg em styles/base.css).

// Cria as partículas uma vez só, quando o arquivo é carregado
const CORES = ['var(--cyan)', 'var(--magenta)', 'var(--violet)']
const PARTICULAS = []
for (let i = 0; i < 22; i++) {
  PARTICULAS.push({
    left: `${Math.random() * 100}%`,
    animationDelay: `${-Math.random() * 18}s`,
    animationDuration: `${12 + Math.random() * 14}s`,
    width: `${1 + Math.random() * 2.4}px`,
    height: `${1 + Math.random() * 2.4}px`,
    color: CORES[i % 3],
  })
}

export function Background() {
  return (
    <div className="arena-bg" aria-hidden="true">
      <div className="arena-bg__glow arena-bg__glow--a" />
      <div className="arena-bg__glow arena-bg__glow--b" />
      <div className="arena-bg__glow arena-bg__glow--c" />
      <div className="arena-bg__dots" />
      <div className="arena-bg__floor" />
      {PARTICULAS.map((estilo, i) => (
        <span key={i} className="arena-bg__particle" style={estilo} />
      ))}
      <div className="arena-bg__scan" />
      <div className="arena-bg__noise" />
    </div>
  )
}
