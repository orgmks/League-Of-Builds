from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from database.db import Base


class Champion(Base):
    __tablename__ = "champions"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(40), unique=True, index=True)
    title: Mapped[str] = mapped_column(String(60))
    role: Mapped[str] = mapped_column(String(10), index=True)
    region: Mapped[str] = mapped_column(String(30))
    image_key: Mapped[str] = mapped_column(String(40))

    builds = relationship("Build", back_populates="champion")
