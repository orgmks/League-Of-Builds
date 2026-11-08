from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

import models  # noqa: F401  (registra las tablas en Base)
from core.config import settings
from database.db import Base, SessionLocal, engine
from database.seed import cargar_campeones
from routers import auth, builds, champions, stats


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)
    with SessionLocal() as db:
        cargar_campeones(db)
    yield


app = FastAPI(title="LoL Hub API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(champions.router)
app.include_router(builds.router)
app.include_router(stats.router)


@app.get("/", tags=["health"])
def root():
    return {"app": "LoL Hub API", "docs": "/docs"}
