from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db.database import db_handler
from app.db.models import User
from app.schemas.user import UserUpdate


router: APIRouter = APIRouter()

db_dependency = Annotated[Session, Depends(db_handler.get_session)]

@router.get("/health")
def get_health():
    return {"status": "ok"}


@router.get("/")
async def root():
    return {
        "title": "GeoEmploi",
        "description": "Il suffit de traverser la rue pour trouver un emploi !",
        "version": "0.1.1",
    }

@router.delete("/api/user/{user_id}")
async def delete_user(user_id: int, db: db_dependency):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return {"message": "User not found"}
    db.delete(user)
    db.commit()
    return {"message": "User supprimé avec succès"}

@router.put("/api/user/{user_id}")
async def update_user(user_id: int, updated_user: UserUpdate, db: db_dependency):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        return {"message": "User not found"}
    
    user.first_name = updated_user.first_name
    user.last_name = updated_user.last_name
    user.email = updated_user.email
    user.password = updated_user.password
    
    db.commit()
    db.refresh(user)
    
    return {"message": "User mis à jour avec succès", "user": user}
