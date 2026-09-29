'use client'

import { useEffect, useState } from 'react'

// Número que "conta" de 0 até o valor final (efeito de placar)
export function AnimatedNumber({ value }: { value: number }) {
  const [atual, setAtual] = useState(0)

  useEffect(() => {
    const PASSOS = 20
    let passo = 0
    // a cada 50ms aumenta um pouco, em 20 passos (~1 segundo)
    const timer = setInterval(() => {
      passo = passo + 1
      setAtual(Math.round((value * passo) / PASSOS))
      if (passo === PASSOS) clearInterval(timer)
    }, 50)
    // se o componente sair da tela antes de terminar, para o timer
    return () => clearInterval(timer)
  }, [value])

  return <span>{atual}</span>
}
