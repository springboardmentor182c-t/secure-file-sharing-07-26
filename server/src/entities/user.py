from sqlalchemy import Column, Integer, String
from src.database.core import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, nullable=False)
    role = Column(String, nullable=False)
    storage_used = Column(String, default="0 GB")
    last_login = Column(String, default="")
    status = Column(String, default="Active")