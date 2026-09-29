import os
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import declarative_base, sessionmaker

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
DATABASE_URL = os.getenv("DATABASE_URL")

if not DATABASE_URL:
    raise RuntimeError(
        "DATABASE_URL não definida. Copie Backend/.env.example para Backend/.env "
        "e preencha com a URL do Neon PostgreSQL."
    )

# Alguns providers entregam "postgres://"; o SQLAlchemy 2.x só aceita "postgresql://".
if DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)

# O banco do ArenaHub é sempre PostgreSQL (Neon), inclusive em desenvolvimento e testes.
if not DATABASE_URL.startswith("postgresql"):
    raise RuntimeError("DATABASE_URL deve apontar para um PostgreSQL (postgresql://...). SQLite não é suportado.")

SQLALCHEMY_DATABASE_URL = DATABASE_URL

# pool_pre_ping / pool_recycle: o Neon suspende conexões ociosas; isso evita erro na 1ª requisição após a pausa.
engine = create_engine(SQLALCHEMY_DATABASE_URL, pool_pre_ping=True, pool_recycle=1800)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


# Dependency Injection do FastAPI para gerenciamento da sessão do banco
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
