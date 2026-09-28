import { API_BASE } from './config'
import { ApiError } from './errors'
import { getSession } from './session'
import { makeTag } from '../utils/format'

// Chamadas ao backend FastAPI de verdade. A lista de rotas está no Frontend/README.md.

// Função única que faz todas as requisições HTTP
async function request(caminho, metodo = 'GET', corpo) {
  const headers = { 'Content-Type': 'application/json' }

  // se estiver logado, manda o token junto
  const sessao = getSession()
  if (sessao && sessao.token) headers.Authorization = `Bearer ${sessao.token}`

  let resposta
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

  if (resposta.status === 204) return null // 204 = sucesso sem conteúdo (ex.: DELETE)

  let dados = null
  try {
    dados = await resposta.json()
  } catch {
    dados = null
  }

  if (!resposta.ok) throw new ApiError(mensagemDeErro(dados, resposta.status), resposta.status)
  return dados
}

// O FastAPI devolve os erros como { "detail": "mensagem" }
function mensagemDeErro(dados, status) {
  if (dados && typeof dados.detail === 'string') return dados.detail
  if (status === 404) return 'Recurso não encontrado (essa rota já existe no backend?).'
  if (status >= 500) return 'Servidor indisponível no momento.'
  return `Erro ${status} ao falar com o servidor.`
}

// O backend atual ainda não guarda todos os campos que as telas usam.
// Estas funções completam com valores padrão para a tela não quebrar.
function completarCampeonato(t) {
  return {
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

function completarEquipe(e) {
  return { tag: makeTag(e.nome), cor: '#00f0ff', capitao: '', jogadores: [], ...e }
}

function completarPartida(p) {
  return { rodada: 1, score_a: 0, score_b: 0, status: 'AGENDADO', data_hora: null, ...p }
}

function idDoUsuarioLogado() {
  const sessao = getSession()
  return sessao ? sessao.user.id : null
}

export const httpApi = {
  auth: {
    async login({ email, senha }) {
      const dados = await request('/auth/login', 'POST', { email, senha })
      return { token: dados.access_token, user: dados.user }
    },
    register({ nome, email, senha }) {
      return request('/users', 'POST', { nome, email, senha, role: 'organizador' })
    },
  },

  tournaments: {
    async list() {
      const lista = await request('/tournaments')
      return lista.map(completarCampeonato)
    },
    async get(id) {
      return completarCampeonato(await request(`/tournaments/${id}`))
    },
    create(dados) {
      return request('/tournaments', 'POST', { ...dados, organizador_id: idDoUsuarioLogado() })
    },
    update(id, dados) {
      return request(`/tournaments/${id}`, 'PUT', dados)
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
      const lista = await request('/teams')
      return lista.map(completarEquipe)
    },
    create(dados) {
      return request('/teams', 'POST', { ...dados, capitao_id: idDoUsuarioLogado() })
    },
    update(id, dados) {
      return request(`/teams/${id}`, 'PUT', dados)
    },
    remove(id) {
      return request(`/teams/${id}`, 'DELETE')
    },
  },

  matches: {
    async list(filtro = {}) {
      let caminho = '/matches'
      if (filtro.tournament_id) caminho += `?tournament_id=${filtro.tournament_id}`
      const lista = await request(caminho)
      return lista.map(completarPartida)
    },
    schedule(id, dataHora) {
      return request(`/matches/${id}`, 'PATCH', { data_hora: dataHora })
    },
    start(id) {
      return request(`/matches/${id}`, 'PATCH', { status: 'EM_ANDAMENTO' })
    },
    saveResult(id, placar) {
      return request(`/matches/${id}/result`, 'POST', placar)
    },
  },

  // só existe no modo demo
  resetDemo: null,
}
