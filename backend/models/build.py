from datetime import datetime

from sqlalchemy import JSON, DateTime, ForeignKey, SmallInteger, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.db import Base
from models.favorite import favorites


class Build(Base):
    __tablename__ = "builds"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(60))
    description: Mapped[str] = mapped_column(Text, default="")
    role: Mapped[str] = mapped_column(String(10), index=True)
    items: Mapped[list] = mapped_column(JSON)
    runes: Mapped[str] = mapped_column(String(80), default="")
    difficulty: Mapped[int] = mapped_column(SmallInteger, default=3)
    patch: Mapped[str] = mapped_column(String(8))
    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
    updated_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now(), onupdate=func.now())

    champion_id: Mapped[int] = mapped_column(ForeignKey("champions.id"), index=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)

    champion = relationship("Champion", back_populates="builds")
    author = relationship("User", back_populates="builds")
    fans = relationship("User", secondary=favorites, back_populates="favorite_builds")
