'use client'

import { motion } from 'framer-motion'
import type { LucideIcon } from 'lucide-react'

export interface Aba {
  id: string
  label: string
  icon?: LucideIcon
  count?: number // número que aparece do lado (ex.: quantidade de itens)
}

type TabsProps = {
  items: Aba[]
  value: string // id da aba ativa
  onChange: (id: string) => void
  className?: string
}

// Abas / filtros
export function Tabs({ items, value, onChange, className = '' }: TabsProps) {
  return (
    <div className={`tabs ${className}`} role="tablist">
      {items.map((item) => {
        const ativa = item.id === value
        const Icone = item.icon
        return (
          <button key={item.id} type="button" role="tab" aria-selected={ativa} className={`tab ${ativa ? 'is-active' : ''}`} onClick={() => onChange(item.id)}>
            {/* layoutId faz a "pílula" colorida deslizar de uma aba para a outra */}
            {ativa && <motion.span layoutId="aba-ativa" className="tab__pill" />}
            {Icone && <Icone size={16} />}
            <span>{item.label}</span>
            {item.count !== undefined && <span className="tab__count">{item.count}</span>}
          </button>
        )
      })}
    </div>
  )
}
