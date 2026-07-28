import uuid
from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column

from src.entities.base import Base
from src.entities.guid import GUID


class Role(Base):
    __tablename__ = "roles"

    id: Mapped[uuid.UUID] = mapped_column(GUID(), primary_key=True, default=uuid.uuid4)
    role_name: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)