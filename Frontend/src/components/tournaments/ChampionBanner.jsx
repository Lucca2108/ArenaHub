import { motion } from 'framer-motion'
import { Crown } from 'lucide-react'
import { TeamLogo } from '../ui/TeamLogo'

// 18 pedacinhos de confete; a animação de queda é feita no CSS (.champion__confetti)
const CONFETES = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17]

export function ChampionBanner({ team }) {
  return (
    <motion.section className="champion neon-ring" style={{ '--team': team.cor }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
      <div className="champion__confetti" aria-hidden="true">
        {CONFETES.map((i) => (
          <i key={i} style={{ '--i': i }} />
        ))}
      </div>
      <Crown size={30} className="champion__crown" />
      <TeamLogo team={team} size={84} glow />
      <div>
        <span className="eyebrow">Campeão</span>
        <h2 className="champion__name">{team.nome}</h2>
        <p className="muted">Capitão: {team.capitao || '—'}</p>
      </div>
    </motion.section>
  )
}
