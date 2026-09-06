import os
from uuid import uuid4
from typing import Optional

from pathlib import Path
from fastapi import HTTPException, status, UploadFile, Depends
from sqlmodel import select
from sqlalchemy.orm import Session

from app.db.database import get_db_session
from app.schemas.input.application import ApplicationIn
from app.db.models import Application, User

CV_TECH: Path = Path("storage/cv_tech")
MAX_CV_SIZE_BYTES = 5 * 1024 * 1024


def write_upload_file(file: UploadFile):
    try:
        contents = file.file.read()
        with open(file.filename, "wb") as f:
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
        CV_TECH.mkdir(exist_ok=True)

    def get_application_by_id(self, application_id: int) -> Application:
        statement = select(Application).where(Application.id == application_id)
        return self._db.scalars(statement).first()

    def get_application_by_user(self, user: User) -> list[Application]:
        statement = select(Application).where(Application.user_id == user.id)
        return self._db.scalars(statement)

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

    def save_application(self, offer_id: int, user: User, application: ApplicationIn):
        storage_file_name: str = str(uuid4())
        new_application = Application(
            resume_path=f"CV_TECH/{storage_file_name}",
            resume_original_filename=application.file.filename,
            user_id=user.id,
            offer_id=offer_id,
        )

        self._db.add(new_application)
        try:
            self._db.commit()
            self._db.refresh(new_application)
            write_upload_file(application.file)
        except Exception:
            self._db.rollback
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error during the creation of the application",
            )

    def delete_application(self, application: Application):
        self._db.delete(application)
        os.remove(application.resume_path)
        try:
            self._db.commit()
        except Exception:
            self._db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error deleting the application",
            )


def get_application_service(
    session: Session = Depends(get_db_session),
) -> ApplicationService:
    return ApplicationService(session)
