// Funções de chaveamento usadas pelo modo demo e pelas telas.
// A regra oficial fica no backend (Danilo); aqui é só para o painel funcionar sem API.

// TODOS CONTRA TODOS (pontos corridos) — "método do círculo":
// o primeiro time fica parado e os outros giram uma posição a cada rodada.
// Assim cada time joga uma vez por rodada e enfrenta todos os outros.
export function roundRobin(teamIds) {
  const times = [...teamIds]
  if (times.length % 2 === 1) times.push(null) // número ímpar: null = folga

  const total = times.length
  const partidas = []

  for (let rodada = 1; rodada < total; rodada++) {
    // pareia o primeiro com o último, o segundo com o penúltimo...
    for (let i = 0; i < total / 2; i++) {
      const timeA = times[i]
      const timeB = times[total - 1 - i]
      if (timeA !== null && timeB !== null) {
        partidas.push({ rodada, team_a_id: timeA, team_b_id: timeB })
      }
    }
    // gira: o último time vai para a posição 1 (a posição 0 não mexe)
    const ultimo = times.pop()
    times.splice(1, 0, ultimo)
  }
  return partidas
}

// UMA FASE DO MATA-MATA: pareia os times de dois em dois.
// Se sobrar um time sem adversário, ele avança direto ("bye", team_b_id = null).
export function eliminationRound(teamIds, rodada) {
  const partidas = []
  for (let i = 0; i < teamIds.length; i += 2) {
    const timeB = i + 1 < teamIds.length ? teamIds[i + 1] : null
    partidas.push({ rodada, team_a_id: teamIds[i], team_b_id: timeB })
  }
  return partidas
}

// Quem venceu a partida? (null se não terminou ou se empatou)
export function matchWinner(match) {
  if (match.status !== 'FINALIZADO') return null
  if (match.team_b_id == null) return match.team_a_id // bye
  if (match.score_a > match.score_b) return match.team_a_id
  if (match.score_b > match.score_a) return match.team_b_id
  return null
}

// Nome da rodada: "Rodada 3" nos pontos corridos, "Semifinal"/"Grande Final" no mata-mata
export function roundLabel(formato, rodada, partidasDaRodada) {
  if (formato !== 'eliminatoria') return `Rodada ${rodada}`
  const times = partidasDaRodada.length * 2
  if (times === 2) return 'Grande Final'
  if (times === 4) return 'Semifinal'
  if (times === 8) return 'Quartas de final'
  if (times === 16) return 'Oitavas de final'
  return `Fase ${rodada}`
}

// Mesmo que roundLabel, mas procura sozinho as outras partidas da mesma rodada
export function matchRoundLabel(match, tournament, todasPartidas) {
  const mesmaRodada = todasPartidas.filter((m) => m.tournament_id === match.tournament_id && m.rodada === match.rodada)
  return roundLabel(tournament ? tournament.formato : null, match.rodada, mesmaRodada)
}

// Embaralha uma lista (sorteio dos confrontos)
export function shuffle(lista) {
  const copia = [...lista]
  for (let i = copia.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    const temp = copia[i]
    copia[i] = copia[j]
    copia[j] = temp
  }
  return copia
}
