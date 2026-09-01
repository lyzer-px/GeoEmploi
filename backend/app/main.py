import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI

from .core.loggings import setup_logging
from .api.routes import rooter
from .core.settings import Settings
from .db.database import DatabaseHandler


@asynccontextmanager
async def lifespan(app: FastAPI):
    setup_logging()
    app.state.settings = Settings()
    app.state.db = DatabaseHandler(app.state.settings)
    logging.info("Creation of tables in %s database.", app.state.settings.db_name)
    app.state.db.create_tables()
    yield
    logging.info("Shutting down...")


app = FastAPI(
    title="efficient token workflow engine API",
    description="An API for building multi-agent AI workflows with optimized token usage.",
    version="0.1.0",
    lifespan=lifespan,
)

app.include_router(router=rooter)
