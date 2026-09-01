from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    database: str
    db_username: str
    db_password: str
    db_port: str
    db_host: str

    model_config = SettingsConfigDict(env_file=".env")
