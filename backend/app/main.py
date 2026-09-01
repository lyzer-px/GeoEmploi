import logging

from fastapi import FastAPI
from contextlib import asynccontextmanager

from .api.routes import rooter

from .schemas.settings import Settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    logging.info("Startup...")
    app.state.settings = Settings()
    yield
    logging.info("Shutting down...")


app = FastAPI(
    title="efficient token workflow engine API",
    description="An API for building multi-agent AI workflows with optimized token usage.",
    version="0.1.0",
    lifespan=lifespan,
)

app.include_router(router=rooter)
