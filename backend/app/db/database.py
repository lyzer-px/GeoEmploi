from sqlalchemy import create_engine, Engine
from sqlalchemy.orm import sessionmaker

from . import models
from .models.base import Base
from app.core.settings import Settings


class DatabaseHandler:
    engine: Engine

    def __init__(self, settings: Settings):
        self.engine = create_engine(settings.database_url)
        self.session_factory = sessionmaker(
            bind=self.engine,
            autoflush=False,
            autocommit=False,
        )

    def create_tables(self):
        Base.metadata.create_all(self.engine)

    def get_session(self):
        with self.session_factory() as session:
            yield session
