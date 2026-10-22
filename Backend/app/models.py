from datetime import datetime
import enum

from sqlalchemy import JSON, CheckConstraint, Column, DateTime, ForeignKey, Index, Integer, String, Table, text
from sqlalchemy.orm import relationship

from .database import Base


class UserRole(str, enum.Enum):
    ORGANIZADOR = "organizador"
    JOGADOR = "jogador"
    PUBLICO = "publico"


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    email = Column(String, unique=True, index=True, nullable=False)
    senha_hash = Column(String, nullable=False)
    role = Column(String, default=UserRole.JOGADOR)
    created_at = Column(DateTime, default=datetime.utcnow)


# Associação N:N entre campeonatos e equipes (equipes inscritas)
tournament_teams = Table(
    "tournament_teams",
    Base.metadata,
    Column("tournament_id", Integer, ForeignKey("tournaments.id", ondelete="CASCADE"), primary_key=True),
    Column("team_id", Integer, ForeignKey("teams.id", ondelete="CASCADE"), primary_key=True),
    Index("ix_tournament_teams_team_id", "team_id"),
)


class Team(Base):
    __tablename__ = "teams"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, unique=True, nullable=False)
    tag = Column(String(8), nullable=False, default="", server_default="")
    cor = Column(String(16), nullable=False, default="#00f0ff", server_default="#00f0ff")
    capitao = Column(String, nullable=False, default="", server_default="")  # nick do capitão
    jogadores = Column(JSON, nullable=False, default=list, server_default=text("'[]'"))  # lista de nicks
    capitao_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

    tournaments = relationship("Tournament", secondary=tournament_teams, back_populates="teams")


class Tournament(Base):
    __tablename__ = "tournaments"
    __table_args__ = (
        CheckConstraint("formato IN ('pontos_corridos', 'eliminatoria')", name="ck_tournaments_formato"),
        CheckConstraint("status IN ('INSCRICOES_ABERTAS', 'EM_ANDAMENTO', 'FINALIZADO')", name="ck_tournaments_status"),
        CheckConstraint("max_equipes >= 2", name="ck_tournaments_max_equipes"),
    )

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    jogo = Column(String, nullable=False, default="Outro", server_default="Outro")
    formato = Column(String, nullable=False, default="pontos_corridos", server_default="pontos_corridos")  # pontos_corridos | eliminatoria
    descricao = Column(String, nullable=True)
    status = Column(String, nullable=False, default="INSCRICOES_ABERTAS", server_default="INSCRICOES_ABERTAS")  # INSCRICOES_ABERTAS | EM_ANDAMENTO | FINALIZADO
    data_inicio = Column(DateTime, nullable=True)
    data_fim = Column(DateTime, nullable=True)
    max_equipes = Column(Integer, nullable=False, default=8, server_default="8")
    premiacao = Column(String, nullable=True)
    organizador_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

    matches = relationship("Match", back_populates="tournament", cascade="all, delete-orphan")
    teams = relationship("Team", secondary=tournament_teams, back_populates="tournaments")

    @property
    def team_ids(self) -> list[int]:
        """Ids das equipes inscritas (campo `team_ids` do contrato do frontend)."""
        return sorted(team.id for team in self.teams)


class Match(Base):
    __tablename__ = "matches"
    __table_args__ = (
        CheckConstraint("rodada >= 1", name="ck_matches_rodada"),
        Index("ix_matches_tournament_id_rodada", "tournament_id", "rodada"),
    )

    id = Column(Integer, primary_key=True, index=True)
    tournament_id = Column(Integer, ForeignKey("tournaments.id"))
    rodada = Column(Integer, nullable=False, default=1, server_default="1")
    team_a_id = Column(Integer, ForeignKey("teams.id"))
    team_b_id = Column(Integer, ForeignKey("teams.id"), nullable=True)  # None = "bye"
    score_a = Column(Integer, default=0)
    score_b = Column(Integer, default=0)
    status = Column(String, default="AGENDADO")  # AGENDADO, EM_ANDAMENTO, FINALIZADO
    data_hora = Column(DateTime, nullable=True)

    tournament = relationship("Tournament", back_populates="matches")
