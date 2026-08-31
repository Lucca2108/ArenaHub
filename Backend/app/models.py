from sqlalchemy import Column, Integer, String, ForeignKey, DateTime, Enum
from sqlalchemy.orm import relationship
from datetime import datetime
import enum
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

class Team(Base):
    __tablename__ = "teams"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, unique=True, nullable=False)
    capitao_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

class Tournament(Base):
    __tablename__ = "tournaments"

    id = Column(Integer, primary_key=True, index=True)
    nome = Column(String, nullable=False)
    descricao = Column(String, nullable=True)
    organizador_id = Column(Integer, ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)

    matches = relationship("Match", back_populates="tournament")

class Match(Base):
    __tablename__ = "matches"

    id = Column(Integer, primary_key=True, index=True)
    tournament_id = Column(Integer, ForeignKey("tournaments.id"))
    team_a_id = Column(Integer, ForeignKey("teams.id"))
    team_b_id = Column(Integer, ForeignKey("teams.id"))
    score_a = Column(Integer, default=0)
    score_b = Column(Integer, default=0)
    status = Column(String, default="AGENDADO") # AGENDADO, EM_ANDAMENTO, FINALIZADO
    data_hora = Column(DateTime, nullable=True)

    tournament = relationship("Tournament", back_populates="matches")