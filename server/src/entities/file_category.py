from sqlalchemy import Column, String, DateTime
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func

from src.database.core import Base


class FileCategory(Base):
    __tablename__ = "file_categories"

    id = Column(UUID(as_uuid=True), primary_key=True)

    category_name = Column(String(100), nullable=False)

    description = Column(String)

    created_at = Column(
        DateTime,
        server_default=func.now(),
    )