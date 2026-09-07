from fastapi import UploadFile


class ApplicationIn:
    def __init__(
        self,
        resume: UploadFile,
        cover_letter: UploadFile,
    ):
        self.resume = resume
        self.cover_letter = cover_letter
