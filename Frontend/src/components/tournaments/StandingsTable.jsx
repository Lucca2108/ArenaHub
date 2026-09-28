import { motion } from 'framer-motion'
import { TeamLogo } from '../ui/TeamLogo'

// Tabela de classificação (pontos corridos). rows vem de computeStandings() em utils/standings.js
export function StandingsTable({ rows, teamsById }) {
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
