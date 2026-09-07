from typing import Optional

from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlmodel import select

from app.db.database import get_db_session
from app.db.models import Experience, User
from app.schemas.input.experiences import ExperienceCreate, ExperienceUpdate


class ExperienceService:
    def __init__(self, session: Session):
        self._db: Session = session

    def get_experience_by_id(self, experience_id: int) -> Optional[Experience]:
        """Retrieves an experience by its ID."""
        statement = select(Experience).where(Experience.id == experience_id)
        return self._db.scalars(statement).first()

    def get_experiences_by_user(self, user_id: int) -> list[Experience]:
        """Retrieves all experiences belonging to a given user."""
        statement = select(Experience).where(Experience.user_id == user_id)
        return self._db.scalars(statement).all()

    def create_experience(
        self, user: User, experience_data: ExperienceCreate
    ) -> Experience:
        """Create a new experience for the given user."""
        new_experience = Experience(
            name=experience_data.name,
            description=experience_data.description,
            start_date=experience_data.start_date,
            end_date=experience_data.end_date,
            user_id=user.id,
        )

        self._db.add(new_experience)
        try:
            self._db.commit()
            self._db.refresh(new_experience)
            return new_experience
        except Exception:
            self._db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error during the creation of the experience.",
            )

    def update_experience(
        self, experience: Experience, experience_data: ExperienceUpdate
    ) -> Experience:
        """Updates an existing experience."""
        update_dict = experience_data.model_dump(exclude_unset=True)
        for field, value in update_dict.items():
            setattr(experience, field, value)

        try:
            self._db.commit()
            self._db.refresh(experience)
            return experience
        except Exception:
            self._db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error updating the experience.",
            )

    def delete_experience(self, experience: Experience) -> None:
        """Delete an experience."""
        self._db.delete(experience)
        try:
            self._db.commit()
        except Exception:
            self._db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error deleting the experience.",
            )


def get_experience_service(
    session: Session = Depends(get_db_session),
) -> ExperienceService:
    return ExperienceService(session)
