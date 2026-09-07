import os
from uuid import uuid4
from typing import Optional

from pathlib import Path
from fastapi import HTTPException, status, UploadFile, Depends
from sqlmodel import select
from sqlalchemy.orm import Session
from fastapi.responses import FileResponse

from app.db.models import Offer
from app.db.database import get_db_session
from app.db.models import Application, User

CV_TECH: Path = Path("storage/cv_tech")
MAX_CV_SIZE_BYTES = 5 * 1024 * 1024

offer_not_found: HTTPException = HTTPException(
    status_code=status.HTTP_409_CONFLICT, detail="Offer not found."
)

multiple_apply: HTTPException = HTTPException(
    status_code=status.HTTP_409_CONFLICT,
    detail="You can't apply multiple times to the same offer.",
)


def write_upload_file(file: UploadFile, destination_path: Path):
    try:
        file.file.seek(0)
        contents = file.file.read()
        with open(destination_path, "wb") as f:
            f.write(contents)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Error while writing the file.",
        )
    finally:
        file.file.close()


class ApplicationService:
    def __init__(self, session: Session):
        self._db: Session = session
        CV_TECH.mkdir(parents=True, exist_ok=True)

    def get_application_by_id(self, application_id: int) -> Application:
        statement = select(Application).where(Application.id == application_id)
        return self._db.scalars(statement).first()

    def get_resume_file(self, application_id: int) -> FileResponse:
        application = self.get_application_by_id(application_id)

        if not application:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Application not found.",
            )
        file_path = Path(application.resume_path)
        if not file_path.is_file():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Resume file not found on disk.",
            )
        return FileResponse(
            path=file_path,
            filename=application.resume_original_filename,
            media_type="application/octet-stream",
        )

    def get_application_by_user(self, user: User) -> list[Application]:
        statement = select(Application).where(Application.user_id == user.id)
        return self._db.scalars(statement).all()

    def get_application_by_user_and_offer(
        self, user_id: int, offer_id: int
    ) -> Optional[Application]:
        statement = select(Application).where(
            Application.user_id == user_id,
            Application.offer_id == offer_id,
        )
        return self._db.scalars(statement).first()

    def get_applications_by_offer(self, offer_id: int) -> list[Application]:
        statement = select(Application).where(Application.offer_id == offer_id)
        return self._db.scalars(statement).all()

    def save_application(
        self, offer_id: int, user: User, file: UploadFile
    ) -> Application:
        offer = self._db.get(Offer, offer_id)
        if not offer:
            raise offer_not_found
        if self.get_application_by_user_and_offer(user.id, offer_id):
            raise multiple_apply

        storage_file_name: str = str(uuid4())
        file_destination: Path = CV_TECH / storage_file_name
        new_application = Application(
            resume_path=file_destination,
            resume_original_filename=file.filename,
            user_id=user.id,
            offer_id=offer_id,
            offer=offer,
        )

        write_upload_file(file, file_destination)
        self._db.add(new_application)
        try:
            self._db.add(new_application)
            self._db.commit()
            self._db.refresh(new_application)
            return new_application
        except Exception:
            self._db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error during the creation of the application",
            )

    def delete_application(self, application: Application):
        self._db.delete(application)
        try:
            self._db.commit()
            os.remove(application.resume_path)
        except Exception:
            self._db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error deleting the application",
            )


def get_application_service(session: Session = Depends(get_db_session),) -> ApplicationService:
    return ApplicationService(session)