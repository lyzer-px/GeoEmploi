from sqlalchemy.orm import DeclarativeBase, Mapped, mapped_column, relationship
from sqlalchemy import Date, String, ForeignKey
from pwdlib import PasswordHash


class Base(DeclarativeBase):
    pass

class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(128), nullable=False)
    email: Mapped[str] = mapped_column(String(128), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(String(128), nullable=False)
    avaibility: Mapped[str] = mapped_column(String)

    def set_password(self, password: str):
        self.password =  PasswordHash.hash(password)

    def check_password(self, password: str):
        return PasswordHash.verify(password)
    
class Role(Base):
    __tablename__ = "roles"

    id: Mapped[int] = mapped_column(primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(128), unique=True)
    description: Mapped[str] = mapped_column(String(256))

class Permission(Base):
    __tablename__ = "permissions"

    id: Mapped[int] = mapped_column(primary_key=True, index=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(128), unique=True)

class RolePermission(Base):
    __tablename__ = "role_permissions"

    role_id: Mapped[int] = mapped_column(ForeignKey("roles.id"), primary_key=True)
    permission_id: Mapped[int] = mapped_column(ForeignKey("permissions.id"), primary_key=True)

class Skill(Base):
    __tablename__ = "skills"

    id: Mapped[int] = mapped_column(unique=True, index=True, primary_key=True)
    name: Mapped[int] = mapped_column(String(128), unique=True)
    level: Mapped[int] = mapped_column(String(5))
    description: Mapped[str] = mapped_column(String(256))

class UsersSkills(Base):
    __tablename__ = "users_skills"

    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), primary_key=True)
    skill_id: Mapped[int] = mapped_column(ForeignKey("skills.id"), primary_key=True)

class Experience(Base):
    __tablename__ = "experiences"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[int] = mapped_column(String(128))
    start_date: Mapped[Date] = mapped_column(Date, nullable=True)
    end_date: Mapped[Date] = mapped_column(Date, nullable=True)

