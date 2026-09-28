// Permite usar variáveis CSS dentro do style, por exemplo:
//   <div style={{ '--team': '#00f0ff' }}>
// Sem isso o TypeScript reclama, porque '--team' não é uma propriedade CSS "oficial".
import 'react'

declare module 'react' {
  interface CSSProperties {
    [variavel: `--${string}`]: string | number | undefined
  }
}
