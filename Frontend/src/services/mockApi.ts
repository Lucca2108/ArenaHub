import type { Api, Confronto, Match, Team, Tournament, TournamentInput, TeamInput, User } from '@/types'
import { ApiError } from './errors'
import { getSession } from './session'
import { roundRobin, eliminationRound, matchWinner, shuffle } from '@/utils/bracket'

// =====================================================================
// "Backend de mentira" para o painel funcionar sem o FastAPI rodando.
// Os dados ficam salvos no localStorage do navegador.
// Segue a interface Api (types.ts), igual ao httpApi.ts.
// =====================================================================

const CHAVE = 'arenahub:mockdb:v2'

// Usuário do modo demo (guarda a senha só porque é uma simulação)
interface UsuarioDemo extends User {
  senha: string
}

// Tudo que o "banco" guarda
interface Banco {
  users: UsuarioDemo[]
  teams: Team[]
  tournaments: Tournament[]
  matches: Match[]
}

// ---------- Funções auxiliares ----------

// Simula a demora de uma requisição de verdade (para aparecer o "carregando")
function esperar(ms = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

// Devolve uma cópia, para a tela nunca alterar o "banco" sem querer.
// <T> = funciona com qualquer tipo e devolve o mesmo tipo que recebeu.
function copia<T>(valor: T): T {
  return JSON.parse(JSON.stringify(valor))
}

function proximoId(lista: { id: number }[]): number {
  let maior = 0
  for (const item of lista) {
    if (item.id > maior) maior = item.id
  }
  return maior + 1
}

// dataRelativa(2, 19) = daqui a 2 dias, às 19h | dataRelativa(-1, 20) = ontem, às 20h
function dataRelativa(dias: number, hora: number): string {
  const data = new Date()
  data.setDate(data.getDate() + dias)
  data.setHours(hora, 0, 0, 0)
  return data.toISOString()
}

function usuarioLogadoId(): number {
  const sessao = getSession()
  return sessao ? sessao.user.id : 1
}

// ---------- Dados de exemplo ----------

function dadosIniciais(): Banco {
  const users: UsuarioDemo[] = [{ id: 1, nome: 'Organizador ArenaHub', email: 'organizador@arenahub.gg', senha: 'arena123', role: 'organizador' }]

  function equipe(id: number, nome: string, tag: string, cor: string, jogadores: string[]): Team {
    // o primeiro jogador da lista é o capitão
    return { id, nome, tag, cor, jogadores, capitao: jogadores[0], capitao_id: 1 }
  }

  const teams: Team[] = [
    equipe(1, 'Nexus Wolves', 'NXW', '#00f0ff', ['Kaze', 'Rift', 'Nyx', 'Volt', 'Orion']),
    equipe(2, 'Crimson Vipers', 'CRV', '#ff3b5c', ['Viper', 'Blaze', 'Sable', 'Ember', 'Hex']),
    equipe(3, 'Void Reapers', 'VDR', '#8b5cf6', ['Reap', 'Null', 'Eclipse', 'Shade', 'Wraith']),
    equipe(4, 'Neon Samurai', 'NSM', '#ff2bd6', ['Ronin', 'Kenji', 'Aiko', 'Katana', 'Shogun']),
    equipe(5, 'Iron Phoenix', 'IPX', '#ffb020', ['Ash', 'Pyro', 'Flint', 'Cinder', 'Talon']),
    equipe(6, 'Shadow Owls', 'SOW', '#1f8bff', ['Hoot', 'Nocturn', 'Moss', 'Gale', 'Echo']),
    equipe(7, 'Titan Forge', 'TTF', '#b6ff3b', ['Anvil', 'Colossus', 'Brick', 'Steel', 'Atlas']),
    equipe(8, 'Storm Riders', 'STR', '#26e07f', ['Thunder', 'Zephyr', 'Bolt', 'Cyclone', 'Nimbus']),
  ]

  const tournaments: Tournament[] = [
    {
      id: 1,
      nome: 'Copa UNIT Valorant',
      descricao: 'Campeonato universitário de Valorant em pontos corridos. Partidas MD1, vitória vale 3 pontos.',
      jogo: 'Valorant',
      formato: 'pontos_corridos',
      status: 'EM_ANDAMENTO',
      data_inicio: dataRelativa(-10, 19),
      data_fim: dataRelativa(20, 22),
      max_equipes: 8,
      premiacao: 'R$ 1.500 + troféu',
      team_ids: [1, 2, 3, 4, 5, 6],
      organizador_id: 1,
      created_at: dataRelativa(-20, 10),
    },
    {
      id: 2,
      nome: 'Liga CS2 Aracaju',
      descricao: 'Mata-mata MD3 aberto para equipes de Sergipe. Inscrições até a véspera do início.',
      jogo: 'Counter-Strike 2',
      formato: 'eliminatoria',
      status: 'INSCRICOES_ABERTAS',
      data_inicio: dataRelativa(7, 18),
      data_fim: dataRelativa(9, 23),
      max_equipes: 8,
      premiacao: 'R$ 800 + periféricos',
      team_ids: [2, 4, 5, 7, 8],
      organizador_id: 1,
      created_at: dataRelativa(-5, 15),
    },
    {
      id: 3,
      nome: 'Rocket Rush Cup',
      descricao: 'Torneio relâmpago 3v3 de Rocket League.',
      jogo: 'Rocket League',
      formato: 'eliminatoria',
      status: 'FINALIZADO',
      data_inicio: dataRelativa(-40, 14),
      data_fim: dataRelativa(-40, 20),
      max_equipes: 4,
      premiacao: 'Medalhas + skins',
      team_ids: [1, 3, 6, 8],
      organizador_id: 1,
      created_at: dataRelativa(-50, 9),
    },
  ]

  const matches: Match[] = []

  // Copa Valorant: rodadas 1 e 2 já jogadas, rodada 3 acontecendo hoje, rodadas 4 e 5 no futuro
  const PLACARES = [[10, 13], [2, 13], [13, 5], [8, 13], [13, 5], [13, 6]]
  const DIA_DE_CADA_RODADA = [-9, -2, 0, 5, 12]
  const confrontos = roundRobin([1, 2, 3, 4, 5, 6])
  for (let i = 0; i < confrontos.length; i++) {
    const confronto = confrontos[i]
    const horario = 19 + (i % 3) // 3 jogos por rodada: 19h, 20h e 21h
    const partida: Match = {
      id: i + 1,
      tournament_id: 1,
      rodada: confronto.rodada,
      team_a_id: confronto.team_a_id,
      team_b_id: confronto.team_b_id,
      score_a: 0,
      score_b: 0,
      status: 'AGENDADO',
      data_hora: dataRelativa(DIA_DE_CADA_RODADA[confronto.rodada - 1], horario),
    }
    if (confronto.rodada <= 2) {
      partida.status = 'FINALIZADO'
      partida.score_a = PLACARES[i][0]
      partida.score_b = PLACARES[i][1]
    }
    if (confronto.rodada === 3 && i % 3 === 0) {
      partida.status = 'EM_ANDAMENTO'
      partida.score_a = 9
      partida.score_b = 7
      partida.data_hora = new Date().toISOString()
    }
    matches.push(partida)
  }

  // Rocket Rush Cup (já terminou): semifinais e final
  const dia = dataRelativa(-40, 14)
  matches.push({ id: 16, tournament_id: 3, rodada: 1, team_a_id: 1, team_b_id: 3, score_a: 3, score_b: 1, status: 'FINALIZADO', data_hora: dia })
  matches.push({ id: 17, tournament_id: 3, rodada: 1, team_a_id: 6, team_b_id: 8, score_a: 2, score_b: 4, status: 'FINALIZADO', data_hora: dia })
  matches.push({ id: 18, tournament_id: 3, rodada: 2, team_a_id: 1, team_b_id: 8, score_a: 3, score_b: 2, status: 'FINALIZADO', data_hora: dia })

  return { users, teams, tournaments, matches }
}

// ---------- O "banco de dados" ----------

let banco: Banco | null = null

function carregarBanco(): Banco {
  if (banco === null) {
    // primeira vez: lê do navegador ou cria os dados de exemplo
    const salvo = localStorage.getItem(CHAVE)
    const dados: Banco = salvo ? JSON.parse(salvo) : dadosIniciais()
    banco = dados
    salvarBanco()
    return dados
  }
  return banco
}

function salvarBanco() {
  localStorage.setItem(CHAVE, JSON.stringify(banco))
}

function buscarCampeonato(id: number): Tournament {
  const tournament = carregarBanco().tournaments.find((t) => t.id === id)
  if (!tournament) throw new ApiError('Campeonato não encontrado.', 404)
  return tournament
}

function buscarEquipe(id: number): Team {
  const team = carregarBanco().teams.find((t) => t.id === id)
  if (!team) throw new ApiError('Equipe não encontrada.', 404)
  return team
}

function buscarPartida(id: number): Match {
  const partida = carregarBanco().matches.find((m) => m.id === id)
  if (!partida) throw new ApiError('Partida não encontrada.', 404)
  return partida
}

// ---------- Regras de negócio simuladas ----------
// (as regras oficiais ficam no backend; aqui é só para o painel funcionar)

function partidasDoCampeonato(tournamentId: number): Match[] {
  return carregarBanco().matches.filter((m) => m.tournament_id === tournamentId)
}

function ultimaRodada(tournamentId: number): number {
  let maior = 0
  for (const m of partidasDoCampeonato(tournamentId)) {
    if (m.rodada > maior) maior = m.rodada
  }
  return maior
}

// Horário sugerido: começa no início do campeonato, 1 hora entre cada jogo da mesma rodada.
// Pontos corridos: 1 rodada por semana. Mata-mata: 1 fase por dia.
function horarioSugerido(tournament: Tournament, rodada: number, ordem: number): string {
  const data = tournament.data_inicio ? new Date(tournament.data_inicio) : new Date()
  const diasEntreRodadas = tournament.formato === 'eliminatoria' ? 1 : 7
  data.setDate(data.getDate() + (rodada - 1) * diasEntreRodadas)
  data.setHours(19 + ordem, 0, 0, 0)
  return data.toISOString()
}

function criarPartidas(tournament: Tournament, confrontos: Confronto[]) {
  const { matches } = carregarBanco()
  const jogosPorRodada: Record<number, number> = {} // quantos jogos cada rodada já tem, para espaçar os horários

  for (const confronto of confrontos) {
    const ordem = jogosPorRodada[confronto.rodada] || 0
    jogosPorRodada[confronto.rodada] = ordem + 1
    const ehBye = confronto.team_b_id === null // time sem adversário avança direto

    matches.push({
      id: proximoId(matches),
      tournament_id: tournament.id,
      rodada: confronto.rodada,
      team_a_id: confronto.team_a_id,
      team_b_id: confronto.team_b_id,
      score_a: 0,
      score_b: 0,
      status: ehBye ? 'FINALIZADO' : 'AGENDADO',
      data_hora: ehBye ? null : horarioSugerido(tournament, confronto.rodada, ordem),
    })
  }
}

// Depois de cada resultado, vê se o campeonato terminou
function atualizarStatus(tournament: Tournament) {
  const partidas = partidasDoCampeonato(tournament.id)
  if (partidas.length === 0) return

  if (tournament.formato === 'pontos_corridos') {
    const todasFinalizadas = partidas.every((m) => m.status === 'FINALIZADO')
    tournament.status = todasFinalizadas ? 'FINALIZADO' : 'EM_ANDAMENTO'
    return
  }

  // Mata-mata: terminou quando a última fase tem 1 só partida (a final) e ela foi finalizada
  const faseAtual = partidas.filter((m) => m.rodada === ultimaRodada(tournament.id))
  const ehFinal = faseAtual.length === 1 && faseAtual[0].team_b_id !== null
  if (ehFinal && faseAtual[0].status === 'FINALIZADO') tournament.status = 'FINALIZADO'
  else tournament.status = 'EM_ANDAMENTO'
}

// Copia os campos do formulário para o campeonato
function preencherCampeonato(tournament: Tournament, dados: TournamentInput) {
  tournament.nome = dados.nome
  tournament.jogo = dados.jogo
  tournament.formato = dados.formato
  tournament.descricao = dados.descricao
  tournament.data_inicio = dados.data_inicio
  tournament.data_fim = dados.data_fim
  tournament.max_equipes = dados.max_equipes
  tournament.premiacao = dados.premiacao
  if (dados.status) tournament.status = dados.status
}

function preencherEquipe(team: Team, dados: TeamInput) {
  team.nome = dados.nome
  team.tag = dados.tag
  team.cor = dados.cor
  team.capitao = dados.capitao
  team.jogadores = dados.jogadores
}

// ---------- Funções chamadas pelas telas ----------

export const mockApi: Api = {
  auth: {
    async login({ email, senha }) {
      await esperar(500)
      const user = carregarBanco().users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase())
      if (!user || user.senha !== senha) throw new ApiError('E-mail ou senha inválidos.', 401)
      if (user.role !== 'organizador') throw new ApiError('Acesso restrito a organizadores.', 403)
      return { token: `token-demo-${user.id}`, user: { id: user.id, nome: user.nome, email: user.email, role: user.role } }
    },

    async register({ nome, email, senha }) {
      await esperar(500)
      const { users } = carregarBanco()
      if (users.some((u) => u.email.toLowerCase() === email.trim().toLowerCase())) {
        throw new ApiError('E-mail já cadastrado.', 400)
      }
      const user: UsuarioDemo = { id: proximoId(users), nome, email, senha, role: 'organizador' }
      users.push(user)
      salvarBanco()
      return { id: user.id, nome, email, role: user.role }
    },
  },

  tournaments: {
    async list() {
      await esperar()
      const lista = copia(carregarBanco().tournaments)
      lista.sort((a, b) => b.id - a.id) // mais recentes primeiro
      return lista
    },

    async get(id) {
      await esperar()
      return copia(buscarCampeonato(id))
    },

    async create(dados) {
      await esperar()
      const { tournaments } = carregarBanco()
      const tournament: Tournament = {
        id: proximoId(tournaments),
        nome: '',
        descricao: '',
        jogo: '',
        formato: 'pontos_corridos',
        status: 'INSCRICOES_ABERTAS',
        data_inicio: null,
        data_fim: null,
        max_equipes: 8,
        premiacao: '',
        team_ids: [],
        organizador_id: usuarioLogadoId(),
        created_at: new Date().toISOString(),
      }
      preencherCampeonato(tournament, dados)
      tournaments.push(tournament)
      salvarBanco()
      return copia(tournament)
    },

    async update(id, dados) {
      await esperar()
      const tournament = buscarCampeonato(id)
      if (dados.max_equipes < tournament.team_ids.length) {
        throw new ApiError(`Já existem ${tournament.team_ids.length} equipes inscritas; aumente o limite.`, 422)
      }
      const jaTemPartidas = partidasDoCampeonato(tournament.id).length > 0
      if (jaTemPartidas && dados.formato !== tournament.formato) {
        throw new ApiError('Não dá para mudar o formato depois que as partidas foram geradas.', 409)
      }
      preencherCampeonato(tournament, dados)
      salvarBanco()
      return copia(tournament)
    },

    async remove(id) {
      await esperar()
      const db = carregarBanco()
      buscarCampeonato(id)
      // apaga o campeonato e as partidas dele
      db.tournaments = db.tournaments.filter((t) => t.id !== id)
      db.matches = db.matches.filter((m) => m.tournament_id !== id)
      salvarBanco()
    },

    async enrollTeams(id, teamIds) {
      await esperar()
      const tournament = buscarCampeonato(id)
      if (partidasDoCampeonato(tournament.id).length > 0) {
        throw new ApiError('As partidas já foram geradas; inscrições encerradas.', 409)
      }
      if (tournament.team_ids.length + teamIds.length > tournament.max_equipes) {
        throw new ApiError(`Limite de ${tournament.max_equipes} equipes atingido.`, 422)
      }
      for (const teamId of teamIds) {
        if (!tournament.team_ids.includes(teamId)) tournament.team_ids.push(teamId)
      }
      salvarBanco()
    },

    async removeTeam(id, teamId) {
      await esperar()
      const tournament = buscarCampeonato(id)
      if (partidasDoCampeonato(tournament.id).length > 0) {
        throw new ApiError('As partidas já foram geradas; não dá para remover equipes.', 409)
      }
      tournament.team_ids = tournament.team_ids.filter((t) => t !== teamId)
      salvarBanco()
    },

    async generateMatches(id) {
      await esperar(600)
      const tournament = buscarCampeonato(id)
      if (partidasDoCampeonato(tournament.id).length > 0) throw new ApiError('As partidas já foram geradas.', 409)
      if (tournament.team_ids.length < 2) throw new ApiError('Inscreva pelo menos 2 equipes.', 422)

      // sorteia a ordem das equipes antes de montar os confrontos
      const equipesSorteadas = shuffle(tournament.team_ids)
      if (tournament.formato === 'eliminatoria') {
        criarPartidas(tournament, eliminationRound(equipesSorteadas, 1))
      } else {
        criarPartidas(tournament, roundRobin(equipesSorteadas))
      }
      atualizarStatus(tournament)
      salvarBanco()
    },

    async nextRound(id) {
      await esperar(600)
      const tournament = buscarCampeonato(id)
      const rodada = ultimaRodada(tournament.id)
      const faseAtual = partidasDoCampeonato(tournament.id).filter((m) => m.rodada === rodada)

      if (faseAtual.some((m) => m.status !== 'FINALIZADO')) {
        throw new ApiError('Finalize todas as partidas da fase atual antes.', 422)
      }

      // pega o vencedor de cada partida da fase
      const vencedores: number[] = []
      for (const partida of faseAtual) {
        const vencedor = matchWinner(partida)
        if (vencedor !== null) vencedores.push(vencedor)
      }
      if (vencedores.length < 2) throw new ApiError('O campeonato já tem um campeão.', 409)

      criarPartidas(tournament, eliminationRound(vencedores, rodada + 1))
      atualizarStatus(tournament)
      salvarBanco()
    },
  },

  teams: {
    async list() {
      await esperar()
      const lista = copia(carregarBanco().teams)
      lista.sort((a, b) => a.nome.localeCompare(b.nome)) // ordem alfabética
      return lista
    },

    async create(dados) {
      await esperar()
      const { teams } = carregarBanco()
      if (teams.some((t) => t.nome.toLowerCase() === dados.nome.toLowerCase())) {
        throw new ApiError('Já existe uma equipe com esse nome.', 400)
      }
      const team: Team = { id: proximoId(teams), nome: '', tag: '', cor: '', capitao: '', jogadores: [], capitao_id: usuarioLogadoId() }
      preencherEquipe(team, dados)
      teams.push(team)
      salvarBanco()
      return copia(team)
    },

    async update(id, dados) {
      await esperar()
      const { teams } = carregarBanco()
      const team = buscarEquipe(id)
      const nomeRepetido = teams.some((t) => t.id !== team.id && t.nome.toLowerCase() === dados.nome.toLowerCase())
      if (nomeRepetido) throw new ApiError('Já existe uma equipe com esse nome.', 400)
      preencherEquipe(team, dados)
      salvarBanco()
      return copia(team)
    },

    async remove(id) {
      await esperar()
      const db = carregarBanco()
      const team = buscarEquipe(id)
      const jaJogou = db.matches.some((m) => m.team_a_id === team.id || m.team_b_id === team.id)
      if (jaJogou) throw new ApiError('Essa equipe já tem partidas registradas e não pode ser excluída.', 409)

      // tira a equipe dos campeonatos em que estava inscrita
      for (const t of db.tournaments) {
        t.team_ids = t.team_ids.filter((teamId) => teamId !== team.id)
      }
      db.teams = db.teams.filter((t) => t.id !== team.id)
      salvarBanco()
    },
  },

  matches: {
    async list(tournamentId) {
      await esperar()
      let lista = carregarBanco().matches
      if (tournamentId) lista = lista.filter((m) => m.tournament_id === tournamentId)
      return copia(lista)
    },

    async schedule(id, dataHora) {
      await esperar()
      const partida = buscarPartida(id)
      partida.data_hora = dataHora
      salvarBanco()
      return copia(partida)
    },

    async start(id) {
      await esperar()
      const partida = buscarPartida(id)
      if (partida.status !== 'AGENDADO') throw new ApiError('Só partidas agendadas podem ser iniciadas.', 409)
      partida.status = 'EM_ANDAMENTO'
      salvarBanco()
      return copia(partida)
    },

    async saveResult(id, { score_a, score_b, finalizar }) {
      await esperar(400)
      const partida = buscarPartida(id)
      const tournament = buscarCampeonato(partida.tournament_id)

      if (tournament.formato === 'eliminatoria') {
        if (finalizar && score_a === score_b) throw new ApiError('No mata-mata não existe empate.', 422)
        if (partida.rodada < ultimaRodada(tournament.id)) {
          throw new ApiError('A próxima fase já foi gerada; esse resultado não pode mais mudar.', 409)
        }
      }

      partida.score_a = score_a
      partida.score_b = score_b
      partida.status = finalizar ? 'FINALIZADO' : 'EM_ANDAMENTO'
      atualizarStatus(tournament)
      salvarBanco()
      return copia(partida)
    },
  },

  async resetDemo() {
    banco = dadosIniciais()
    salvarBanco()
  },
}
