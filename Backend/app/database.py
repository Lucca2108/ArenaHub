import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
from dotenv import load_dotenv

load_dotenv()

ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
DATABASE_URL = os.getenv("DATABASE_URL")

if ENVIRONMENT == "production" and DATABASE_URL:
    # Ajusta o prefixo da URL caso o provider forneça postgres:// em vez de postgresql://
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
        
    SQLALCHEMY_DATABASE_URL = DATABASE_URL
    # Conexão com NeonDB (PostgreSQL)
    engine = create_engine(SQLALCHEMY_DATABASE_URL, pool_pre_ping=True)
else:
    # Conexão local com SQLite para desenvolvimento
    SQLALCHEMY_DATABASE_URL = "sqlite:///./arenahub_dev.db"
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