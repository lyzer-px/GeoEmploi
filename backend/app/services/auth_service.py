import jwt
from typing import Optional
from datetime import datetime, timezone, timedelta

from jose import jwt
from fastapi import HTTPException, status

from ..services.user_service import UserService
from app.schemas.auth import AccessToken, RefreshToken
from app.schemas.user import UserIn
from app.db.models import User
from app.core.config import (
    SECRET_KEY,
    ACCESS_TOKEN_EXPIRE_MINUTES,
    ALGORITHM,
    REFRESH_TOKEN_EXPIRE_DAY,
)


class AuthenticationService:
    @staticmethod
    def authenticate_user(user_data: UserIn, user_service: UserService) -> User:
        user: Optional[User] = user_service.get_user_by_email(user_data.email)

        if not user:
            raise HTTPException(
                status_code=401, detail="Incorrect username or password"
            )
        if not user.verify_password(user_data.password):
            raise HTTPException(
                status_code=401, detail="Incorrect username or password"
            )
        return user

    @staticmethod
    def create_access_token_payload(
        email: str, user_service: UserService
    ) -> AccessToken:
        user: User = user_service.get_user_by_email(email)
        expire = datetime.now(timezone.utc) + timedelta(
            minutes=ACCESS_TOKEN_EXPIRE_MINUTES
        )
        return AccessToken(
            user_id=user.id,
            email=user.email,
            role=user_service.get_stringify_roles_of_user(user),
            exp=expire,
        )

    @staticmethod
    def create_access_token(token_payload: AccessToken) -> str:
        return jwt.encode(
            token_payload.model_dump(),
            SECRET_KEY,
            algorithm=ALGORITHM,
        )

    @staticmethod
    def create_refresh_token(user_id: int):
        expire = datetime.now(timezone.utc) + timedelta(days=REFRESH_TOKEN_EXPIRE_DAY)
        print(f"{expire=}, {user_id=}")
        token_payload: RefreshToken = RefreshToken(user_id=user_id, exp=expire)
        return jwt.encode(
            token_payload.model_dump(), SECRET_KEY, algorithm=ALGORITHM
        )

