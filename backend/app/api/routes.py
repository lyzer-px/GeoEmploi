from fastapi import APIRouter, Depends
from typing import Annotated

rooter: APIRouter = APIRouter()


@rooter.get("/health")
def get_health():
    return {"status": "ok"}


@rooter.get("/")
def root():
    return {
        "title": "GeoEmploi",
        "description": "New Linkedin",
        "version": "0.1.0",
    }
