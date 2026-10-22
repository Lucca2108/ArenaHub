"""admin athlete provisioning and account activation"""
from alembic import op
import sqlalchemy as sa

revision = "0004_admin_athlete_activation"
down_revision = "0003_athlete_portal"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.add_column("users", sa.Column("account_status", sa.String(), nullable=False, server_default="ATIVO"))
    op.add_column("users", sa.Column("activation_token", sa.String(), nullable=True))
    op.add_column("users", sa.Column("activation_expires_at", sa.DateTime(), nullable=True))
    op.create_index("ix_users_activation_token", "users", ["activation_token"], unique=True)


def downgrade() -> None:
    op.drop_index("ix_users_activation_token", table_name="users")
    op.drop_column("users", "activation_expires_at")
    op.drop_column("users", "activation_token")
    op.drop_column("users", "account_status")
