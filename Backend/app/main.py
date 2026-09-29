import os
import re
from typing import List, Optional

from fastapi import Depends, FastAPI, HTTPException, Response, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import func, text
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from . import bracket, models, schemas
from .auth import create_access_token, hash_password, require_organizer, verify_password
from .database import engine, get_db

app = FastAPI(
    title="ArenaHub API",
    description="Backend para gerenciamento de campeonatos amadores de e-sports.",
    version="1.1.0",
)

# --- CORS ---
# Em desenvolvimento o Next.js repassa /api/* para cá (sem CORS), mas liberamos o front local
# para quem chamar o backend direto do navegador. Extra: CORS_ORIGINS=http://a.com,http://b.com
_default_origins = ["http://localhost:3000", "http://127.0.0.1:3000"]
_extra_origins = [o.strip() for o in os.getenv("CORS_ORIGINS", "").split(",") if o.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=_default_origins + _extra_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ============================================================
# Helpers
# ============================================================
def _get_tournament(db: Session, tournament_id: int) -> models.Tournament:
    tournament = db.get(models.Tournament, tournament_id)
    if not tournament:
        raise HTTPException(status_code=404, detail="Campeonato não encontrado.")
    return tournament


def _get_owned_tournament(db: Session, tournament_id: int, user: models.User) -> models.Tournament:
    tournament = _get_tournament(db, tournament_id)
    if tournament.organizador_id != user.id:
        raise HTTPException(status_code=403, detail="Apenas o organizador deste campeonato pode alterá-lo.")
    return tournament


def _get_team(db: Session, team_id: int) -> models.Team:
    team = db.get(models.Team, team_id)
    if not team:
        raise HTTPException(status_code=404, detail="Equipe não encontrada.")
    return team


def _get_match(db: Session, match_id: int) -> models.Match:
    match = db.get(models.Match, match_id)
    if not match:
        raise HTTPException(status_code=404, detail="Partida não encontrada.")
    return match


def _tournament_matches(db: Session, tournament_id: int) -> list[models.Match]:
    return (
        db.query(models.Match)
        .filter(models.Match.tournament_id == tournament_id)
        .order_by(models.Match.rodada, models.Match.id)
        .all()
    )


def _has_matches(db: Session, tournament_id: int) -> bool:
    return db.query(models.Match.id).filter(models.Match.tournament_id == tournament_id).first() is not None


def _last_round(db: Session, tournament_id: int) -> int:
    return db.query(func.max(models.Match.rodada)).filter(models.Match.tournament_id == tournament_id).scalar() or 0


def _make_tag(nome: str) -> str:
    palavras = re.findall(r"[A-Za-z0-9]+", nome)
    if len(palavras) >= 2:
        tag = "".join(p[0] for p in palavras)
    else:
        tag = palavras[0] if palavras else ""
    return tag[:4].upper()


def _set_teams(db: Session, tournament: models.Tournament, team_ids: list[int]) -> None:
    """Define as equipes inscritas (valida existência, duplicatas e max_equipes)."""
    ids = list(dict.fromkeys(team_ids))
    teams = db.query(models.Team).filter(models.Team.id.in_(ids)).all() if ids else []
    encontrados = {t.id for t in teams}
    faltando = [i for i in ids if i not in encontrados]
    if faltando:
        raise HTTPException(status_code=404, detail=f"Equipe(s) não encontrada(s): {', '.join(map(str, faltando))}.")
    if len(ids) > tournament.max_equipes:
        raise HTTPException(status_code=422, detail=f"Limite de {tournament.max_equipes} equipes atingido.")
    tournament.teams = teams


def _create_matches(db: Session, tournament: models.Tournament, confrontos: list[bracket.Confronto]) -> list[models.Match]:
    criadas: list[models.Match] = []
    jogos_por_rodada: dict[int, int] = {}
    for c in confrontos:
        ordem = jogos_por_rodada.get(c.rodada, 0)
        jogos_por_rodada[c.rodada] = ordem + 1
        eh_bye = c.team_b_id is None  # time sem adversário avança direto
        match = models.Match(
            tournament_id=tournament.id,
            rodada=c.rodada,
            team_a_id=c.team_a_id,
            team_b_id=c.team_b_id,
            score_a=0,
            score_b=0,
            status="FINALIZADO" if eh_bye else "AGENDADO",
            data_hora=None if eh_bye else bracket.suggested_time(tournament.data_inicio, tournament.formato, c.rodada, ordem),
        )
        db.add(match)
        criadas.append(match)
    return criadas


def _update_tournament_status(db: Session, tournament: models.Tournament) -> None:
    """Depois de cada resultado, vê se o campeonato terminou (mesma regra do mockApi.ts)."""
    partidas = _tournament_matches(db, tournament.id)
    if not partidas:
        return
    if tournament.formato == "pontos_corridos":
        tournament.status = "FINALIZADO" if all(m.status == "FINALIZADO" for m in partidas) else "EM_ANDAMENTO"
        return
    ultima = max(m.rodada for m in partidas)
    fase_atual = [m for m in partidas if m.rodada == ultima]
    eh_final = len(fase_atual) == 1 and fase_atual[0].team_b_id is not None
    tournament.status = "FINALIZADO" if eh_final and fase_atual[0].status == "FINALIZADO" else "EM_ANDAMENTO"


# ============================================================
# Saúde / raiz
# ============================================================
@app.get("/")
def read_root():
    return {"message": "ArenaHub API está rodando com sucesso!"}


@app.get("/health/db")
def database_health(db: Session = Depends(get_db)):
    try:
        db.execute(text("SELECT 1"))
    except Exception as exc:  # noqa: BLE001 - qualquer falha de conexão vira 503
        raise HTTPException(status_code=503, detail=f"Falha ao conectar ao banco: {exc.__class__.__name__}") from exc
    return {"status": "ok", "database": engine.url.get_backend_name()}


# ============================================================
# Autenticação / usuários
# ============================================================
@app.post("/auth/login", response_model=schemas.LoginResponse)
def login(credentials: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == credentials.email).first()
    if not user or not verify_password(credentials.senha, user.senha_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="E-mail ou senha inválidos.")
    if user.role != "organizador":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Acesso restrito a organizadores.")
    return {"access_token": create_access_token(user), "token_type": "bearer", "user": user}


# --- RF01: Cadastro de Usuários ---
@app.post("/users", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    if db.query(models.User).filter(models.User.email == user.email).first():
        raise HTTPException(status_code=400, detail="E-mail já cadastrado.")

    new_user = models.User(nome=user.nome, email=user.email, senha_hash=hash_password(user.senha), role=user.role)
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user


# ============================================================
# Equipes
# ============================================================
def _team_name_taken(db: Session, nome: str, ignore_id: Optional[int] = None) -> bool:
    query = db.query(models.Team.id).filter(func.lower(models.Team.nome) == nome.strip().lower())
    if ignore_id is not None:
        query = query.filter(models.Team.id != ignore_id)
    return query.first() is not None


def _commit_team(db: Session) -> None:
    try:
        db.commit()
    except IntegrityError as exc:  # corrida no índice único de nome
        db.rollback()
        raise HTTPException(status_code=400, detail="Já existe uma equipe com esse nome.") from exc


# --- RF02: Cadastro de Equipes ---
@app.post("/teams", response_model=schemas.TeamResponse, status_code=status.HTTP_201_CREATED)
def create_team(team: schemas.TeamCreate, db: Session = Depends(get_db), user: models.User = Depends(require_organizer)):
    nome = team.nome.strip()
    if _team_name_taken(db, nome):
        raise HTTPException(status_code=400, detail="Já existe uma equipe com esse nome.")
    new_team = models.Team(
        nome=nome,
        tag=(team.tag or _make_tag(nome)).strip().upper(),
        cor=team.cor,
        capitao=team.capitao,
        jogadores=team.jogadores,
        capitao_id=user.id,  # dono vem do JWT, não do corpo da requisição
    )
    db.add(new_team)
    _commit_team(db)
    db.refresh(new_team)
    return new_team


@app.get("/teams", response_model=List[schemas.TeamResponse])
def list_teams(db: Session = Depends(get_db)):
    return db.query(models.Team).order_by(func.lower(models.Team.nome)).all()


@app.get("/teams/{team_id}", response_model=schemas.TeamResponse)
def get_team(team_id: int, db: Session = Depends(get_db)):
    return _get_team(db, team_id)


@app.put("/teams/{team_id}", response_model=schemas.TeamResponse)
def update_team(team_id: int, payload: schemas.TeamUpdate, db: Session = Depends(get_db), user: models.User = Depends(require_organizer)):
    team = _get_team(db, team_id)
    if team.capitao_id != user.id:
        raise HTTPException(status_code=403, detail="Apenas quem cadastrou a equipe pode alterá-la.")
    data = payload.model_dump(exclude_unset=True)
    if data.get("nome") is not None:
        data["nome"] = data["nome"].strip()
        if _team_name_taken(db, data["nome"], ignore_id=team.id):
            raise HTTPException(status_code=400, detail="Já existe uma equipe com esse nome.")
    for campo, valor in data.items():
        if valor is None:
            continue
        setattr(team, campo, valor.strip().upper() if campo == "tag" else valor)
    _commit_team(db)
    db.refresh(team)
    return team


@app.delete("/teams/{team_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_team(team_id: int, db: Session = Depends(get_db), user: models.User = Depends(require_organizer)):
    team = _get_team(db, team_id)
    if team.capitao_id != user.id:
        raise HTTPException(status_code=403, detail="Apenas quem cadastrou a equipe pode excluí-la.")
    ja_jogou = (
        db.query(models.Match.id)
        .filter((models.Match.team_a_id == team.id) | (models.Match.team_b_id == team.id))
        .first()
    )
    if ja_jogou:
        raise HTTPException(status_code=409, detail="Essa equipe já tem partidas registradas e não pode ser excluída.")
    db.delete(team)  # também remove as linhas de tournament_teams
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# ============================================================
# Campeonatos
# ============================================================
# --- RF02: Cadastro de Campeonatos ---
@app.post("/tournaments", response_model=schemas.TournamentResponse, status_code=status.HTTP_201_CREATED)
def create_tournament(payload: schemas.TournamentCreate, db: Session = Depends(get_db), user: models.User = Depends(require_organizer)):
    tournament = models.Tournament(
        nome=payload.nome.strip(),
        jogo=payload.jogo,
        formato=payload.formato,
        descricao=payload.descricao,
        status=payload.status,
        data_inicio=payload.data_inicio,
        data_fim=payload.data_fim,
        max_equipes=payload.max_equipes,
        premiacao=payload.premiacao,
        organizador_id=user.id,  # dono vem do JWT; payload.organizador_id é ignorado
    )
    if payload.team_ids:
        _set_teams(db, tournament, payload.team_ids)
    db.add(tournament)
    db.commit()
    db.refresh(tournament)
    return tournament


@app.get("/tournaments", response_model=List[schemas.TournamentResponse])
def list_tournaments(db: Session = Depends(get_db)):
    return db.query(models.Tournament).order_by(models.Tournament.id.desc()).all()


@app.get("/tournaments/{tournament_id}", response_model=schemas.TournamentResponse)
def get_tournament(tournament_id: int, db: Session = Depends(get_db)):
    return _get_tournament(db, tournament_id)


@app.put("/tournaments/{tournament_id}", response_model=schemas.TournamentResponse)
def update_tournament(
    tournament_id: int,
    payload: schemas.TournamentUpdate,
    db: Session = Depends(get_db),
    user: models.User = Depends(require_organizer),
):
    tournament = _get_owned_tournament(db, tournament_id, user)
    data = payload.model_dump(exclude_unset=True)
    data.pop("organizador_id", None)  # nunca transfere a posse do campeonato
    team_ids = data.pop("team_ids", None)

    inscritas = len(set(team_ids)) if team_ids is not None else len(tournament.teams)
    novo_max = data.get("max_equipes") or tournament.max_equipes
    if novo_max < inscritas:
        raise HTTPException(status_code=422, detail=f"Já existem {inscritas} equipes inscritas; aumente o limite.")

    tem_partidas = _has_matches(db, tournament.id)
    if tem_partidas and data.get("formato") not in (None, tournament.formato):
        raise HTTPException(status_code=409, detail="Não dá para mudar o formato depois que as partidas foram geradas.")

    inicio = data["data_inicio"] if "data_inicio" in data else tournament.data_inicio
    fim = data["data_fim"] if "data_fim" in data else tournament.data_fim
    if inicio and fim and fim < inicio:
        raise HTTPException(status_code=422, detail="O fim não pode ser antes do início.")

    if team_ids is not None:
        if tem_partidas and set(team_ids) != set(tournament.team_ids):
            raise HTTPException(status_code=409, detail="As partidas já foram geradas; não dá para alterar as equipes.")
        if not tem_partidas:
            _set_teams(db, tournament, team_ids)

    campos_anulaveis = {"data_inicio", "data_fim", "descricao", "premiacao"}
    for campo, valor in data.items():
        if valor is None and campo not in campos_anulaveis:
            continue
        setattr(tournament, campo, valor.strip() if campo == "nome" else valor)

    db.commit()
    db.refresh(tournament)
    return tournament


@app.delete("/tournaments/{tournament_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_tournament(tournament_id: int, db: Session = Depends(get_db), user: models.User = Depends(require_organizer)):
    tournament = _get_owned_tournament(db, tournament_id, user)
    db.delete(tournament)  # remove também as partidas (cascade) e as inscrições
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# --- Equipes no campeonato ---
@app.post("/tournaments/{tournament_id}/teams", response_model=schemas.TournamentResponse, status_code=status.HTTP_201_CREATED)
def enroll_teams(
    tournament_id: int,
    payload: schemas.TournamentTeamAdd,
    db: Session = Depends(get_db),
    user: models.User = Depends(require_organizer),
):
    tournament = _get_owned_tournament(db, tournament_id, user)
    if _has_matches(db, tournament.id):
        raise HTTPException(status_code=409, detail="As partidas já foram geradas; inscrições encerradas.")

    novos = payload.ids()
    atuais = set(tournament.team_ids)
    repetidas = [i for i in novos if i in atuais]
    if repetidas:
        raise HTTPException(status_code=409, detail="Equipe já inscrita neste campeonato.")
    if len(atuais) + len(novos) > tournament.max_equipes:
        raise HTTPException(status_code=422, detail=f"Limite de {tournament.max_equipes} equipes atingido.")

    for team_id in novos:
        tournament.teams.append(_get_team(db, team_id))
    db.commit()
    db.refresh(tournament)
    return tournament


@app.delete("/tournaments/{tournament_id}/teams/{team_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_team_from_tournament(
    tournament_id: int,
    team_id: int,
    db: Session = Depends(get_db),
    user: models.User = Depends(require_organizer),
):
    tournament = _get_owned_tournament(db, tournament_id, user)
    if _has_matches(db, tournament.id):
        raise HTTPException(status_code=409, detail="As partidas já foram geradas; não dá para remover equipes.")
    team = next((t for t in tournament.teams if t.id == team_id), None)
    if team is None:
        raise HTTPException(status_code=404, detail="Equipe não está inscrita neste campeonato.")
    tournament.teams.remove(team)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


# --- Geração de partidas ---
@app.post("/tournaments/{tournament_id}/generate-matches", response_model=List[schemas.MatchResponse])
def generate_matches(tournament_id: int, db: Session = Depends(get_db), user: models.User = Depends(require_organizer)):
    tournament = _get_owned_tournament(db, tournament_id, user)
    if _has_matches(db, tournament.id):
        raise HTTPException(status_code=409, detail="As partidas já foram geradas.")
    team_ids = tournament.team_ids
    if len(team_ids) < 2:
        raise HTTPException(status_code=422, detail="Inscreva pelo menos 2 equipes.")

    sorteadas = bracket.shuffled(team_ids)  # sorteio da ordem antes de montar os confrontos
    if tournament.formato == "eliminatoria":
        confrontos = bracket.elimination_round(sorteadas, 1)
    else:
        confrontos = bracket.round_robin(sorteadas)

    _create_matches(db, tournament, confrontos)
    db.flush()
    _update_tournament_status(db, tournament)  # encerra inscrições: status -> EM_ANDAMENTO
    db.commit()
    return _tournament_matches(db, tournament.id)


@app.post("/tournaments/{tournament_id}/next-round", response_model=List[schemas.MatchResponse])
def next_round(tournament_id: int, db: Session = Depends(get_db), user: models.User = Depends(require_organizer)):
    tournament = _get_owned_tournament(db, tournament_id, user)
    if tournament.formato != "eliminatoria":
        raise HTTPException(status_code=422, detail="Próxima fase existe apenas no formato eliminatória.")

    partidas = _tournament_matches(db, tournament.id)
    if not partidas:
        raise HTTPException(status_code=422, detail="Gere as partidas antes de avançar de fase.")
    rodada = max(m.rodada for m in partidas)
    fase_atual = [m for m in partidas if m.rodada == rodada]
    if any(m.status != "FINALIZADO" for m in fase_atual):
        raise HTTPException(status_code=422, detail="Finalize todas as partidas da fase atual antes.")

    vencedores = [
        w
        for w in (bracket.match_winner(m.team_a_id, m.team_b_id, m.score_a, m.score_b, m.status) for m in fase_atual)
        if w is not None
    ]
    if len(vencedores) < 2:
        raise HTTPException(status_code=409, detail="O campeonato já tem um campeão.")

    _create_matches(db, tournament, bracket.elimination_round(vencedores, rodada + 1))
    db.flush()
    _update_tournament_status(db, tournament)
    db.commit()
    return _tournament_matches(db, tournament.id)


# ============================================================
# Partidas
# ============================================================
def _get_match_as_organizer(db: Session, match_id: int, user: models.User) -> tuple[models.Match, models.Tournament]:
    match = _get_match(db, match_id)
    tournament = _get_owned_tournament(db, match.tournament_id, user)
    return match, tournament


@app.get("/matches", response_model=List[schemas.MatchResponse])
def list_matches(tournament_id: Optional[int] = None, db: Session = Depends(get_db)):
    query = db.query(models.Match)
    if tournament_id is not None:
        query = query.filter(models.Match.tournament_id == tournament_id)
    return query.order_by(models.Match.tournament_id, models.Match.rodada, models.Match.id).all()


@app.patch("/matches/{match_id}", response_model=schemas.MatchResponse)
def update_match(match_id: int, payload: schemas.MatchUpdate, db: Session = Depends(get_db), user: models.User = Depends(require_organizer)):
    match, _ = _get_match_as_organizer(db, match_id, user)
    data = payload.model_dump(exclude_unset=True)

    if "data_hora" in data:  # aceita null para "desagendar"
        match.data_hora = data["data_hora"]
    if data.get("status") == "EM_ANDAMENTO":
        if match.status != "AGENDADO":
            raise HTTPException(status_code=409, detail="Só partidas agendadas podem ser iniciadas.")
        match.status = "EM_ANDAMENTO"

    db.commit()
    db.refresh(match)
    return match


@app.post("/matches/{match_id}/result", response_model=schemas.MatchResponse)
def save_match_result(match_id: int, result: schemas.MatchResult, db: Session = Depends(get_db), user: models.User = Depends(require_organizer)):
    match, tournament = _get_match_as_organizer(db, match_id, user)
    if match.team_b_id is None:
        raise HTTPException(status_code=409, detail="Partida sem adversário (bye) não recebe resultado.")

    if tournament.formato == "eliminatoria":
        if result.finalizar and result.score_a == result.score_b:
            raise HTTPException(status_code=422, detail="No mata-mata não existe empate.")
        if match.rodada < _last_round(db, tournament.id):
            raise HTTPException(status_code=409, detail="A próxima fase já foi gerada; esse resultado não pode mais mudar.")

    match.score_a = result.score_a
    match.score_b = result.score_b
    match.status = "FINALIZADO" if result.finalizar else "EM_ANDAMENTO"
    db.flush()
    _update_tournament_status(db, tournament)
    db.commit()
    db.refresh(match)
    return match
