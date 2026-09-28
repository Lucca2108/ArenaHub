'use client'

import { motion } from 'framer-motion'
import type { Team } from '@/types'
import type { LinhaTabela } from '@/utils/standings'
import { TeamLogo } from '../ui/TeamLogo'

type StandingsTableProps = {
  rows: LinhaTabela[] // vem de computeStandings() em utils/standings.ts
  teamsById: Record<number, Team>
}

// Tabela de classificação (pontos corridos)
export function StandingsTable({ rows, teamsById }: StandingsTableProps) {
  return (
    <div className="table-wrap panel">
      <table className="table">
        <thead>
          <tr>
            <th>#</th>
            <th>Equipe</th>
            <th>P</th>
            <th>V</th>
            <th>E</th>
            <th>D</th>
            <th>Saldo</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((linha, indice) => {
            const team = teamsById[linha.team_id]
            const saldo = linha.pro - linha.contra
            return (
              <motion.tr
                key={linha.team_id}
                className={indice === 0 ? 'is-leader' : ''}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: indice * 0.06 }}
              >
                <td className="table__pos">{indice + 1}</td>
                <td>
                  <span className="table__team">
                    <TeamLogo team={team} size={28} /> {team.nome}
                  </span>
                </td>
                <td className="table__pts">{linha.pts}</td>
                <td>{linha.v}</td>
                <td>{linha.e}</td>
                <td>{linha.d}</td>
                <td>{saldo > 0 ? `+${saldo}` : saldo}</td>
              </motion.tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
