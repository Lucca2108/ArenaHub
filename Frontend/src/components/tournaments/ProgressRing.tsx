'use client'

import { motion } from 'framer-motion'

// Anel circular de progresso (0 a 100%).
// Truque do SVG: o contorno do círculo é um "tracejado" do tamanho da circunferência;
// deslocando o tracejado (strokeDashoffset) mostramos só uma parte do anel.
export function ProgressRing({ pct }: { pct: number }) {
  const raio = 34
  const circunferencia = 2 * Math.PI * raio
  const escondido = circunferencia - (circunferencia * pct) / 100

  return (
    <div className="ring">
      <svg viewBox="0 0 80 80">
        <circle cx="40" cy="40" r={raio} className="ring__track" />
        <motion.circle
          cx="40"
          cy="40"
          r={raio}
          className="ring__bar"
          strokeDasharray={circunferencia}
          initial={{ strokeDashoffset: circunferencia }}
          animate={{ strokeDashoffset: escondido }}
          transition={{ duration: 1.4, delay: 0.3 }}
        />
      </svg>
      <span>{pct}%</span>
    </div>
  )
}
