"""create initial ArenaHub schema"""
from alembic import op
import sqlalchemy as sa

revision = "0001_initial"
down_revision = None
branch_labels = None
depends_on = None

def upgrade() -> None:
    op.create_table("users", sa.Column("id", sa.Integer(), primary_key=True), sa.Column("nome", sa.String(), nullable=False), sa.Column("email", sa.String(), nullable=False), sa.Column("senha_hash", sa.String(), nullable=False), sa.Column("role", sa.String(), nullable=False, server_default="jogador"), sa.Column("created_at", sa.DateTime(), nullable=True))
    op.create_index("ix_users_id", "users", ["id"])
    op.create_index("ix_users_email", "users", ["email"], unique=True)
    op.create_table("teams", sa.Column("id", sa.Integer(), primary_key=True), sa.Column("nome", sa.String(), nullable=False), sa.Column("capitao_id", sa.Integer(), nullable=True), sa.Column("created_at", sa.DateTime(), nullable=True), sa.ForeignKeyConstraint(["capitao_id"], ["users.id"]))
    op.create_index("ix_teams_id", "teams", ["id"])
    op.create_index("ix_teams_nome", "teams", ["nome"], unique=True)
    op.create_table("tournaments", sa.Column("id", sa.Integer(), primary_key=True), sa.Column("nome", sa.String(), nullable=False), sa.Column("descricao", sa.String(), nullable=True), sa.Column("organizador_id", sa.Integer(), nullable=True), sa.Column("created_at", sa.DateTime(), nullable=True), sa.ForeignKeyConstraint(["organizador_id"], ["users.id"]))
    op.create_index("ix_tournaments_id", "tournaments", ["id"])
    op.create_table("matches", sa.Column("id", sa.Integer(), primary_key=True), sa.Column("tournament_id", sa.Integer(), nullable=True), sa.Column("team_a_id", sa.Integer(), nullable=True), sa.Column("team_b_id", sa.Integer(), nullable=True), sa.Column("score_a", sa.Integer(), server_default="0"), sa.Column("score_b", sa.Integer(), server_default="0"), sa.Column("status", sa.String(), server_default="AGENDADO"), sa.Column("data_hora", sa.DateTime(), nullable=True), sa.ForeignKeyConstraint(["tournament_id"], ["tournaments.id"]), sa.ForeignKeyConstraint(["team_a_id"], ["teams.id"]), sa.ForeignKeyConstraint(["team_b_id"], ["teams.id"]))
    op.create_index("ix_matches_id", "matches", ["id"])

def downgrade() -> None:
    op.drop_index("ix_matches_id", table_name="matches")
    op.drop_table("matches")
    op.drop_index("ix_tournaments_id", table_name="tournaments")
    op.drop_table("tournaments")
    op.drop_index("ix_teams_nome", table_name="teams")
    op.drop_index("ix_teams_id", table_name="teams")
    op.drop_table("teams")
    op.drop_index("ix_users_email", table_name="users")
    op.drop_index("ix_users_id", table_name="users")
    op.drop_table("users")
