'use client'

import { Crown, Pencil, Trash2, Trophy } from 'lucide-react'
import type { Team } from '@/types'
import { SpotlightCard } from '../ui/SpotlightCard'
import { IconButton } from '../ui/Button'
import { TeamLogo } from '../ui/TeamLogo'

type TeamCardProps = {
  team: Team
  tournamentsCount: number // em quantos campeonatos está inscrita
  delay?: number
  onEdit: () => void
  onDelete: () => void
}

export function TeamCard({ team, tournamentsCount, delay = 0, onEdit, onDelete }: TeamCardProps) {
  return (
    <SpotlightCard className="team-card" style={{ '--team': team.cor }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay }}>
      <div className="team-card__glow" />
      <div className="team-card__top">
        <TeamLogo team={team} size={68} glow />
        <div className="team-card__actions">
          <IconButton icon={Pencil} label="Editar equipe" onClick={onEdit} />
          <IconButton icon={Trash2} label="Excluir equipe" tone="danger" onClick={onDelete} />
        </div>
      </div>

      <h3 className="team-card__name">{team.nome}</h3>
      <div className="team-card__meta">
        <span className="team-card__tag">#{team.tag}</span>
        <span>
          <Trophy size={14} /> {tournamentsCount} campeonato{tournamentsCount === 1 ? '' : 's'}
        </span>
      </div>

      <ul className="team-card__players">
        {team.jogadores.length === 0 && <li className="muted">Sem jogadores cadastrados</li>}
        {team.jogadores.map((nick) => (
          <li key={nick} className={nick === team.capitao ? 'is-captain' : ''}>
            {nick === team.capitao && <Crown size={12} />}
            {nick}
          </li>
        ))}
      </ul>
    </SpotlightCard>
  )
}
