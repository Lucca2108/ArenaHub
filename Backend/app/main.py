from fastapi import FastAPI, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from .database import engine, get_db
from . import models, schemas
from .auth import create_access_token, hash_password, verify_password

# Cria as tabelas na inicialização (SQLite local ou NeonDB)
app = FastAPI(
    title="ArenaHub API",
    description="Backend para gerenciamento de campeonatos amadores de e-sports.",
    version="1.0.0"
)

@app.get("/health/db")
def database_health(db: Session = Depends(get_db)):
    from sqlalchemy import text
    db.execute(text("SELECT 1"))
    return {"status": "ok", "database": engine.url.get_backend_name()}

@app.post("/auth/login", response_model=schemas.LoginResponse)
def login(credentials: schemas.LoginRequest, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.email == credentials.email).first()
    if not user or not verify_password(credentials.senha, user.senha_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="E-mail ou senha inválidos.")
    if user.role != "organizador":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Acesso restrito a organizadores.")
    return {"access_token": create_access_token(user), "token_type": "bearer", "user": user}

@app.get("/")
def read_root():
    return {"message": "ArenaHub API está rodando com sucesso!"}

# --- RF01: Cadastro de Usuários ---
@app.post("/users", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    db_user = db.query(models.User).filter(models.User.email == user.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="E-mail já cadastrado.")
    
    new_user = models.User(
        nome=user.nome,
        email=user.email,
        senha_hash=hash_password(user.senha),
        role=user.role
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    return new_user

# --- RF02: Cadastro de Equipes ---
@app.post("/teams", response_model=schemas.TeamResponse, status_code=status.HTTP_201_CREATED)
def create_team(team: schemas.TeamCreate, db: Session = Depends(get_db)):
    new_team = models.Team(nome=team.nome, capitao_id=team.capitao_id)
    db.add(new_team)
    db.commit()
    db.refresh(new_team)
    return new_team

# --- RF02: Cadastro de Campeonatos ---
@app.post("/tournaments", response_model=schemas.TournamentResponse, status_code=status.HTTP_201_CREATED)
def create_tournament(tournament: schemas.TournamentCreate, db: Session = Depends(get_db)):
    new_tournament = models.Tournament(
        nome=tournament.nome,
        descricao=tournament.descricao,
        organizador_id=tournament.organizador_id
    )
    db.add(new_tournament)
    db.commit()
    db.refresh(new_tournament)
    return new_tournament

@app.get("/tournaments", response_model=List[schemas.TournamentResponse])
def list_tournaments(db: Session = Depends(get_db)):
    return db.query(models.Tournament).all()
