from pydantic import BaseModel


class TileRequest(BaseModel):
    z: int
    x: int
    y: int
