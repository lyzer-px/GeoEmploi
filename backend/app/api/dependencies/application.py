from typing import Annotated

from fastapi import Depends, HTTPException, status


from app.db.models.application import Application
from app.core.permissions import Resource, Action
from app.api.dependencies.auth import require_ownership
from app.services.application_service import ApplicationService, get_application_service

owner_name: str = "user_id"


ApplicationServiceDep = Annotated[
    ApplicationService, Depends(get_application_service)
]


def get_application(
    application_id: int, applcation_service: ApplicationServiceDep
) -> Application:
    application = applcation_service.get_application_by_id(application_id)

    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Offer {application_id} not found.",
        )
    return application


ApplicationDeleteDep = Annotated[
    Application,
    Depends(
        require_ownership(
            Resource.APPLICATION, Action.DELETE, owner_name, get_application
        )
    ),
]
