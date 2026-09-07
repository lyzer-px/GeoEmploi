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


def write_upload_file(file: UploadFile, path: Path):
    try:
        contents = file.file.read()

        if len(contents) > MAX_CV_SIZE_BYTES:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail="File too large.",
            )

        with open(path, "wb") as f:
            f.write(contents)

    except HTTPException:
        raise
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
        self,
        offer_id: int,
        user: User,
        application: ApplicationIn,
    ):
        resume_storage_name = str(uuid4())
        cover_letter_storage_name = str(uuid4())

        resume_path = CV_TECH / resume_storage_name
        cover_letter_path = CV_TECH / cover_letter_storage_name

        new_application = Application(
            resume_path=str(resume_path),
            resume_original_filename=application.resume.filename or "cv.pdf",
            cover_letter_path=str(cover_letter_path),
            cover_letter_original_filename=(
                application.cover_letter.filename or "lettre.pdf"
            ),
            user_id=user.id,
            offer_id=offer_id,
        )

        try:
            self._db.add(new_application)
            self._db.commit()
            self._db.refresh(new_application)

            write_upload_file(application.resume, resume_path)
            write_upload_file(application.cover_letter, cover_letter_path)

            return new_application

        except HTTPException:
            self._db.rollback()

            if resume_path.exists():
                resume_path.unlink()

            if cover_letter_path.exists():
                cover_letter_path.unlink()

            raise

        except Exception:
            self._db.rollback()

            if resume_path.exists():
                resume_path.unlink()

            if cover_letter_path.exists():
                cover_letter_path.unlink()

            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error during the creation of the application",
            )

    def delete_application(self, application: Application):
        self._db.delete(application)

        if application.resume_path:
            resume_path = Path(application.resume_path)
            if resume_path.exists():
                resume_path.unlink()

        if application.cover_letter_path:
            cover_letter_path = Path(application.cover_letter_path)
            if cover_letter_path.exists():
                cover_letter_path.unlink()

        try:
            self._db.commit()
        except Exception:
            self._db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error deleting the application",
            )


def get_application_service(session: Session = Depends(get_db_session),) -> ApplicationService:
    return ApplicationService(session)