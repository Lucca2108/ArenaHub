import os
from pathlib import Path
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(BASE_DIR / ".env")

ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
DATABASE_URL = os.getenv("DATABASE_URL")

if ENVIRONMENT in {"production", "staging"} and DATABASE_URL:
    # Ajusta o prefixo da URL caso o provider forneça postgres:// em vez de postgresql://
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
        
    SQLALCHEMY_DATABASE_URL = DATABASE_URL
    # Conexão com NeonDB (PostgreSQL)
    engine = create_engine(SQLALCHEMY_DATABASE_URL, pool_pre_ping=True, pool_recycle=1800)
else:
    # Conexão local com SQLite para desenvolvimento
    SQLALCHEMY_DATABASE_URL = f"sqlite:///{BASE_DIR / 'arenahub_dev.db'}"
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL, 
        connect_args={"check_same_thread": False}
    )

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Dependency Injection do FastAPI para gerenciamento da sessão do banco
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
