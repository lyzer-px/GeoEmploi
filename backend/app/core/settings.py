from sqlalchemy.engine import URL

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    db_name: str
    db_username: str
    db_password: str
    db_host: str
    db_port: int
    hash_key: str

    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    @property
    def database_url(self) -> str:
        return str(
            URL.create(
                drivername="postgresql+psycopg2",
                username=self.db_username,
                password=self.db_password,
                host=self.db_host,
                port=self.db_port,
                database=self.db_name,
            )
        )
