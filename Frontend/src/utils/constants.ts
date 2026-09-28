import type { Formato, MatchStatus, TournamentStatus } from '@/types'

// Textos e cores de cada status. Os valores seguem o backend (models.py).
// Record<Chave, Valor> = um objeto que tem uma entrada para cada chave possível.

export const TOURNAMENT_STATUS: Record<TournamentStatus, { label: string; tone: string }> = {
  INSCRICOES_ABERTAS: { label: 'Inscrições abertas', tone: 'cyan' },
  EM_ANDAMENTO: { label: 'Em andamento', tone: 'live' },
  FINALIZADO: { label: 'Finalizado', tone: 'muted' },
}

export const MATCH_STATUS: Record<MatchStatus, { label: string; tone: string }> = {
  AGENDADO: { label: 'Agendada', tone: 'cyan' },
  EM_ANDAMENTO: { label: 'Ao vivo', tone: 'live' },
  FINALIZADO: { label: 'Finalizada', tone: 'muted' },
}

export const FORMATS: Record<Formato, { label: string; description: string }> = {
  pontos_corridos: { label: 'Pontos corridos', description: 'Todos contra todos, vence quem somar mais pontos.' },
  eliminatoria: { label: 'Eliminatória', description: 'Chaveamento simples: perdeu, está fora.' },
}

export interface Game {
  id: string
  color: string
  short: string
}

export const GAMES: Game[] = [
  { id: 'Valorant', color: '#ff4655', short: 'VAL' },
  { id: 'League of Legends', color: '#c8aa6e', short: 'LOL' },
  { id: 'Counter-Strike 2', color: '#f5a524', short: 'CS2' },
  { id: 'Rocket League', color: '#1f8bff', short: 'RL' },
  { id: 'EA Sports FC', color: '#26e07f', short: 'FC' },
  { id: 'Free Fire', color: '#ff8a00', short: 'FF' },
  { id: 'Fortnite', color: '#a55bff', short: 'FN' },
  { id: 'Dota 2', color: '#e0342b', short: 'DOTA' },
  { id: 'Outro', color: '#00f0ff', short: 'GG' },
]

// Acha o jogo pelo nome; se não achar, usa "Outro"
export function getGame(nome: string): Game {
  const jogo = GAMES.find((g) => g.id === nome)
  return jogo ? jogo : GAMES[GAMES.length - 1]
}

export const TEAM_COLORS = ['#00f0ff', '#ff2bd6', '#b6ff3b', '#ffb020', '#ff3b5c', '#8b5cf6', '#1f8bff', '#26e07f', '#ff8a00', '#f472b6']
