# 🎮 ArenaHub - Backend API

O **ArenaHub** é uma plataforma desenvolvida para organizar e gerenciar campeonatos amadores de e-sports. Este repositório contém a API REST do backend, desenvolvida em **Python** com **FastAPI** e banco de dados **NeonDB / PostgreSQL** (em desenvolvimento, testes e produção).

---

## 👥 1. Informações do Grupo e Projeto

* **Projeto:** ArenaHub
* **Instituição:** Universidade Tiradentes (UNIT)
* **Curso:** Sistemas de Informação
* **Disciplina:** Engenharia de Software (Semestre 2026.2)
* **Professor:** Felipe dos Anjos
* **Grupo:** Cauê e amigos

### 👨‍💻 Integrantes do Grupo
* Cauã Silva Souza Muniz
* Daniel Batista Albuquerque
* Danilo Vieira Fontes
* Guilherme dos Santos Guimarães
* Lucca Amaral Menendez
* Vitor Rafael Laurentino

---

## 🚀 2. Tecnologias Utilizadas

* **Linguagem:** Python 3.11 / 3.12
* **Framework Web:** FastAPI
* **Servidor ASGI:** Uvicorn
* **ORM:** SQLAlchemy 2.0
* **Validação de Dados:** Pydantic v2 (com suporte a `email-validator`)
* **Banco de Dados:** NeonDB (Serverless PostgreSQL) em todos os ambientes, via `DATABASE_URL` do `Backend/.env`
* **Gerenciamento de Dependências:** `pip`

### Banco de dados real

O banco é sempre PostgreSQL (Neon), inclusive em desenvolvimento; não há fallback para SQLite. Para configurar:

1. Crie um projeto PostgreSQL no Neon e copie a URL de conexão.
2. Em `Backend`, copie `.env.example` para `.env` e preencha `DATABASE_URL` com a URL real.
3. Instale as dependências: `pip install -r requirements.txt`.
4. Execute as migrações: `alembic upgrade head`.
5. Inicie a API: `uvicorn app.main:app --reload`.

O endpoint `GET /health/db` testa a conexão. O frontend deve ser iniciado com `NEXT_PUBLIC_DATA_MODE=api`; sem essa variável ele continua usando dados demo no navegador.

---

## 📌 3. Requisitos Atendidos

| Código | Descrição do Requisito Funcional | Status |
| :--- | :--- | :---: |
| **RF01** | O sistema deve permitir o cadastro e login de usuários | ⚙️ Implementado |
| **RF02** | O sistema deve permitir o cadastro de equipes e campeonatos | ⚙️ Implementado |
| **RF03** | O sistema deve gerar partidas, tabelas ou chaveamentos do torneio | 🛠️ Em progresso |
| **RF04** | O sistema deve registrar resultados e atualizar a classificação automaticamente | 🛠️ Em progresso |

---

## 📂 4. Estrutura do Projeto

```text
Backend/
├── app/
│   ├── __init__.py
│   ├── database.py    # Conexão com o Neon PostgreSQL (DATABASE_URL)
│   ├── models.py      # Modelos SQLAlchemy (Banco de dados)
│   ├── schemas.py     # Schemas Pydantic (Validação das APIs)
│   └── main.py        # Rotas da aplicação (FastAPI)
├── .env.example       # Modelo das variáveis de ambiente
├── .gitignore         # Arquivos ignorados pelo Git
├── README.md          # Documentação do backend
└── requirements.txt   # Lista de dependências do projeto
