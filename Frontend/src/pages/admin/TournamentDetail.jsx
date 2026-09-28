import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Award, CalendarDays, GitBranch, ListOrdered, Pencil, Plus, Shuffle, Swords, Trash2, UserMinus, UserPlus, Users } from 'lucide-react'
import { api } from '../../services/api'
import { useToast } from '../../context/ToastContext'
import { Button, IconButton } from '../../components/ui/Button'
import { Badge, StatusBadge } from '../../components/ui/Badge'
import { Tabs } from '../../components/ui/Tabs'
import { TeamLogo } from '../../components/ui/TeamLogo'
import { EmptyState, ErrorState } from '../../components/ui/EmptyState'
import { Skeleton } from '../../components/ui/Loader'
import { ConfirmDialog } from '../../components/ui/ConfirmDialog'
import { MatchCard } from '../../components/matches/MatchCard'
import { ScoreModal } from '../../components/matches/ScoreModal'
import { ScheduleModal } from '../../components/matches/ScheduleModal'
import { TournamentForm } from '../../components/tournaments/TournamentForm'
import { EnrollTeamsModal } from '../../components/tournaments/EnrollTeamsModal'
import { Bracket } from '../../components/tournaments/Bracket'
import { ProgressRing } from '../../components/tournaments/ProgressRing'
import { ChampionBanner } from '../../components/tournaments/ChampionBanner'
import { StandingsTable } from '../../components/tournaments/StandingsTable'
import { FORMATS, getGame } from '../../utils/constants'
import { formatDate } from '../../utils/format'
import { roundLabel } from '../../utils/bracket'
import { canGenerateNextRound, computeStandings, currentRoundOf, findChampion, indexById, lastRoundOf, tournamentProgress } from '../../utils/standings'

