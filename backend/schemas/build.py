from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field, field_validator

from schemas.champion import ChampionOut

Role = Literal["Top", "Jungla", "Mid", "ADC", "Soporte"]


class BuildIn(BaseModel):
    title: str = Field(min_length=3, max_length=60)
    description: str = Field(default="", max_length=500)
    champion_id: int = Field(gt=0)
    role: Role
    items: list[str] = Field(min_length=1, max_length=6)
    runes: str = Field(default="", max_length=80)
    difficulty: int = Field(ge=1, le=5)
    patch: str = Field(pattern=r"^\d{1,2}\.\d{1,2}$")

    @field_validator("items")
    @classmethod
    def limpiar_items(cls, v: list[str]) -> list[str]:
        limpios = [i.strip() for i in v if i and i.strip()]
        if not limpios:
            raise ValueError("Agrega al menos un ítem")
        if any(len(i) > 40 for i in limpios):
            raise ValueError("Cada ítem admite máximo 40 caracteres")
        return limpios

    @field_validator("title", "description", "runes")
    @classmethod
    def recortar(cls, v: str) -> str:
        return v.strip()


class BuildOut(BaseModel):
    id: int
    title: str
    description: str
    role: str
    items: list[str]
    runes: str
    difficulty: int
    patch: str
    created_at: datetime
    updated_at: datetime
    champion: ChampionOut
    author: str
    favorites: int
    is_favorite: bool
    is_owner: bool


class RoleCount(BaseModel):
    role: str
    total: int


class ChampionCount(BaseModel):
    name: str
    image_key: str
    total: int


class StatsOut(BaseModel):
    total_builds: int
    total_champions: int
    my_builds: int
    my_favorites: int
    by_role: list[RoleCount]
    top_champions: list[ChampionCount]
