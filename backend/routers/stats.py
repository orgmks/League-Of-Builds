from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session

from core.deps import get_current_user
from database.db import get_db
from models.build import Build
from models.champion import Champion
from models.favorite import favorites
from models.user import User
from schemas.build import ChampionCount, RoleCount, StatsOut

router = APIRouter(prefix="/stats", tags=["stats"])


@router.get("", response_model=StatsOut)
def stats(db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    por_rol = db.execute(
        select(Build.role, func.count(Build.id)).group_by(Build.role).order_by(func.count(Build.id).desc())
    ).all()
    top = db.execute(
        select(Champion.name, Champion.image_key, func.count(Build.id).label("n"))
        .join(Build, Build.champion_id == Champion.id)
        .group_by(Champion.id)
        .order_by(func.count(Build.id).desc(), Champion.name)
        .limit(5)
    ).all()
    return StatsOut(
        total_builds=db.scalar(select(func.count(Build.id))) or 0,
        total_champions=db.scalar(select(func.count(Champion.id))) or 0,
        my_builds=db.scalar(select(func.count(Build.id)).where(Build.user_id == user.id)) or 0,
        my_favorites=db.scalar(select(func.count()).select_from(favorites).where(favorites.c.user_id == user.id)) or 0,
        by_role=[RoleCount(role=r, total=n) for r, n in por_rol],
        top_champions=[ChampionCount(name=n, image_key=k, total=t) for n, k, t in top],
    )