export function TournamentDetail() {
  const { id } = useParams() // id que está na URL: /admin/campeonatos/:id
  const navigate = useNavigate()
  const toast = useToast()

  const [dados, setDados] = useState(null)
  const [erro, setErro] = useState(null)
  const [aba, setAba] = useState(null) // null = escolhe sozinho (ver "abaAtual" abaixo)

  // Modais (null/false = fechado)
  const [formAberto, setFormAberto] = useState(false)
  const [inscricaoAberta, setInscricaoAberta] = useState(false)
  const [confirmacao, setConfirmacao] = useState(null) // 'gerar', 'proxima' ou 'excluir'
  const [removendoEquipe, setRemovendoEquipe] = useState(null)
  const [partidaAgendar, setPartidaAgendar] = useState(null)
  const [partidaPlacar, setPartidaPlacar] = useState(null)
  const [iniciandoId, setIniciandoId] = useState(null)

  async function carregar() {
    try {
      const [tournament, teams, matches] = await Promise.all([
        api.tournaments.get(id),
        api.teams.list(),
        api.matches.list({ tournament_id: id }),
      ])
      setDados({ tournament, teams, matches })
      setErro(null)
    } catch (e) {
      setErro(e)
    }
  }

  // roda quando a tela abre e sempre que o id da URL mudar
  useEffect(() => {
    carregar()
  }, [id])

  if (erro) {
    return (
      <>
        <Link to="/admin/campeonatos" className="back-link">
          <ArrowLeft size={16} /> Campeonatos
        </Link>
        <ErrorState error={erro} onRetry={carregar} />
      </>
    )
  }
  if (!dados) {
    return (
      <div className="stack-lg">
        <Skeleton height={280} />
        <Skeleton height={380} />
      </div>
    )
  }

  // ---------- Informações calculadas a partir dos dados ----------
  const { tournament, teams, matches } = dados
  const teamsById = indexById(teams)
  const game = getGame(tournament.jogo)
  const temPartidas = matches.length > 0
  const ehMataMata = tournament.formato === 'eliminatoria'
  const progresso = tournamentProgress(matches)
  const campeaoId = findChampion(tournament, matches)
  const inscritas = tournament.team_ids.map((teamId) => teamsById[teamId])
  const vagas = tournament.max_equipes - inscritas.length
  // só dá para mexer nas inscrições antes de gerar as partidas
  const podeEditarEquipes = !temPartidas && tournament.status !== 'FINALIZADO'

  // Agrupa as partidas por rodada: [{ numero: 1, partidas: [...] }, ...]
  const rodadas = []
  for (let numero = 1; numero <= lastRoundOf(matches); numero++) {
    rodadas.push({ numero, partidas: matches.filter((m) => m.rodada === numero) })
  }

  // Aba aberta: a que o usuário clicou, ou "partidas" se o campeonato já começou
  let abaAtual = aba
  if (abaAtual === null) abaAtual = temPartidas ? 'partidas' : 'equipes'

  const abas = [
    { id: 'equipes', label: 'Equipes', icon: Users, count: inscritas.length },
    { id: 'partidas', label: 'Partidas', icon: Swords, count: progresso.total },
  ]
  if (temPartidas && ehMataMata) abas.push({ id: 'chaveamento', label: 'Chaveamento', icon: GitBranch })
  if (temPartidas && !ehMataMata) abas.push({ id: 'classificacao', label: 'Classificação', icon: ListOrdered })

  // Texto do terceiro mini indicador
  let faseAtual = '—'
  if (temPartidas && ehMataMata) faseAtual = roundLabel('eliminatoria', lastRoundOf(matches), rodadas[rodadas.length - 1].partidas)
  if (temPartidas && !ehMataMata) faseAtual = `R${currentRoundOf(matches)}`

  // ---------- Ações ----------

  async function gerarPartidas() {
    try {
      await api.tournaments.generateMatches(tournament.id)
      toast.success('Partidas geradas!', 'Campeonato iniciado. Ajuste os horários se precisar.')
      setConfirmacao(null)
      setAba('partidas')
      carregar()
    } catch (e) {
      toast.error('Não foi possível gerar as partidas', e.message)
    }
  }

  async function gerarProximaFase() {
    try {
      await api.tournaments.nextRound(tournament.id)
      toast.success('Próxima fase gerada!', 'Os vencedores já estão no chaveamento.')
      setConfirmacao(null)
      setAba('partidas')
      carregar()
    } catch (e) {
      toast.error('Não foi possível gerar a fase', e.message)
    }
  }

  async function excluirCampeonato() {
    try {
      await api.tournaments.remove(tournament.id)
      toast.success('Campeonato excluído', tournament.nome)
      navigate('/admin/campeonatos')
    } catch (e) {
      toast.error('Não foi possível excluir', e.message)
    }
  }

  async function removerEquipe() {
    try {
      await api.tournaments.removeTeam(tournament.id, removendoEquipe.id)
      toast.success('Equipe removida', removendoEquipe.nome)
      carregar()
    } catch (e) {
      toast.error('Não foi possível remover', e.message)
    }
    setRemovendoEquipe(null)
  }

  async function salvarEdicao(campos) {
    await api.tournaments.update(tournament.id, campos)
    toast.success('Campeonato atualizado')
    setFormAberto(false)
    carregar()
  }

  async function iniciar(partida) {
    setIniciandoId(partida.id)
    try {
      await api.matches.start(partida.id)
      toast.success('Partida iniciada!', 'Ela já aparece como AO VIVO.')
      await carregar()
    } catch (e) {
      toast.error('Não foi possível iniciar', e.message)
    }
    setIniciandoId(null)
  }

  // ---------- Tela ----------

  return (
    <div className="stack-lg">
      <Link to="/admin/campeonatos" className="back-link">
        <ArrowLeft size={16} /> Campeonatos
      </Link>

      {/* Cabeçalho do campeonato */}
      <motion.section className="detail-hero" style={{ '--game': game.color }} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <span className="detail-hero__watermark" aria-hidden="true">
          {game.short}
        </span>

        <div className="detail-hero__main">
          <div className="detail-hero__badges">
            <span className="game-tag">{tournament.jogo}</span>
            <StatusBadge status={tournament.status} />
            <Badge tone="violet" icon={ehMataMata ? GitBranch : ListOrdered}>
              {FORMATS[tournament.formato].label}
            </Badge>
          </div>
          <h1 className="detail-hero__title">{tournament.nome}</h1>
          {tournament.descricao && <p className="detail-hero__desc">{tournament.descricao}</p>}
          <ul className="detail-hero__meta">
            {tournament.data_inicio && (
              <li>
                <CalendarDays size={16} /> {formatDate(tournament.data_inicio)} → {formatDate(tournament.data_fim)}
              </li>
            )}
            {tournament.premiacao && (
              <li>
                <Award size={16} /> {tournament.premiacao}
              </li>
            )}
          </ul>

          <div className="detail-hero__actions">
            {!temPartidas && (
              <Button icon={Shuffle} onClick={() => setConfirmacao('gerar')} disabled={inscritas.length < 2}>
                Gerar partidas
              </Button>
            )}
            {ehMataMata && canGenerateNextRound(matches) && (
              <Button icon={GitBranch} onClick={() => setConfirmacao('proxima')}>
                Gerar próxima fase
              </Button>
            )}
            <Button variant="ghost" icon={Pencil} onClick={() => setFormAberto(true)}>
              Editar
            </Button>
            <Button variant="ghost" icon={Trash2} className="btn--ghost-danger" onClick={() => setConfirmacao('excluir')}>
              Excluir
            </Button>
          </div>
        </div>

        <div className="detail-hero__stats">
          <ProgressRing pct={progresso.pct} />
          <div className="mini-stats">
            <div>
              <strong>
                {inscritas.length}
                <small>/{tournament.max_equipes}</small>
              </strong>
              <span>Equipes</span>
            </div>
            <div>
              <strong>
                {progresso.done}
                <small>/{progresso.total}</small>
              </strong>
              <span>Partidas</span>
            </div>
            <div>
              <strong>{faseAtual}</strong>
              <span>{ehMataMata ? 'Fase atual' : 'Rodada atual'}</span>
            </div>
          </div>
        </div>
      </motion.section>

      {campeaoId && <ChampionBanner team={teamsById[campeaoId]} />}

      <div className="toolbar">
        <Tabs items={abas} value={abaAtual} onChange={setAba} />
        {abaAtual === 'equipes' && podeEditarEquipes && (
          <Button icon={UserPlus} onClick={() => setInscricaoAberta(true)} disabled={vagas === 0}>
            Inscrever equipes
          </Button>
        )}
      </div>

      {/* ABA EQUIPES: inscritas + vagas abertas */}
      {abaAtual === 'equipes' && (
        <div className="slots">
          {inscritas.map((team, indice) => (
            <motion.div
              key={team.id}
              className="slot"
              style={{ '--team': team.cor }}
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: indice * 0.05 }}
            >
              <TeamLogo team={team} size={52} glow />
              <div className="slot__info">
                <strong>{team.nome}</strong>
                <span>
                  {team.jogadores.length} jogadores · cap. {team.capitao || '—'}
                </span>
              </div>
              {podeEditarEquipes && <IconButton icon={UserMinus} label={`Remover ${team.nome}`} tone="danger" onClick={() => setRemovendoEquipe(team)} />}
            </motion.div>
          ))}

          {/* mostra até 4 "vagas abertas" para clicar e inscrever */}
          {podeEditarEquipes &&
            [0, 1, 2, 3].slice(0, vagas).map((i) => (
              <button key={`vaga-${i}`} type="button" className="slot slot--empty" onClick={() => setInscricaoAberta(true)}>
                <span className="slot__plus">
                  <Plus size={20} />
                </span>
                <span>Vaga aberta</span>
              </button>
            ))}
          {podeEditarEquipes && vagas > 4 && <p className="slots__more muted">+{vagas - 4} vagas disponíveis</p>}
          {inscritas.length === 0 && !podeEditarEquipes && <EmptyState icon={Users} title="Nenhuma equipe inscrita" />}
        </div>
      )}

      {/* ABA PARTIDAS: uma seção para cada rodada */}
      {abaAtual === 'partidas' && !temPartidas && (
        <EmptyState icon={Swords} title="As partidas ainda não foram geradas">
          {inscritas.length < 2 ? 'Inscreva pelo menos 2 equipes para gerar a tabela.' : 'Clique em “Gerar partidas” no topo da página.'}
        </EmptyState>
      )}
      {abaAtual === 'partidas' &&
        rodadas.map((rodada) => {
          const finalizadas = rodada.partidas.filter((m) => m.status === 'FINALIZADO').length
          return (
            <section key={rodada.numero}>
              <div className="section-head">
                <h2 className="section-title">{roundLabel(tournament.formato, rodada.numero, rodada.partidas)}</h2>
                <span className="muted">
                  {finalizadas}/{rodada.partidas.length} finalizadas
                </span>
              </div>
              <div className="grid-matches">
                {rodada.partidas.map((m, indice) => (
                  <MatchCard
                    key={m.id}
                    match={m}
                    teamA={teamsById[m.team_a_id]}
                    teamB={teamsById[m.team_b_id]}
                    label={`Partida #${m.id}`}
                    delay={indice * 0.05}
                    busy={iniciandoId === m.id}
                    onSchedule={setPartidaAgendar}
                    onStart={iniciar}
                    onResult={setPartidaPlacar}
                  />
                ))}
              </div>
            </section>
          )
        })}

      {abaAtual === 'chaveamento' && <Bracket matches={matches} teamsById={teamsById} championId={campeaoId} />}

      {abaAtual === 'classificacao' && (
        <>
          <StandingsTable rows={computeStandings(tournament.team_ids, matches)} teamsById={teamsById} />
          <p className="muted small">Prévia para o organizador (vitória 3 pts, empate 1). A tabela oficial para o público é calculada pelo backend.</p>
        </>
      )}

      {/* ---------- Modais ---------- */}

      {formAberto && <TournamentForm tournament={tournament} lockFormat={temPartidas} onClose={() => setFormAberto(false)} onSubmit={salvarEdicao} />}

      {inscricaoAberta && <EnrollTeamsModal tournament={tournament} teams={teams} onClose={() => setInscricaoAberta(false)} onSaved={carregar} />}

      {confirmacao === 'gerar' && (
        <ConfirmDialog title="Gerar partidas?" confirmLabel="Gerar partidas" tone="primary" icon={Shuffle} onConfirm={gerarPartidas} onClose={() => setConfirmacao(null)}>
          {ehMataMata
            ? `As ${inscritas.length} equipes serão sorteadas na primeira fase do mata-mata.`
            : `Serão criadas ${(inscritas.length * (inscritas.length - 1)) / 2} partidas (todos contra todos).`}{' '}
          As inscrições serão encerradas.
        </ConfirmDialog>
      )}

      {confirmacao === 'proxima' && (
        <ConfirmDialog title="Gerar próxima fase?" confirmLabel="Gerar fase" tone="primary" icon={GitBranch} onConfirm={gerarProximaFase} onClose={() => setConfirmacao(null)}>
          Os vencedores da fase atual serão pareados. Depois disso os resultados desta fase não poderão mais ser alterados.
        </ConfirmDialog>
      )}

      {confirmacao === 'excluir' && (
        <ConfirmDialog title="Excluir campeonato?" confirmLabel="Excluir" icon={Trash2} onConfirm={excluirCampeonato} onClose={() => setConfirmacao(null)}>
          <strong>{tournament.nome}</strong> e todas as suas partidas serão removidos. Essa ação não pode ser desfeita.
        </ConfirmDialog>
      )}

      {removendoEquipe && (
        <ConfirmDialog title="Remover equipe?" confirmLabel="Remover" icon={UserMinus} onConfirm={removerEquipe} onClose={() => setRemovendoEquipe(null)}>
          <strong>{removendoEquipe.nome}</strong> deixará de participar de {tournament.nome}.
        </ConfirmDialog>
      )}

      {partidaAgendar && (
        <ScheduleModal
          match={partidaAgendar}
          teamA={teamsById[partidaAgendar.team_a_id]}
          teamB={teamsById[partidaAgendar.team_b_id]}
          onClose={() => setPartidaAgendar(null)}
          onSaved={carregar}
        />
      )}

      {partidaPlacar && (
        <ScoreModal
          match={partidaPlacar}
          teamA={teamsById[partidaPlacar.team_a_id]}
          teamB={teamsById[partidaPlacar.team_b_id]}
          tournament={tournament}
          onClose={() => setPartidaPlacar(null)}
          onSaved={carregar}
        />
      )}
    </div>
  )
}
