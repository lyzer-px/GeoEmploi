import logging

from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware
from fastapi import FastAPI

from .api.auth import auth_router
from .api.users import users_router
from .api.tiles import tiles_router
from .api.roles import roles_router
from .api.permissions import permissions_router
from .api.offers import offers_router
from .api.skills import skills_router

from .core.loggings import setup_logging
from .core.settings import Settings
from .db.database import init_db

VERSION_API: str = "v1"


@asynccontextmanager
async def lifespan(app: FastAPI):
    setup_logging()
    app.state.settings = Settings()
    db_handler = init_db(app.state.settings)
    logging.info("Creation of tables in %s database.", app.state.settings.db_name)
    db_handler.create_tables()
    yield
    logging.info("Shutting down...")
    db_handler.engine.dispose()


app = FastAPI(
    title="Geo Emploi",
    description="",
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/", tags=["System"])
async def root():
    return {
        "title": "GeoEmploi",
        "description": "New Linkedin",
        "version": "0.1.0",
    }


@app.get("/health", tags=["System"])
def get_health():
    return {"status": "ok"}


app.include_router(router=tiles_router, prefix=f"/api/{VERSION_API}/tiles")
app.include_router(router=users_router, prefix=f"/api/{VERSION_API}/users")
app.include_router(router=auth_router, prefix=f"/api/{VERSION_API}/auth")
app.include_router(router=roles_router, prefix=f"/api/{VERSION_API}/roles")
app.include_router(router=permissions_router, prefix=f"/api/{VERSION_API}/permissions")
app.include_router(router=offers_router, prefix=f"/api/{VERSION_API}/offers")
app.include_router(router=skills_router, prefix=f"/api/{VERSION_API}/skills")
