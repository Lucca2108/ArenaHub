# Migrações do banco

1. Copie `.env.example` para `.env` e preencha `DATABASE_URL` do PostgreSQL/Neon.
2. No diretório `Backend`, execute `pip install -r requirements.txt`.
3. Crie/atualize as tabelas com `alembic upgrade head`.
4. Confira a versão aplicada com `alembic current`.

Nunca versione o arquivo `.env` nem coloque a senha do banco no código.
