import jwt
from fastapi import FastAPI, HTTPException
from typing import Optional
from datetime import datetime, timezone, timedelta

from fastapi import Depends

from ..services.user_service import UserService, get_user_service
from app.schemas.auth import AccessToken, RefreshToken
from app.schemas.user import UserIn
from app.db.models import User

SECRET_KEY: str = "998ba920f3f7eeb230c15800fe2d6b1f5a810c7806fec053649be53eda4017fe"
ALGORITHM: str = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES: int = 30
REFRESH_TOKEN_EXPIRE_DAY: int = 7

class AuthenticationService:

    @staticmethod
    def authenticate_user(user_data: UserIn, user_service: UserService) -> User:
        user: Optional[User] = user_service.get_user_by_email(user_data.email)

        if not user:
            raise HTTPException(status_code=401, detail="Incorrect username or password")
        if not user.verify_password(user_data.password):
            raise HTTPException(status_code=401, detail="Incorrect username or password")
        return user
    
    @staticmethod
    def create_access_token_payload(email: str, user_service: UserService) -> AccessToken:
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
            token_payload.model_dump(mode="json"),
            SECRET_KEY,
            algorithm=ALGORITHM,
        )

    @staticmethod
    def decode_token(token: str) -> AccessToken:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return AccessToken(payload)

    @staticmethod
    def create_refresh_token(user_id: int):
        expire = datetime.now(timezone.utc) + timedelta(
            days=REFRESH_TOKEN_EXPIRE_DAY
        )
        print(f"{expire=}, {user_id=}")
        token_payload: RefreshToken = RefreshToken(user_id=user_id, exp=expire)
        return jwt.encode(token_payload.model_dump(mode="json"),
                          SECRET_KEY,
                          algorithm=ALGORITHM
        )