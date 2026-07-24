from sqlalchemy import Column, Integer, String
from src.entities.base import Base
class EncryptionKey(Base):
    __tablename__ = "encryption_keys"

    id = Column(String, primary_key=True, index=True)
    file = Column(String)
    created = Column(String)
    rotated = Column(String)
    algorithm = Column(String)
    status = Column(String)
