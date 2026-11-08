from sqlalchemy import Column, ForeignKey, Table

from database.db import Base

# tabla intermedia usuario <-> build (muchos a muchos)
favorites = Table(
    "favorites",
    Base.metadata,
    Column("user_id", ForeignKey("users.id", ondelete="CASCADE"), primary_key=True),
    Column("build_id", ForeignKey("builds.id", ondelete="CASCADE"), primary_key=True),
)
