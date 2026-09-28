import { motion } from 'framer-motion'
import { Crown, Trophy } from 'lucide-react'
import { TeamLogo } from '../ui/TeamLogo'
import { matchWinner, roundLabel } from '../../utils/bracket'
import { lastRoundOf } from '../../utils/standings'

// Uma linha do chaveamento (uma equipe dentro do confronto)
function Linha({ team, placar, estado, mostrarPlacar }) {
  return (
    <div className={`bracket-slot ${estado ? `is-${estado}` : ''}`} style={{ '--team': team ? team.cor : undefined }}>
      <TeamLogo team={team} size={26} />
      <span className="bracket-slot__name">{team ? team.nome : 'A definir'}</span>
      {mostrarPlacar && <span className="bracket-slot__score">{placar}</span>}
    </div>
  )
}

// Chaveamento do mata-mata: uma coluna por fase + a coluna do campeão
export function Bracket({ matches, teamsById, championId }) {
  // 1) Monta as colunas das fases que já foram geradas
  const colunas = []
  const ultimaRodada = lastRoundOf(matches)
  for (let rodada = 1; rodada <= ultimaRodada; rodada++) {
    const partidas = matches.filter((m) => m.rodada === rodada)
    colunas.push({ rodada, titulo: roundLabel('eliminatoria', rodada, partidas), partidas })
  }

  // 2) Adiciona as fases futuras com confrontos "a definir"
  //    (cada fase tem metade dos confrontos da anterior, até sobrar 1: a final)
  let confrontos = colunas.length > 0 ? colunas[colunas.length - 1].partidas.length : 0
  let rodada = ultimaRodada
  while (confrontos > 1) {
    confrontos = Math.ceil(confrontos / 2)
    rodada = rodada + 1
    const vazias = []
    for (let i = 0; i < confrontos; i++) vazias.push({ id: `vazia-${rodada}-${i}`, vazia: true })
    colunas.push({ rodada, titulo: roundLabel('eliminatoria', rodada, vazias), partidas: vazias })
  }

  const campeao = championId ? teamsById[championId] : null

  return (
    <div className="bracket-scroll">
      <div className="bracket">
        {colunas.map((coluna, indice) => (
          <motion.div
            key={coluna.rodada}
            className="bracket-col"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: indice * 0.12 }}
          >
            <span className="bracket-col__label">{coluna.titulo}</span>
            <div className="bracket-col__matches">
              {coluna.partidas.map((m) => {
                if (m.vazia) {
                  return (
                    <div key={m.id} className="bracket-match is-tbd">
                      <Linha />
                      <Linha />
                    </div>
                  )
                }
                const vencedor = matchWinner(m)
                const estadoA = vencedor == null ? null : vencedor === m.team_a_id ? 'winner' : 'loser'
                const estadoB = vencedor == null ? null : vencedor === m.team_b_id ? 'winner' : 'loser'
                const mostrarPlacar = m.status !== 'AGENDADO' && m.team_b_id != null
                return (
                  <div key={m.id} className={`bracket-match is-${m.status}`}>
                    <Linha team={teamsById[m.team_a_id]} placar={m.score_a} estado={estadoA} mostrarPlacar={mostrarPlacar} />
                    {m.team_b_id == null ? (
                      <div className="bracket-slot is-bye">BYE</div>
                    ) : (
                      <Linha team={teamsById[m.team_b_id]} placar={m.score_b} estado={estadoB} mostrarPlacar={mostrarPlacar} />
                    )}
                  </div>
                )
              })}
            </div>
          </motion.div>
        ))}

        <motion.div className="bracket-col bracket-col--champion" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: colunas.length * 0.12 }}>
          <span className="bracket-col__label">Campeão</span>
          <div className="bracket-col__matches">
            <div className={`bracket-champion ${campeao ? 'is-set' : ''}`} style={{ '--team': campeao ? campeao.cor : undefined }}>
              {campeao ? <Crown size={22} className="bracket-champion__crown" /> : <Trophy size={22} />}
              {campeao && <TeamLogo team={campeao} size={54} glow />}
              <strong>{campeao ? campeao.nome : 'A definir'}</strong>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
