from __future__ import annotations

import getpass
import sys
from pathlib import Path

import click


def _load_env() -> None:
    from dotenv import load_dotenv

    load_dotenv(Path(".env"))


@click.group()
def cli():
    """Quiver — admin panel framework CLI."""


@cli.group("db")
def db_group():
    """Database management commands."""


@db_group.command("migrate")
def db_migrate():
    """Apply Quiver database migrations (alembic upgrade head)."""
    _load_env()

    from quiver.config import QuiverConfig

    cfg = QuiverConfig()

    from alembic import command as alembic_command
    from alembic.config import Config as AlembicConfig

    migrations_dir = Path(__file__).parent / "database" / "migrations"
    alembic_cfg = AlembicConfig()
    alembic_cfg.set_main_option("script_location", str(migrations_dir))
    alembic_cfg.set_main_option("sqlalchemy.url", cfg.DATABASE_URL)

    try:
        alembic_command.upgrade(alembic_cfg, "head")
        click.echo("Quiver migrations applied successfully.")
    except Exception as exc:
        click.echo(f"Migration failed: {exc}", err=True)
        sys.exit(1)


@db_group.command("rollback")
def db_rollback():
    """Revert the last Quiver migration (alembic downgrade -1)."""
    _load_env()

    from quiver.config import QuiverConfig

    cfg = QuiverConfig()

    from alembic import command as alembic_command
    from alembic.config import Config as AlembicConfig

    migrations_dir = Path(__file__).parent / "database" / "migrations"
    alembic_cfg = AlembicConfig()
    alembic_cfg.set_main_option("script_location", str(migrations_dir))
    alembic_cfg.set_main_option("sqlalchemy.url", cfg.DATABASE_URL)

    try:
        alembic_command.downgrade(alembic_cfg, "-1")
        click.echo("Last Quiver migration reverted.")
    except Exception as exc:
        click.echo(f"Rollback failed: {exc}", err=True)
        sys.exit(1)


@cli.command("create-superuser")
def create_superuser():
    """Create the initial superuser interactively."""
    _load_env()
    click.echo("=== Quiver — Create Superuser ===")

    email = click.prompt("Email")
    first_name = click.prompt("First name")
    last_name = click.prompt("Last name")

    while True:
        password = getpass.getpass("Password: ")
        if len(password) < 8:
            click.echo("Error: password must be at least 8 characters.", err=True)
            continue
        confirm = getpass.getpass("Confirm password: ")
        if password != confirm:
            click.echo("Error: passwords do not match.", err=True)
            continue
        break

    from sqlmodel import Session, select

    from quiver.auth.password import hash_password
    from quiver.config import QuiverConfig
    from quiver.database.session import _build_engine
    from quiver.models.admin_user import AdminUser

    QuiverConfig()
    engine = _build_engine()

    with Session(engine) as session:
        existing = session.exec(select(AdminUser).where(AdminUser.email == email)).first()
        if existing:
            if not click.confirm(f"User '{email}' already exists. Reset as superuser?"):
                click.echo("Aborted.")
                sys.exit(0)
            existing.password_hash = hash_password(password)
            existing.is_superuser = True
            existing.is_active = True
            existing.first_name = first_name
            existing.last_name = last_name
            session.add(existing)
            session.commit()
            click.echo(f"Superuser '{email}' updated successfully.")
        else:
            user = AdminUser(
                email=email,
                password_hash=hash_password(password),
                first_name=first_name,
                last_name=last_name,
                is_superuser=True,
                is_active=True,
            )
            session.add(user)
            session.commit()
            click.echo(f"Superuser '{email}' created successfully.")
