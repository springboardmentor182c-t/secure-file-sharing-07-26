from sqlalchemy import Boolean, Column, Integer, String
from sqlalchemy.orm import relationship
from src.database.core import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    
    # Custom fields for settings & profile
    bio = Column(String, nullable=True, default="")
    avatar = Column(String, nullable=True, default="default")
    theme = Column(String, default="dark")

    # Relationship to Todos
    todos = relationship("Todo", back_populates="owner", cascade="all, delete-orphan")
