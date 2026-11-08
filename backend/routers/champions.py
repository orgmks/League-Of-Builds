from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import select
from sqlalchemy.orm import Session

from core.deps import get_current_user
from database.db import get_db
from models.champion import Champion
from schemas.champion import ChampionOut

router = APIRouter(prefix="/champions", tags=["champions"], dependencies=[Depends(get_current_user)])


@router.get("", response_model=list[ChampionOut])
def list_champions(
    search: str | None = Query(None, max_length=40),
    role: str | None = None,
    db: Session = Depends(get_db),
):
    q = select(Champion).order_by(Champion.name)
    if search:
        q = q.where(Champion.name.ilike(f"%{search.strip()}%"))
    if role:
        q = q.where(Champion.role == role)
    return db.scalars(q).all()


@router.get("/{champion_id}", response_model=ChampionOut)
def get_champion(champion_id: int, db: Session = Depends(get_db)):
    champ = db.get(Champion, champion_id)
    if champ is None:
        raise HTTPException(404, "Campeón no encontrado")
    return champ
