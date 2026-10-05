from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

# User Schemas
class UserCreate(BaseModel):
    nome: str
    email: EmailStr
    senha: str
    role: Optional[str] = "jogador"

class UserResponse(BaseModel):
    id: int
    nome: str
    email: EmailStr
    role: str

    class Config:
        from_attributes = True

# Team Schemas
class TeamCreate(BaseModel):
    nome: str
    capitao_id: int

class TeamResponse(BaseModel):
    id: int
    nome: str
    capitao_id: int

    class Config:
        from_attributes = True

# Tournament Schemas
class TournamentCreate(BaseModel):
    nome: str
    descricao: Optional[str] = None
    organizador_id: int

class TournamentResponse(BaseModel):
    id: int
    nome: str
    descricao: Optional[str]
    organizador_id: int

    class Config:
        from_attributes = True

class LoginRequest(BaseModel):
    email: EmailStr
    senha: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserResponse
