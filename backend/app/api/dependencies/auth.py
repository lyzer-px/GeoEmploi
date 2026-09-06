from typing import Annotated, Callable, TypeVar

from jose import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from app.core.config import SECRET_KEY, ALGORITHM
from app.db.models.rbac import User
from app.schemas.input.auth import AccessToken, RefreshToken, RefreshTokenRequest
from app.services.user_service import UserService, get_user_service
from app.services.roles_service import RoleService, get_role_service
from app.services.offer_service import OfferService, get_offer_service
from app.core.permissions import Resource, Action, perm


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

credentials_exception = HTTPException(
    status_code=status.HTTP_401_UNAUTHORIZED,
    detail="Could not validate credentials",
    headers={"WWW-Authenticate": "Bearer"},
)

permissions_exception = HTTPException(
    status_code=status.HTTP_403_FORBIDDEN,
    detail="You do not have the necessary permissions to perform this action.",
)

T = TypeVar("T")

UserServiceDep = Annotated[UserService, Depends(get_user_service)]
RoleServiceDep = Annotated[RoleService, Depends(get_role_service)]


def get_current_token_payload(
    token: Annotated[str, Depends(oauth2_scheme)],
) -> AccessToken:

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return AccessToken.model_validate(payload)
    except Exception:
        raise credentials_exception


AccessTokenDep = Annotated[AccessToken, Depends(get_current_token_payload)]


def get_current_user(
    payload: AccessTokenDep,
    user_service: UserServiceDep,
) -> User:
    user = user_service.get_user_by_id(payload.user_id)

    if not user:
        raise credentials_exception
    return user


CurrentUserDep = Annotated[User, Depends(get_current_user)]


def verify_refresh_token(body: RefreshTokenRequest) -> RefreshToken:
    try:
        payload = jwt.decode(body.refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
        refresh_payload = RefreshToken.model_validate(payload)

        if refresh_payload.token_type != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type",
            )
        return refresh_payload
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token",
            headers={"WWW-Authenticate": "Bearer"},
        )


RefreshTokenDep = Annotated[RefreshToken, Depends(verify_refresh_token)]


def require_permission(permission_name: str):
    def dependency(
        user: CurrentUserDep,
        role_service: RoleServiceDep,
    ) -> User:
        if not role_service.has_permission(user, permission_name):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Missing required permission: {permission_name}",
            )

        return user

    return dependency


def require_ownership(
    resource: Resource,
    action: Action,
    owner_field: str,
    resource_fetcher: Callable[..., T],
):
    perm_own: str = perm(action, resource)
    perm_any: str = perm(Action.UPDATE_ANY, resource)

    def dependency(
        user: CurrentUserDep,
        role_service: RoleServiceDep,
        target=Depends(resource_fetcher),
    ):
        if role_service.has_permission(user, perm_any):
            return target
        owner_id: int = getattr(target, owner_field, None)
        if role_service.has_permission(user, perm_own) and owner_id == user.id:
            return target
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=f"Missing required permission: {perm_own}",
        )

    return dependency
