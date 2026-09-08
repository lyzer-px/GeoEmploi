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
from app.db.models.application import ApplicationStatus
from app.schemas.input.applications import ApplicationUpdate
from app.schemas.output.applications import ApplicationOut, MyApplicationOut
from app.schemas.output.offers import OfferOut


CV_TECH: Path = Path("storage/cv_tech")
COVER_LETTER: Path = Path("storage/cover_letter")
MAX_CV_SIZE_BYTES = 5 * 1024 * 1024

offer_not_found: HTTPException = HTTPException(
    status_code=status.HTTP_409_CONFLICT, detail="Offer not found."
)

multiple_apply: HTTPException = HTTPException(
    status_code=status.HTTP_409_CONFLICT,
    detail="You can't apply multiple times to the same offer.",
)

application_not_found: HTTPException = HTTPException(
    status_code=status.HTTP_404_NOT_FOUND,
    detail="Application not found.",
)

file_not_found: HTTPException = HTTPException(
    status_code=status.HTTP_404_NOT_FOUND,
    detail="File not found on disk.",
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
        COVER_LETTER.mkdir(parents=True, exist_ok=True)

    @staticmethod
    def _to_application_out(application: Application) -> ApplicationOut:
        """Build the ApplicationOut schema from an Application ORM object."""
        return ApplicationOut(
            id=application.id,
            first_name=application.user.first_name,
            last_name=application.user.last_name,
            email=application.user.email,
            status=application.status,
            created_at=application.created_at,
            resume_original_filename=application.resume_original_filename,
        )

    def _to_my_application_out(self, application: Application) -> MyApplicationOut:
        """Build the full MyApplicationOut schema (application + offer)."""
        return MyApplicationOut(
            application=self._to_application_out(application),
            offer=OfferOut.model_validate(application.offer),
        )

    def get_application_by_id(self, application_id: int) -> Application:
        statement = select(Application).where(Application.id == application_id)
        return self._db.scalars(statement).first()

    def get_resume_file(self, application_id: int) -> FileResponse:
        application = self.get_application_by_id(application_id)

        if not application:
            raise application_not_found
        file_path = Path(application.resume_path)
        if not file_path.is_file():
            raise file_not_found
        return FileResponse(
            path=file_path,
            filename=application.resume_original_filename,
            media_type="application/octet-stream",
        )

    def get_cover_letter_file(self, application_id: int) -> FileResponse:
        application = self.get_application_by_id(application_id)

        if not application:
            raise application_not_found
        file_path = Path(application.cover_letter_path)
        if not file_path.is_file():
            raise file_not_found
        return FileResponse(
            path=file_path,
            filename=application.cover_letter_original_filename,
            media_type="application/octet-stream",
        )


    def get_application_by_user(self, user: User) -> list[MyApplicationOut]:
        statement = select(Application).where(Application.user_id == user.id)
        applications = self._db.scalars(statement).all()
        return [self._to_my_application_out(app) for app in applications]

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
        self, offer_id: int, user: User, resume: UploadFile, cover_letter: UploadFile
    ) -> MyApplicationOut:
        offer = self._db.get(Offer, offer_id)
        if not offer:
            raise offer_not_found

        if self.get_application_by_user_and_offer(user.id, offer_id):
            raise multiple_apply

        resume_ext = Path(resume.filename).suffix if resume.filename else ""
        cover_letter_ext = (
            Path(cover_letter.filename).suffix if cover_letter.filename else ""
        )
        storage_resume_name = f"{uuid4()}{resume_ext}"
        storage_cover_letter_name = f"{uuid4()}{cover_letter_ext}"
        resume_destination: Path = CV_TECH / storage_resume_name
        cover_letter_destination: Path = COVER_LETTER / storage_cover_letter_name

        written_files: list[Path] = []

        try:
            write_upload_file(resume, resume_destination)
            written_files.append(resume_destination)
            write_upload_file(cover_letter, cover_letter_destination)
            written_files.append(cover_letter_destination)

            new_application = Application(
                resume_path=str(resume_destination),
                resume_original_filename=resume.filename,
                cover_letter_path=str(cover_letter_destination),
                cover_letter_original_filename=cover_letter.filename,
                user_id=user.id,
                offer_id=offer_id,
            )
            self._db.add(new_application)
            self._db.commit()
            self._db.refresh(new_application)

            return self._to_my_application_out(new_application)

        except Exception as exc:
            self._db.rollback()
            for file_path in written_files:
                if file_path.exists():
                    file_path.unlink(missing_ok=True)
            if isinstance(exc, HTTPException):
                raise exc

            import traceback
            print("="*80)
            traceback.print_exc()
            print("="*80)

            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error during the creation of the application",
            ) from exc

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

    def update_status_application(
        self, application_id: int, application_status: ApplicationUpdate
    ) -> MyApplicationOut:
        application = self.get_application_by_id(application_id)
        if not application:
            raise application_not_found

        application.status = application_status.status
        self._db.commit()
        self._db.refresh(application)

        return self._to_my_application_out(application)


def get_application_service(
    session: Session = Depends(get_db_session),
) -> ApplicationService:
    return ApplicationService(session)