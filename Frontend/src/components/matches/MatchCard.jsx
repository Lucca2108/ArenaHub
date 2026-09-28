import { motion } from 'framer-motion'
import { CalendarClock, ClipboardPen, Play, Zap } from 'lucide-react'
import { TeamLogo } from '../ui/TeamLogo'
import { StatusBadge } from '../ui/Badge'
import { Button } from '../ui/Button'
import { formatDateTime, formatRelative } from '../../utils/format'
import { matchWinner } from '../../utils/bracket'

// Um lado do confronto (logo + nome). estado = 'winner', 'loser' ou null
function Lado({ team, lado, estado }) {
  return (
    <div className={`match-team match-team--${lado} ${estado ? `is-${estado}` : ''}`} style={{ '--team': team ? team.cor : undefined }}>
      <TeamLogo team={team} size={46} glow={estado === 'winner'} />
      <div className="match-team__text">
        <span className="match-team__name">{team ? team.nome : 'A definir'}</span>
        <span className="match-team__tag">{team ? team.tag : '—'}</span>
      </div>
    </div>
  )
}

// Card de uma partida. Os botões só aparecem se a tela passar as funções onSchedule/onStart/onResult.
export function MatchCard({ match, teamA, teamB, label, delay = 0, busy, onSchedule, onStart, onResult }) {
  const ehBye = match.team_b_id == null // time avançou sem adversário
  const vencedor = matchWinner(match)
  const mostrarPlacar = match.status !== 'AGENDADO' && !ehBye
  const temAcoes = onSchedule || onStart || onResult

  function estadoDo(teamId) {
    if (vencedor == null) return null
    return vencedor === teamId ? 'winner' : 'loser'
  }

  return (
    <motion.article
      className={`match-card match-card--${match.status}`}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <header className="match-card__head">
        <span className="match-card__label">{label}</span>
        {ehBye ? <span className="badge badge--violet">Bye</span> : <StatusBadge status={match.status} kind="match" />}
      </header>

      <div className="match-card__versus">
        <Lado team={teamA} lado="a" estado={estadoDo(match.team_a_id)} />

        <div className="match-card__center">
          {ehBye && <span className="match-bye">avança direto</span>}
          {mostrarPlacar && (
            <div className="match-score">
              <span className={vencedor === match.team_a_id ? 'win' : ''}>{match.score_a}</span>
              <span className="match-score__sep">:</span>
              <span className={vencedor === match.team_b_id ? 'win' : ''}>{match.score_b}</span>
            </div>
          )}
          {!ehBye && !mostrarPlacar && <span className="match-vs">VS</span>}
        </div>

        {ehBye ? <div className="match-team match-team--b match-team--empty">—</div> : <Lado team={teamB} lado="b" estado={estadoDo(match.team_b_id)} />}
      </div>

      {!ehBye && (
        <footer className="match-card__foot">
          <span className="match-when">
            <CalendarClock size={16} />
            {formatDateTime(match.data_hora)}
            {match.data_hora && match.status === 'AGENDADO' && <small>{formatRelative(match.data_hora)}</small>}
          </span>

          {temAcoes && (
            <div className="match-actions">
              {match.status === 'AGENDADO' && (
                <>
                  <Button size="sm" variant="ghost" icon={CalendarClock} onClick={() => onSchedule(match)}>
                    Agendar
                  </Button>
                  <Button size="sm" variant="ghost" icon={Play} loading={busy} onClick={() => onStart(match)}>
                    Iniciar
                  </Button>
                </>
              )}
              {match.status === 'EM_ANDAMENTO' && (
                <Button size="sm" icon={Zap} onClick={() => onResult(match)}>
                  Placar
                </Button>
              )}
              {match.status === 'FINALIZADO' && (
                <Button size="sm" variant="subtle" icon={ClipboardPen} onClick={() => onResult(match)}>
                  Corrigir
                </Button>
              )}
            </div>
          )}
        </footer>
      )}
    </motion.article>
  )
}
