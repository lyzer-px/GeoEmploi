
FROM python:3.14


WORKDIR /code/backend


COPY ./requirements.txt /code/backend/requirements.txt


RUN pip install --no-cache-dir --upgrade -r /code/backend/requirements.txt


COPY ./app /code/backend/app


CMD ["fastapi", "run", "app/main.py", "--host", "0.0.0.0", "--port", "8084"]