// Texto com efeito "glitch". O data-text é copiado pelo CSS (.glitch::before/::after)
// para desenhar as cópias coloridas que "tremem".
export function GlitchText({ text }: { text: string }) {
  return (
    <span className="glitch" data-text={text}>
      {text}
    </span>
  )
}
