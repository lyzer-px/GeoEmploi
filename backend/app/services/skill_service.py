from typing import Optional

from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlmodel import select

from app.db.database import get_db_session
from app.db.models import Skill, UsersSkills, User
from app.schemas.input.skills import (
    SkillCreate,
    SkillUpdate,
    UserSkillCreate,
    UserSkillUpdate,
)


class SkillService:
    def __init__(self, session: Session):
        self._db: Session = session

    def get_skill_by_id(self, skill_id: int) -> Optional[Skill]:
        """Retrieves a skill by its ID."""
        statement = select(Skill).where(Skill.id == skill_id)
        return self._db.scalars(statement).first()

    def get_skill_by_name(self, name: str) -> Optional[Skill]:
        statement = select(Skill).where(Skill.name.ilike(name.strip()))
        return self._db.scalars(statement).first()

    def get_all_skills(self, skip: int = 0, limit: int = 100) -> list[Skill]:
        """Retrieves all skills with pagination."""
        statement = select(Skill).offset(skip).limit(limit)
        return self._db.scalars(statement).all()

    def create_skill(self, skill_data: SkillCreate) -> Skill:
        """Create a new skill in the shared catalog."""
        if self.get_skill_by_name(skill_data.name):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"Skill '{skill_data.name}' already exists.",
            )
        new_skill = Skill(
            name=skill_data.name,
            description=skill_data.description,
        )

        self._db.add(new_skill)
        try:
            self._db.commit()
            self._db.refresh(new_skill)
            return new_skill
        except Exception:
            self._db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error during the creation of the skill.",
            )

    def update_skill(self, skill: Skill, skill_data: SkillUpdate) -> Skill:
        """Updates an existing skill."""
        update_dict = skill_data.model_dump(exclude_unset=True)

        if "name" in update_dict and update_dict["name"] != skill.name:
            existing = self.get_skill_by_name(update_dict["name"])
            if existing and existing.id != skill.id:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"Skill '{update_dict['name']}' already exists.",
                )

        for field, value in update_dict.items():
            setattr(skill, field, value)
        try:
            self._db.commit()
            self._db.refresh(skill)
            return skill
        except Exception:
            self._db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error updating the skill.",
            )

    def delete_skill(self, skill: Skill) -> None:
        """Delete a skill from the catalog."""
        self._db.delete(skill)
        try:
            self._db.commit()
        except Exception:
            self._db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error deleting the skill.",
            )

    def get_user_skills(self, user_id: int) -> list[UsersSkills]:
        """Retrieve all skills (with level) associated with a given user."""
        statement = select(UsersSkills).where(UsersSkills.user_id == user_id)
        return self._db.scalars(statement).all()

    def get_user_skill(self, user_id: int, skill_id: int) -> Optional[UsersSkills]:
        """Retrieve a single user/skill association entry."""
        statement = select(UsersSkills).where(
            UsersSkills.user_id == user_id,
            UsersSkills.skill_id == skill_id,
        )
        return self._db.scalars(statement).first()

    def add_skill_to_user(self, user: User, skill_data: UserSkillCreate) -> UsersSkills:
        """Associate a skill to a user profile with a given level.
        Get-or-create the skill by name, then assign it to the user.
        """
        skill = self.get_skill_by_name(skill_data.name)
        if not skill:
            skill = self.create_skill(
                SkillCreate(name=skill_data.name, description=skill_data.description)
            )

        if self.get_user_skill(user.id, skill.id):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"User already has skill '{skill.name}'.",
            )
        new_entry = UsersSkills(
            user_id=user.id,
            skill_id=skill.id,
            level=skill_data.level,
        )
        self._db.add(new_entry)
        try:
            self._db.commit()
            self._db.refresh(new_entry)
            return new_entry
        except Exception:
            self._db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error adding skill to user.",
            )

    def update_user_skill(
        self, entry: UsersSkills, skill_data: UserSkillUpdate
    ) -> UsersSkills:
        """Update the level of a user's skill."""
        update_dict = skill_data.model_dump(exclude_unset=True)
        for field, value in update_dict.items():
            setattr(entry, field, value)

        try:
            self._db.commit()
            self._db.refresh(entry)
            return entry
        except Exception:
            self._db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error updating user skill.",
            )

    def remove_skill_from_user(self, entry: UsersSkills) -> None:
        """Remove a skill from a user's profile."""
        self._db.delete(entry)
        try:
            self._db.commit()
        except Exception:
            self._db.rollback()
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Error removing skill from user.",
            )


def get_skill_service(session: Session = Depends(get_db_session)) -> SkillService:
    return SkillService(session)
