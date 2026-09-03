from typing import Generator

from sqlalchemy import create_engine, Engine
from sqlalchemy.orm import sessionmaker, Session

from .models.base import Base
from app.core.settings import Settings


class DatabaseHandler:
    engine: Engine

    def __init__(self, settings: Settings):
        self.engine = create_engine(
            settings.database_url, pool_pre_ping=True, pool_timeout=20
        )
        self.session_factory = sessionmaker(
            bind=self.engine,
            autoflush=False,
        )

    def create_tables(self):
        Base.metadata.create_all(self.engine)

    def get_session(self) -> Generator[Session, None, None]:
        session = self.session_factory()
        try:
            yield session
        except Exception:
            session.rollback()
            raise
        finally:
            session.close()


def init_db(settings: Settings) -> DatabaseHandler:
    global db_handler
    db_handler = DatabaseHandler(settings)
    return db_handler


def get_db_session() -> Generator[Session, None, None]:
    if db_handler is None:
        raise RuntimeError("Database not initialized")
    yield from db_handler.get_session()
