from app.services.user_service import UserService
from app.services.roles_service import RoleService
from app.schemas.input.user import UserCreate
from app.core.settings import Settings
from app.db.models import User


def create_admin_user(
    user_service: UserService, role_service: RoleService, settings: Settings
):
    admin = user_service.get_user_by_email(settings.admin_email)

    if admin:
        return
    admin: User = user_service.create_user(
        UserCreate(
            first_name="admin",
            last_name="admin",
            email=settings.admin_email,
            password=settings.admin_password,
        )
    )
    role_service.assign_role_to_user(admin, "admin")
