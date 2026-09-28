'use client'

import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Award, CalendarDays, ChevronRight, GitBranch, ListOrdered, Pencil, Trash2, Users } from 'lucide-react'
import type { Team, Tournament } from '@/types'
import { SpotlightCard } from '../ui/SpotlightCard'
import { TournamentBadge } from '../ui/Badge'
import { IconButton } from '../ui/Button'
import { TeamLogo } from '../ui/TeamLogo'
import { FORMATS, getGame } from '@/utils/constants'
import { formatDate } from '@/utils/format'
import type { Progresso } from '@/utils/standings'

type TournamentCardProps = {
  tournament: Tournament
  teamsById: Record<number, Team>
  progress: Progresso
  delay?: number
  onEdit: () => void
  onDelete: () => void
}

export function TournamentCard({ tournament, teamsById, progress, delay = 0, onEdit, onDelete }: TournamentCardProps) {
  const router = useRouter()
  const game = getGame(tournament.jogo)
  const equipes = tournament.team_ids.map((id) => teamsById[id])
  const IconeFormato = tournament.formato === 'eliminatoria' ? GitBranch : ListOrdered

  function abrir() {
    router.push(`/admin/campeonatos/${tournament.id}`)
  }

  // stopPropagation: o clique no botão não "sobe" para o card (senão também abriria o campeonato)
  function editar(evento: React.MouseEvent) {
    evento.stopPropagation()
    onEdit()
  }

  function excluir(evento: React.MouseEvent) {
    evento.stopPropagation()
    onDelete()
  }

  return (
    <SpotlightCard
      className="t-card"
      style={{ '--game': game.color }}
      onClick={abrir}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <div className="t-card__banner">
        <span className="t-card__watermark">{game.short}</span>
        <span className="t-card__game">{tournament.jogo}</span>
        <TournamentBadge status={tournament.status} />
      </div>

      <div className="t-card__body">
        <h3 className="t-card__title">{tournament.nome}</h3>
        {tournament.descricao && <p className="t-card__desc">{tournament.descricao}</p>}

        <ul className="t-card__meta">
          <li>
            <IconeFormato size={15} /> {FORMATS[tournament.formato].label}
          </li>
          <li>
            <Users size={15} /> {tournament.team_ids.length}/{tournament.max_equipes}
          </li>
          <li>
            <CalendarDays size={15} /> {formatDate(tournament.data_inicio)}
          </li>
          {tournament.premiacao && (
            <li>
              <Award size={15} /> {tournament.premiacao}
            </li>
          )}
        </ul>

        {/* Se já tem partidas mostra a barra de progresso; senão, os escudos das equipes inscritas */}
        {progress.total > 0 ? (
          <div className="progress">
            <div className="progress__labels">
              <span>Partidas</span>
              <span>
                {progress.done}/{progress.total}
              </span>
            </div>
            <div className="progress__track">
              <motion.div className="progress__bar" initial={{ width: 0 }} animate={{ width: `${progress.pct}%` }} transition={{ duration: 1, delay: 0.3 }} />
            </div>
          </div>
        ) : (
          <div className="t-card__slots">
            <div className="avatar-stack">
              {equipes.slice(0, 5).map((team) => (
                <TeamLogo key={team.id} team={team} size={30} />
              ))}
              {equipes.length > 5 && <span className="avatar-stack__more">+{equipes.length - 5}</span>}
              {equipes.length === 0 && <span className="muted">Nenhuma equipe inscrita</span>}
            </div>
          </div>
        )}
      </div>

      <footer className="t-card__foot">
        <span className="t-card__manage">
          Gerenciar <ChevronRight size={16} />
        </span>
        <div className="t-card__actions">
          <IconButton icon={Pencil} label="Editar campeonato" onClick={editar} />
          <IconButton icon={Trash2} label="Excluir campeonato" tone="danger" onClick={excluir} />
        </div>
      </footer>
    </SpotlightCard>
  )
}
