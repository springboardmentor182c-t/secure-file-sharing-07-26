"""
Shared SQLAlchemy declarative base.

Every ORM entity in `src/entities/` inherits from this `Base`, so that
`Base.metadata` (used by Alembic and by the dev-only `create_all` fallback)
sees every table regardless of which module defines it.
"""
from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass
