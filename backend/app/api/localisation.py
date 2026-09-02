from fastapi import Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.api.routes import router
from app.schemas.user import PreciseLocalisation
from app.db.session import get_db
from app.api.auth import get_current_user
from app.db.models import User


@router.post("/api/localisation")
async def set_user_base_location(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    current_user.location = current_user.base_localisation

    db.add(current_user)
    await db.commit()
    await db.refresh(current_user)

    return {"message": "Localisation mise à jour"}

@router.post("/api/localisation/current")
async def receive_current_location(local: PreciseLocalisation):
    return {"latitude": local.latitude, "longitude": local.longitude}