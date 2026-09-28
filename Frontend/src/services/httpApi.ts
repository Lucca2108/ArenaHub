import type { Api, Match, Team, Tournament, User } from '@/types'
import { API_BASE } from './config'
import { ApiError } from './errors'
import { getSession } from './session'
import { makeTag } from '@/utils/format'

// Chamadas ao backend FastAPI de verdade. A lista de rotas está no Frontend/README.md.

// Função única que faz todas as requisições HTTP.
// <T> é o tipo da resposta (ex.: request<Team[]>('/teams') devolve uma lista de equipes).
async function request<T>(caminho: string, metodo = 'GET', corpo?: object): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' }

  // se estiver logado, manda o token junto
  const sessao = getSession()
  if (sessao) headers.Authorization = `Bearer ${sessao.token}`

  let resposta: Response
  try {
    resposta = await fetch(API_BASE + caminho, {
      method: metodo,
      headers,
      body: corpo ? JSON.stringify(corpo) : undefined,
    })
  } catch {
    // fetch só dá erro aqui quando nem conseguiu falar com o servidor
    throw new ApiError('Não foi possível conectar ao servidor. O backend está rodando?', 0)
  }

  // 204 = sucesso sem conteúdo (ex.: DELETE)
  let dados = null
  if (resposta.status !== 204) {
    try {
      dados = await resposta.json()
    } catch {
      dados = null
    }
  }

  if (!resposta.ok) throw new ApiError(mensagemDeErro(dados, resposta.status), resposta.status)
  return dados
}

// O FastAPI devolve os erros como { "detail": "mensagem" }
function mensagemDeErro(dados: { detail?: unknown } | null, status: number): string {
  if (dados && typeof dados.detail === 'string') return dados.detail
  if (status === 404) return 'Recurso não encontrado (essa rota já existe no backend?).'
  if (status >= 500) return 'Servidor indisponível no momento.'
  return `Erro ${status} ao falar com o servidor.`
}

// O backend atual ainda não guarda todos os campos que as telas usam.
// Estas funções completam com valores padrão para a tela não quebrar.
// Partial<Tournament> = um Tournament em que todos os campos são opcionais.
function completarCampeonato(t: Partial<Tournament>): Tournament {
  return {
    id: 0,
    nome: '',
    descricao: '',
    jogo: 'Outro',
    formato: 'pontos_corridos',
    status: 'INSCRICOES_ABERTAS',
    data_inicio: null,
    data_fim: null,
    max_equipes: 8,
    premiacao: '',
    team_ids: [],
    ...t, // os campos que vieram do backend substituem os padrões
  }
}

function completarEquipe(e: Partial<Team>): Team {
  return { id: 0, nome: '', tag: makeTag(e.nome || ''), cor: '#00f0ff', capitao: '', jogadores: [], ...e }
}

function completarPartida(p: Partial<Match>): Match {
  return { id: 0, tournament_id: 0, team_a_id: 0, team_b_id: null, rodada: 1, score_a: 0, score_b: 0, status: 'AGENDADO', data_hora: null, ...p }
}

function idDoUsuarioLogado(): number | null {
  const sessao = getSession()
  return sessao ? sessao.user.id : null
}

export const httpApi: Api = {
  auth: {
    async login({ email, senha }) {
      const dados = await request<{ access_token: string; user: User }>('/auth/login', 'POST', { email, senha })
      return { token: dados.access_token, user: dados.user }
    },
    register({ nome, email, senha }) {
      return request('/users', 'POST', { nome, email, senha, role: 'organizador' })
    },
  },

  tournaments: {
    async list() {
      const lista = await request<Tournament[]>('/tournaments')
      return lista.map(completarCampeonato)
    },
    async get(id) {
      return completarCampeonato(await request<Tournament>(`/tournaments/${id}`))
    },
    async create(dados) {
      return completarCampeonato(await request<Tournament>('/tournaments', 'POST', { ...dados, organizador_id: idDoUsuarioLogado() }))
    },
    async update(id, dados) {
      return completarCampeonato(await request<Tournament>(`/tournaments/${id}`, 'PUT', dados))
    },
    remove(id) {
      return request(`/tournaments/${id}`, 'DELETE')
    },
    async enrollTeams(id, teamIds) {
      // uma requisição para cada equipe escolhida
      for (const teamId of teamIds) {
        await request(`/tournaments/${id}/teams`, 'POST', { team_id: teamId })
      }
    },
    removeTeam(id, teamId) {
      return request(`/tournaments/${id}/teams/${teamId}`, 'DELETE')
    },
    generateMatches(id) {
      return request(`/tournaments/${id}/generate-matches`, 'POST')
    },
    nextRound(id) {
      return request(`/tournaments/${id}/next-round`, 'POST')
    },
  },

  teams: {
    async list() {
      const lista = await request<Team[]>('/teams')
      return lista.map(completarEquipe)
    },
    async create(dados) {
      return completarEquipe(await request<Team>('/teams', 'POST', { ...dados, capitao_id: idDoUsuarioLogado() }))
    },
    async update(id, dados) {
      return completarEquipe(await request<Team>(`/teams/${id}`, 'PUT', dados))
    },
    remove(id) {
      return request(`/teams/${id}`, 'DELETE')
    },
  },

  matches: {
    async list(tournamentId) {
      let caminho = '/matches'
      if (tournamentId) caminho += `?tournament_id=${tournamentId}`
      const lista = await request<Match[]>(caminho)
      return lista.map(completarPartida)
    },
    async schedule(id, dataHora) {
      return completarPartida(await request<Match>(`/matches/${id}`, 'PATCH', { data_hora: dataHora }))
    },
    async start(id) {
      return completarPartida(await request<Match>(`/matches/${id}`, 'PATCH', { status: 'EM_ANDAMENTO' }))
    },
    async saveResult(id, placar) {
      return completarPartida(await request<Match>(`/matches/${id}/result`, 'POST', placar))
    },
  },

  // só existe no modo demo
  resetDemo: null,
}
