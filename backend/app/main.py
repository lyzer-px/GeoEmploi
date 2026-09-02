import logging
from contextlib import asynccontextmanager

from .api.auth import auth_router
from .api.users import router
from fastapi import FastAPI

from .core.loggings import setup_logging
from .core.settings import Settings
from .db.database import DatabaseHandler, init_db


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
    title="efficient token workflow engine API",
    description="An API for building multi-agent AI workflows with optimized token usage.",
    version="0.1.0",
    lifespan=lifespan,
)

# .include_router(router=router, prefix="/api/{VERSION_API}")
app.include_router(router=auth_router, prefix="/api/{VERSION_API}")
