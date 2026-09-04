from starlette import status
from fastapi import APIRouter, HTTPException

from app.db import User
from app.schemas.input.user import UserCreate, UserIn
from app.schemas.input.auth import AccessToken, RefreshTokenRequest
from app.schemas.output.token import Token
from app.api.dependencies import UserServiceDep, RefreshTokenDep
from app.services.auth_service import AuthenticationService

auth_router = APIRouter(tags=["auth"])


@auth_router.post("/login", response_model=Token, status_code=status.HTTP_200_OK)
def login_user(user_data: UserIn, user_service: UserServiceDep):
    user: User = AuthenticationService.authenticate_user(user_data, user_service)
    access_payload: AccessToken = AuthenticationService.create_access_token_payload(
        user.email, user_service
    )
    access_token: str = AuthenticationService.create_access_token(access_payload)
    refresh_token: str = AuthenticationService.create_refresh_token(user.id)
    return Token(access_token=access_token, refresh_token=refresh_token)


@auth_router.post("/users", response_model=Token, status_code=status.HTTP_201_CREATED)
def create_user(new_user: UserCreate, user_service: UserServiceDep):
    user: User = user_service.create_user(new_user)
    access_payload: AccessToken = AuthenticationService.create_access_token_payload(
        user.email, user_service
    )
    access_token: str = AuthenticationService.create_access_token(access_payload)
    refresh_token: str = AuthenticationService.create_refresh_token(user.id)
    return Token(access_token=access_token, refresh_token=refresh_token)


@auth_router.post("/refresh", response_model=Token)
def refresh_access_token(
    body: RefreshTokenRequest,
    refresh_payload: RefreshTokenDep,
    user_service: UserServiceDep,
):
    user: User = user_service.get_user_by_id(refresh_payload.user_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User no longer exists or is inactive",
        )
    access_payload = AuthenticationService.create_access_token_payload(
        user.email, user_service
    )
    access_token = AuthenticationService.create_access_token(access_payload)
    return Token(access_token=access_token, refresh_token=body.refresh_token)
