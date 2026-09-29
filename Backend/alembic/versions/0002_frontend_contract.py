"""contrato do frontend: campos de campeonato/equipe/partida + tournament_teams

Não altera 0001_initial. Preserva os dados existentes: toda coluna nova NOT NULL
entra com server_default, então as linhas já gravadas ficam válidas.
"""
from alembic import op
import sqlalchemy as sa

revision = "0002_frontend_contract"
down_revision = "0001_initial"
branch_labels = None
depends_on = None


def upgrade() -> None:
    # --- tournaments ---
    op.add_column("tournaments", sa.Column("jogo", sa.String(), nullable=False, server_default="Outro"))
    op.add_column("tournaments", sa.Column("formato", sa.String(), nullable=False, server_default="pontos_corridos"))
    op.add_column("tournaments", sa.Column("status", sa.String(), nullable=False, server_default="INSCRICOES_ABERTAS"))
    op.add_column("tournaments", sa.Column("data_inicio", sa.DateTime(), nullable=True))
    op.add_column("tournaments", sa.Column("data_fim", sa.DateTime(), nullable=True))
    op.add_column("tournaments", sa.Column("max_equipes", sa.Integer(), nullable=False, server_default="8"))
    op.add_column("tournaments", sa.Column("premiacao", sa.String(), nullable=True))
    op.create_check_constraint("ck_tournaments_formato", "tournaments", "formato IN ('pontos_corridos', 'eliminatoria')")
    op.create_check_constraint("ck_tournaments_status", "tournaments", "status IN ('INSCRICOES_ABERTAS', 'EM_ANDAMENTO', 'FINALIZADO')")
    op.create_check_constraint("ck_tournaments_max_equipes", "tournaments", "max_equipes >= 2")

    # --- teams ---
    op.add_column("teams", sa.Column("tag", sa.String(8), nullable=False, server_default=""))
    op.add_column("teams", sa.Column("cor", sa.String(16), nullable=False, server_default="#00f0ff"))
    op.add_column("teams", sa.Column("capitao", sa.String(), nullable=False, server_default=""))
    op.add_column("teams", sa.Column("jogadores", sa.JSON(), nullable=False, server_default=sa.text("'[]'")))

    # --- matches ---
    op.add_column("matches", sa.Column("rodada", sa.Integer(), nullable=False, server_default="1"))
    op.create_check_constraint("ck_matches_rodada", "matches", "rodada >= 1")
    op.create_index("ix_matches_tournament_id_rodada", "matches", ["tournament_id", "rodada"])

    # --- tournament_teams (N:N campeonato <-> equipe) ---
    op.create_table(
        "tournament_teams",
        sa.Column("tournament_id", sa.Integer(), nullable=False),
        sa.Column("team_id", sa.Integer(), nullable=False),
        sa.PrimaryKeyConstraint("tournament_id", "team_id"),
        sa.ForeignKeyConstraint(["tournament_id"], ["tournaments.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["team_id"], ["teams.id"], ondelete="CASCADE"),
    )
    op.create_index("ix_tournament_teams_team_id", "tournament_teams", ["team_id"])


def downgrade() -> None:
    op.drop_index("ix_tournament_teams_team_id", table_name="tournament_teams")
    op.drop_table("tournament_teams")

    op.drop_index("ix_matches_tournament_id_rodada", table_name="matches")
    op.drop_constraint("ck_matches_rodada", "matches", type_="check")
    op.drop_column("matches", "rodada")

    for coluna in ("jogadores", "capitao", "cor", "tag"):
        op.drop_column("teams", coluna)

    op.drop_constraint("ck_tournaments_max_equipes", "tournaments", type_="check")
    op.drop_constraint("ck_tournaments_status", "tournaments", type_="check")
    op.drop_constraint("ck_tournaments_formato", "tournaments", type_="check")
    for coluna in ("premiacao", "max_equipes", "data_fim", "data_inicio", "status", "formato", "jogo"):
        op.drop_column("tournaments", coluna)
