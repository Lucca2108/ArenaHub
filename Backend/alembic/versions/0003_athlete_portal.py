"""atletas, nicknames, membros e convites de equipes"""
from alembic import op
import sqlalchemy as sa

revision = "0003_athlete_portal"
down_revision = "0002_frontend_contract"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("users", sa.Column("nickname", sa.String(), nullable=True))
    op.create_index("ix_users_nickname", "users", ["nickname"], unique=True)
    op.create_table(
        "team_members",
        sa.Column("id", sa.Integer(), primary_key=True),
        sa.Column("team_id", sa.Integer(), nullable=False),
        sa.Column("user_id", sa.Integer(), nullable=True),
        sa.Column("nickname", sa.String(), nullable=False),
        sa.Column("email", sa.String(), nullable=True),
        sa.Column("papel", sa.String(), nullable=False, server_default="membro"),
        sa.Column("status", sa.String(), nullable=False, server_default="PENDENTE"),
        sa.Column("invite_token", sa.String(), nullable=True),
        sa.Column("created_at", sa.DateTime(), nullable=True),
        sa.ForeignKeyConstraint(["team_id"], ["teams.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["user_id"], ["users.id"], ondelete="CASCADE"),
    )
    op.create_index("ix_team_members_id", "team_members", ["id"])
    op.create_index("ix_team_members_invite_token", "team_members", ["invite_token"], unique=True)
    op.create_index("ix_team_members_team_user", "team_members", ["team_id", "user_id"], unique=True)


def downgrade() -> None:
    op.drop_index("ix_team_members_team_user", table_name="team_members")
    op.drop_index("ix_team_members_invite_token", table_name="team_members")
    op.drop_index("ix_team_members_id", table_name="team_members")
    op.drop_table("team_members")
    op.drop_index("ix_users_nickname", table_name="users")
    op.drop_column("users", "nickname")
