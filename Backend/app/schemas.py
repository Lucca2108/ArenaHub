from datetime import datetime, timezone
from typing import Annotated, Literal, Optional

from pydantic import AfterValidator, BaseModel, ConfigDict, EmailStr, Field, PlainSerializer, model_validator

Formato = Literal["pontos_corridos", "eliminatoria"]
TournamentStatus = Literal["INSCRICOES_ABERTAS", "EM_ANDAMENTO", "FINALIZADO"]
MatchStatus = Literal["AGENDADO", "EM_ANDAMENTO", "FINALIZADO"]


# ---------- Datas ----------
# O banco guarda datas em UTC "naive". O frontend envia/recebe ISO 8601 com "Z".
def _to_naive_utc(value: Optional[datetime]) -> Optional[datetime]:
    if value is not None and value.tzinfo is not None:
        return value.astimezone(timezone.utc).replace(tzinfo=None)
    return value


def _to_iso_utc(value: Optional[datetime]) -> Optional[str]:
    if value is None:
        return None
    if value.tzinfo is None:
        value = value.replace(tzinfo=timezone.utc)
    return value.astimezone(timezone.utc).isoformat().replace("+00:00", "Z")


DateTimeIn = Annotated[Optional[datetime], AfterValidator(_to_naive_utc)]
DateTimeOut = Annotated[Optional[datetime], PlainSerializer(_to_iso_utc, return_type=Optional[str])]


# ---------- User ----------
class UserCreate(BaseModel):
    nome: str
    email: EmailStr
    senha: str
    role: Optional[str] = "jogador"


class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nome: str
    email: EmailStr
    role: str


class LoginRequest(BaseModel):
    email: EmailStr
    senha: str


class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse


# ---------- Team ----------
class TeamCreate(BaseModel):
    nome: str = Field(min_length=1)
    tag: Optional[str] = Field(default=None, max_length=8)
    cor: str = "#00f0ff"
    capitao: str = ""
    jogadores: list[str] = Field(default_factory=list)
    # O frontend envia capitao_id, mas o dono real vem do JWT (o valor enviado é ignorado).
    capitao_id: Optional[int] = None


class TeamUpdate(BaseModel):
    nome: Optional[str] = Field(default=None, min_length=1)
    tag: Optional[str] = Field(default=None, max_length=8)
    cor: Optional[str] = None
    capitao: Optional[str] = None
    jogadores: Optional[list[str]] = None


class TeamResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nome: str
    tag: str
    cor: str
    capitao: str
    jogadores: list[str]
    capitao_id: Optional[int] = None


# ---------- Tournament ----------
class _TournamentFields(BaseModel):
    @model_validator(mode="after")
    def _datas_coerentes(self):
        inicio = getattr(self, "data_inicio", None)
        fim = getattr(self, "data_fim", None)
        if inicio and fim and fim < inicio:
            raise ValueError("data_fim não pode ser anterior a data_inicio.")
        return self


class TournamentCreate(_TournamentFields):
    nome: str = Field(min_length=3)
    jogo: str = "Outro"
    formato: Formato = "pontos_corridos"
    descricao: Optional[str] = ""
    status: TournamentStatus = "INSCRICOES_ABERTAS"
    data_inicio: DateTimeIn = None
    data_fim: DateTimeIn = None
    max_equipes: int = Field(default=8, ge=2, le=64)
    premiacao: Optional[str] = ""
    team_ids: list[int] = Field(default_factory=list)
    # O frontend envia organizador_id, mas o dono real vem do JWT (o valor enviado é ignorado).
    organizador_id: Optional[int] = None


class TournamentUpdate(_TournamentFields):
    nome: Optional[str] = Field(default=None, min_length=3)
    jogo: Optional[str] = None
    formato: Optional[Formato] = None
    descricao: Optional[str] = None
    status: Optional[TournamentStatus] = None
    data_inicio: DateTimeIn = None
    data_fim: DateTimeIn = None
    max_equipes: Optional[int] = Field(default=None, ge=2, le=64)
    premiacao: Optional[str] = None
    team_ids: Optional[list[int]] = None
    organizador_id: Optional[int] = None  # aceito, mas ignorado


class TournamentResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    nome: str
    descricao: Optional[str] = None
    jogo: str
    formato: Formato
    status: TournamentStatus
    data_inicio: DateTimeOut = None
    data_fim: DateTimeOut = None
    max_equipes: int
    premiacao: Optional[str] = None
    organizador_id: Optional[int] = None
    created_at: DateTimeOut = None
    team_ids: list[int] = Field(default_factory=list)


class TournamentTeamAdd(BaseModel):
    """Corpo de POST /tournaments/{id}/teams. O frontend envia {team_id}; também aceita {team_ids}."""

    team_id: Optional[int] = None
    team_ids: Optional[list[int]] = None

    @model_validator(mode="after")
    def _pelo_menos_uma(self):
        if self.team_id is None and not self.team_ids:
            raise ValueError("Informe team_id ou team_ids.")
        return self

    def ids(self) -> list[int]:
        encontrados = ([self.team_id] if self.team_id is not None else []) + list(self.team_ids or [])
        return list(dict.fromkeys(encontrados))  # sem repetidos, mantendo a ordem


# ---------- Match ----------
class MatchResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    tournament_id: int
    rodada: int
    team_a_id: int
    team_b_id: Optional[int] = None
    score_a: int = 0
    score_b: int = 0
    status: MatchStatus
    data_hora: DateTimeOut = None


class MatchUpdate(BaseModel):
    """PATCH /matches/{id}: {data_hora} agenda; {status: "EM_ANDAMENTO"} inicia."""

    data_hora: DateTimeIn = None
    status: Optional[Literal["EM_ANDAMENTO"]] = None


class MatchResult(BaseModel):
    score_a: int = Field(ge=0)
    score_b: int = Field(ge=0)
    finalizar: bool = False  # False = placar parcial | True = encerra a partida
