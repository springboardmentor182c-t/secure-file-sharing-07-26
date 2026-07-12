from datetime import datetime

from sqlalchemy import DateTime, Integer, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database.session import Base


class LoginHistory(Base):
    __tablename__ = "login_history"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)

    timestamp: Mapped[datetime] = mapped_column(
        DateTime,
        default=datetime.utcnow,
        nullable=False,
        index=True,
    )

    user_name: Mapped[str] = mapped_column(
        String(120),
        nullable=False,
    )

    device: Mapped[str] = mapped_column(
        String(120),
        nullable=False,
    )

    browser: Mapped[str] = mapped_column(
        String(120),
        nullable=False,
    )

    location: Mapped[str] = mapped_column(
        String(120),
        nullable=False,
    )

    ip_address: Mapped[str] = mapped_column(
        String(45),
        nullable=False,
    )

    status: Mapped[str] = mapped_column(
        String(30),
        nullable=False,
    )