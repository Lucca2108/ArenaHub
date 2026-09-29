// =====================================================================
// TIPOS DO SISTEMA
// Descrevem o "formato" de cada dado. Se usarmos um campo que não existe
// ou do tipo errado, o TypeScript avisa antes mesmo de rodar o código.
// Os nomes dos campos seguem o backend (Backend/app/models.py).
// =====================================================================

// "|" quer dizer "um desses valores"
export type TournamentStatus = 'INSCRICOES_ABERTAS' | 'EM_ANDAMENTO' | 'FINALIZADO'
export type MatchStatus = 'AGENDADO' | 'EM_ANDAMENTO' | 'FINALIZADO'
export type Formato = 'pontos_corridos' | 'eliminatoria'

export interface User {
  id: number
  nome: string
  email: string
  role: string
}

// O que fica salvo depois do login
export interface Session {
  token: string
  user: User
}

export interface Team {
  id: number
  nome: string
  tag: string // sigla, ex.: "NXW"
  cor: string // cor do escudo, ex.: "#00f0ff"
  capitao: string
  jogadores: string[] // lista de nicks
  capitao_id?: number // "?" = campo opcional
}

export interface Tournament {
  id: number
  nome: string
  descricao: string
  jogo: string
  formato: Formato
  status: TournamentStatus
  data_inicio: string | null
  data_fim: string | null
  max_equipes: number
  premiacao: string
  team_ids: number[] // ids das equipes inscritas
  organizador_id?: number
  created_at?: string
}

export interface Match {
  id: number
  tournament_id: number
  rodada: number
  team_a_id: number
  team_b_id: number | null // null = "bye" (time avançou sem adversário)
  score_a: number
  score_b: number
  status: MatchStatus
  data_hora: string | null
}

// ---------- Dados que os formulários enviam ----------

export interface LoginInput {
  email: string
  senha: string
}

export interface RegisterInput {
  nome: string
  email: string
  senha: string
}

export interface TournamentInput {
  nome: string
  jogo: string
  formato: Formato
  descricao: string
  data_inicio: string | null
  data_fim: string | null
  max_equipes: number
  premiacao: string
  status?: TournamentStatus
}

export interface TeamInput {
  nome: string
  tag: string
  cor: string
  capitao: string
  jogadores: string[]
}

export interface ResultInput {
  score_a: number
  score_b: number
  finalizar: boolean // false = placar parcial | true = encerra a partida
}

// Um confronto antes de virar partida (usado para gerar a tabela)
export interface Confronto {
  rodada: number
  team_a_id: number
  team_b_id: number | null
}

// ---------- Funções de comunicação com o backend ----------
// mockApi.ts e httpApi.ts seguem esta mesma interface,
// por isso as telas funcionam igual com qualquer um dos dois.

export interface Api {
  auth: {
    login(dados: LoginInput): Promise<Session>
    register(dados: RegisterInput): Promise<User>
  }
  tournaments: {
    list(): Promise<Tournament[]>
    get(id: number): Promise<Tournament>
    create(dados: TournamentInput): Promise<Tournament>
    update(id: number, dados: TournamentInput): Promise<Tournament>
    remove(id: number): Promise<void>
    enrollTeams(id: number, teamIds: number[]): Promise<void>
    removeTeam(id: number, teamId: number): Promise<void>
    generateMatches(id: number): Promise<void>
    nextRound(id: number): Promise<void>
  }
  teams: {
    list(): Promise<Team[]>
    create(dados: TeamInput): Promise<Team>
    update(id: number, dados: TeamInput): Promise<Team>
    remove(id: number): Promise<void>
  }
  matches: {
    list(tournamentId?: number): Promise<Match[]>
    schedule(id: number, dataHora: string | null): Promise<Match>
    start(id: number): Promise<Match>
    saveResult(id: number, placar: ResultInput): Promise<Match>
  }
  resetDemo: (() => Promise<void>) | null // só existe no modo demo
}
