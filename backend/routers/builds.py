from fastapi import APIRouter, Depends, HTTPException, Query, Response, status
from sqlalchemy import or_, select
from sqlalchemy.orm import Session, joinedload, selectinload

from core.deps import get_current_user
from database.db import get_db
from models.build import Build
from models.champion import Champion
from models.user import User
from schemas.build import BuildIn, BuildOut

router = APIRouter(prefix="/builds", tags=["builds"])


def _a_salida(b: Build, user: User) -> BuildOut:
    return BuildOut(
        id=b.id,
        title=b.title,
        description=b.description,
        role=b.role,
        items=b.items,
        runes=b.runes,
        difficulty=b.difficulty,
        patch=b.patch,
        created_at=b.created_at,
        updated_at=b.updated_at,
        champion=b.champion,
        author=b.author.username,
        favorites=len(b.fans),
        is_favorite=any(f.id == user.id for f in b.fans),
        is_owner=b.user_id == user.id,
    )


def _query_base():
    return select(Build).options(
        joinedload(Build.champion), joinedload(Build.author), selectinload(Build.fans)
    )


def _cargar(db: Session, build_id: int) -> Build:
    b = db.scalars(_query_base().where(Build.id == build_id)).unique().first()
    if b is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "Build no encontrada")
    return b


@router.get("", response_model=list[BuildOut])
def list_builds(
    search: str | None = Query(None, max_length=60),
    role: str | None = None,
    champion_id: int | None = None,
    mine: bool = False,
    only_favorites: bool = False,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user),
):
    q = _query_base().order_by(Build.created_at.desc(), Build.id.desc())
    if search:
        like = f"%{search.strip()}%"
        q = q.join(Champion, Build.champion_id == Champion.id).where(
            or_(Build.title.ilike(like), Champion.name.ilike(like))
        )
    if role:
        q = q.where(Build.role == role)
    if champion_id:
        q = q.where(Build.champion_id == champion_id)
    if mine:
        q = q.where(Build.user_id == user.id)
    if only_favorites:
        q = q.where(Build.fans.any(User.id == user.id))
    return [_a_salida(b, user) for b in db.scalars(q).unique().all()]


@router.get("/{build_id}", response_model=BuildOut)
def get_build(build_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    return _a_salida(_cargar(db, build_id), user)


@router.post("", response_model=BuildOut, status_code=status.HTTP_201_CREATED)
def create_build(data: BuildIn, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    if db.get(Champion, data.champion_id) is None:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "El campeón indicado no existe")
    build = Build(**data.model_dump(), user_id=user.id)
    db.add(build)
    db.commit()
    return _a_salida(_cargar(db, build.id), user)


@router.put("/{build_id}", response_model=BuildOut)
def update_build(
    build_id: int, data: BuildIn, db: Session = Depends(get_db), user: User = Depends(get_current_user)
):
    build = _cargar(db, build_id)
    if build.user_id != user.id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Solo puedes editar tus propias builds")
    if db.get(Champion, data.champion_id) is None:
        raise HTTPException(status.HTTP_422_UNPROCESSABLE_ENTITY, "El campeón indicado no existe")
    for campo, valor in data.model_dump().items():
        setattr(build, campo, valor)
    db.commit()
    return _a_salida(_cargar(db, build_id), user)


@router.delete("/{build_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_build(build_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    build = _cargar(db, build_id)
    if build.user_id != user.id:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "Solo puedes eliminar tus propias builds")
    db.delete(build)
    db.commit()
    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/{build_id}/favorite", response_model=BuildOut)
def add_favorite(build_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    build = _cargar(db, build_id)
    if not any(f.id == user.id for f in build.fans):
        build.fans.append(user)
        db.commit()
    return _a_salida(_cargar(db, build_id), user)


@router.delete("/{build_id}/favorite", response_model=BuildOut)
def remove_favorite(build_id: int, db: Session = Depends(get_db), user: User = Depends(get_current_user)):
    build = _cargar(db, build_id)
    build.fans = [f for f in build.fans if f.id != user.id]
    db.commit()
    return _a_salida(_cargar(db, build_id), user)
