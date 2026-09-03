from sqlalchemy import create_engine, Engine, text
from sqlalchemy.orm import sessionmaker

from .models import Base
from app.core.settings import Settings

class DatabaseHandler:
    def __init__(self, settings: Settings):
        self.settings = settings
        self.engine: Engine | None = None
        self.session_factory = None

    def _ensure_engine(self) -> Engine:
        if self.engine is None:
            self.engine = create_engine(self.settings.database_url)
            self.session_factory = sessionmaker(
                bind=self.engine,
                autoflush=False,
                autocommit=False,
            )
        return self.engine

    def create_tables(self):
        engine = self._ensure_engine()

        with engine.begin() as connection:
            connection.execute(text("CREATE EXTENSION IF NOT EXISTS postgis"))
        Base.metadata.create_all(engine)

    def get_session(self):
        self._ensure_engine()
        db = self.session_factory()
        try:
            yield db
        finally:
            db.close()


db_handler = DatabaseHandler(Settings())

