from .database import db_handler


def get_db():
    yield from db_handler.get_session()