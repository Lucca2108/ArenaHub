import type { Match, Team, Tournament } from '@/types'
import { matchWinner } from './bracket'

// Cálculos usados nas telas (progresso, classificação, campeão).
// A classificação oficial para o público vem do backend.

// Transforma a lista de equipes em um objeto por id: [{id:1,...}] -> { 1: {...} }
// Assim dá para achar uma equipe rápido: teamsById[5]
export function teamsPorId(lista: Team[]): Record<number, Team> {
  const resultado: Record<number, Team> = {}
  for (const team of lista) resultado[team.id] = team
  return resultado
}

// Mesma ideia, para campeonatos
export function tournamentsPorId(lista: Tournament[]): Record<number, Tournament> {
  const resultado: Record<number, Tournament> = {}
  for (const tournament of lista) resultado[tournament.id] = tournament
  return resultado
}

export interface Progresso {
  done: number
  total: number
  pct: number
}

// Quantas partidas já terminaram (ignora "byes")
export function tournamentProgress(partidas: Match[]): Progresso {
  const reais = partidas.filter((m) => m.team_b_id !== null)
  const finalizadas = reais.filter((m) => m.status === 'FINALIZADO').length
  const porcentagem = reais.length > 0 ? Math.round((finalizadas / reais.length) * 100) : 0
  return { done: finalizadas, total: reais.length, pct: porcentagem }
}

export interface LinhaTabela {
  team_id: number
  pts: number
  v: number // vitórias
  e: number // empates
  d: number // derrotas
  pro: number // pontos/gols feitos
  contra: number // pontos/gols sofridos
}

// Tabela de pontos corridos: vitória = 3 pontos, empate = 1
export function computeStandings(teamIds: number[], partidas: Match[]): LinhaTabela[] {
  const tabela: Record<number, LinhaTabela> = {}
  for (const id of teamIds) {
    tabela[id] = { team_id: id, pts: 0, v: 0, e: 0, d: 0, pro: 0, contra: 0 }
  }

  for (const m of partidas) {
    if (m.status !== 'FINALIZADO' || m.team_b_id === null) continue
    const a = tabela[m.team_a_id]
    const b = tabela[m.team_b_id]
    a.pro += m.score_a
    a.contra += m.score_b
    b.pro += m.score_b
    b.contra += m.score_a

    if (m.score_a > m.score_b) {
      a.v += 1
      a.pts += 3
      b.d += 1
    } else if (m.score_b > m.score_a) {
      b.v += 1
      b.pts += 3
      a.d += 1
    } else {
      a.e += 1
      b.e += 1
      a.pts += 1
      b.pts += 1
    }
  }

  // ordena por pontos; se empatar, pelo saldo; depois por quem marcou mais
  const linhas = Object.values(tabela)
  linhas.sort((x, y) => {
    if (y.pts !== x.pts) return y.pts - x.pts
    const saldoX = x.pro - x.contra
    const saldoY = y.pro - y.contra
    if (saldoY !== saldoX) return saldoY - saldoX
    return y.pro - x.pro
  })
  return linhas
}

export function lastRoundOf(partidas: Match[]): number {
  let maior = 0
  for (const m of partidas) {
    if (m.rodada > maior) maior = m.rodada
  }
  return maior
}

// Rodada em disputa: a primeira que ainda tem partida sem terminar
export function currentRoundOf(partidas: Match[]): number {
  let menor: number | null = null
  for (const m of partidas) {
    if (m.status !== 'FINALIZADO' && (menor === null || m.rodada < menor)) menor = m.rodada
  }
  return menor === null ? lastRoundOf(partidas) : menor
}

// Id do campeão (ou null se o campeonato não terminou)
export function findChampion(tournament: Tournament, partidas: Match[]): number | null {
  if (tournament.status !== 'FINALIZADO' || partidas.length === 0) return null

  if (tournament.formato === 'eliminatoria') {
    const final = partidas.filter((m) => m.rodada === lastRoundOf(partidas))
    return final.length === 1 ? matchWinner(final[0]) : null
  }
  // pontos corridos: o primeiro da tabela
  return computeStandings(tournament.team_ids, partidas)[0].team_id
}

// No mata-mata: a fase atual terminou e dá para gerar a próxima?
export function canGenerateNextRound(partidas: Match[]): boolean {
  const faseAtual = partidas.filter((m) => m.rodada === lastRoundOf(partidas))
  if (faseAtual.length === 0) return false
  const todasFinalizadas = faseAtual.every((m) => m.status === 'FINALIZADO')
  return todasFinalizadas && faseAtual.length > 1
}
