from pydantic import BaseModel
from fastapi import UploadFile


class ApplicationIn(BaseModel):
    file: UploadFile
