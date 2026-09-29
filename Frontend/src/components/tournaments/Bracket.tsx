'use client'

import { motion } from 'framer-motion'
import { Crown, Trophy } from 'lucide-react'
import type { Match, Team } from '@/types'
import { TeamLogo } from '../ui/TeamLogo'
import { matchWinner, roundLabel } from '@/utils/bracket'
import { lastRoundOf } from '@/utils/standings'

type LinhaProps = {
  team?: Team
  placar?: number
  estado?: 'winner' | 'loser' | null
  mostrarPlacar?: boolean
}

// Uma linha do chaveamento (uma equipe dentro do confronto)
function Linha({ team, placar, estado, mostrarPlacar }: LinhaProps) {
  return (
    <div className={`bracket-slot ${estado ? `is-${estado}` : ''}`} style={{ '--team': team ? team.cor : undefined }}>
      <TeamLogo team={team} size={26} />
      <span className="bracket-slot__name">{team ? team.nome : 'A definir'}</span>
      {mostrarPlacar && <span className="bracket-slot__score">{placar}</span>}
    </div>
  )
}

// Cada coluna é uma fase. As fases futuras ainda não têm partidas (quantidadeVazia > 0).
interface Coluna {
  rodada: number
  titulo: string
  partidas: Match[]
  quantidadeVazia: number
}

type BracketProps = {
  matches: Match[]
  teamsById: Record<number, Team>
  championId: number | null
}

// Chaveamento do mata-mata: uma coluna por fase + a coluna do campeão
export function Bracket({ matches, teamsById, championId }: BracketProps) {
  // 1) Colunas das fases que já foram geradas
  const colunas: Coluna[] = []
  const ultimaRodada = lastRoundOf(matches)
  for (let rodada = 1; rodada <= ultimaRodada; rodada++) {
    const partidas = matches.filter((m) => m.rodada === rodada)
    colunas.push({ rodada, titulo: roundLabel('eliminatoria', rodada, partidas.length), partidas, quantidadeVazia: 0 })
  }

  // 2) Fases futuras com confrontos "a definir"
  //    (cada fase tem metade dos confrontos da anterior, até sobrar 1: a final)
  let confrontos = colunas.length > 0 ? colunas[colunas.length - 1].partidas.length : 0
  let rodada = ultimaRodada
  while (confrontos > 1) {
    confrontos = Math.ceil(confrontos / 2)
    rodada = rodada + 1
    colunas.push({ rodada, titulo: roundLabel('eliminatoria', rodada, confrontos), partidas: [], quantidadeVazia: confrontos })
  }

  const campeao = championId !== null ? teamsById[championId] : null

  return (
    <div className="bracket-scroll">
      <div className="bracket">
        {colunas.map((coluna, indice) => {
          // caixinhas vazias das fases futuras
          const vazias = []
          for (let i = 0; i < coluna.quantidadeVazia; i++) {
            vazias.push(
              <div key={i} className="bracket-match is-tbd">
                <Linha />
                <Linha />
              </div>,
            )
          }

          return (
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
                  const vencedor = matchWinner(m)
                  const estadoA = vencedor === null ? null : vencedor === m.team_a_id ? 'winner' : 'loser'
                  const estadoB = vencedor === null ? null : vencedor === m.team_b_id ? 'winner' : 'loser'
                  const mostrarPlacar = m.status !== 'AGENDADO' && m.team_b_id !== null
                  return (
                    <div key={m.id} className={`bracket-match is-${m.status}`}>
                      <Linha team={teamsById[m.team_a_id]} placar={m.score_a} estado={estadoA} mostrarPlacar={mostrarPlacar} />
                      {m.team_b_id === null ? (
                        <div className="bracket-slot is-bye">BYE</div>
                      ) : (
                        <Linha team={teamsById[m.team_b_id]} placar={m.score_b} estado={estadoB} mostrarPlacar={mostrarPlacar} />
                      )}
                    </div>
                  )
                })}
                {vazias}
              </div>
            </motion.div>
          )
        })}

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
