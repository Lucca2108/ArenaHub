// Fundo animado da arena. Quase tudo é CSS (ver .arena-bg em styles/base.css).

// Partículas que sobem pela tela. As posições saem de contas simples com o índice,
// para ficarem iguais no servidor e no navegador (o Next monta a página nos dois).
const CORES = ['var(--cyan)', 'var(--magenta)', 'var(--violet)']
const PARTICULAS: React.CSSProperties[] = []
for (let i = 0; i < 22; i++) {
  const tamanho = `${1 + (i % 3)}px`
  PARTICULAS.push({
    left: `${(i * 37) % 100}%`, // espalha na horizontal
    animationDelay: `-${(i * 7) % 18}s`, // cada uma começa num momento diferente
    animationDuration: `${12 + (i % 5) * 3}s`,
    width: tamanho,
    height: tamanho,
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
