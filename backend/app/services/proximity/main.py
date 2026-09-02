from fastapi import FastAPI, APIRouter
from fastapi.middleware.cors import CORSMiddleware

from core.config import FRONTEND_URL

router = APIRouter()

app = FastAPI(title="Proximity Service")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_URL],
    allow_methods=["POST"],
    allow_headers=["*"],
)

app.include_router(router)