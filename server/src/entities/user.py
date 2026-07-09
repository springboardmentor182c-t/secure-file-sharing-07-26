from sqlalchemy import Column, Integer, String, Boolean
from src.core import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, index=True)
    email = Column(String, unique=True, index=True)
    role = Column(String)
    storage = Column(String)
    files = Column(Integer)
    last_login = Column(String)
    status = Column(String)
    mfa = Column(Boolean, default=False)
