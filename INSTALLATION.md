# GeoEmploi Installation

This file explains how to launch GeoEmploi with Docker.

## Prerequisites

Before starting the stack, make sure the required environment variables are present in the corresponding example files.

## Environment Files

The project ships with three example environment files:

- [`.env.example`](.env.example) for the Docker Compose stack
- [`backend/.env.example`](backend/.env.example) for the backend service
- [`frontend/.env.example`](frontend/.env.example) for the frontend service

Below is the exact set of variables expected by each file.

### Root `.env.example`

This file is used by [`docker-compose.yml`](docker-compose.yml) for the MySQL container.

- `DB_NAME=your_database_name`
- `DB_USERNAME=your_db_username`
- `DB_PASSWORD=your_db_user_password`
- `DB_ROOT_PASSWORD=N2UFd58sK3dm`

### `backend/.env.example`

This file is used by the backend service.

- `DB_NAME=your_database_name`
- `DB_USERNAME=your_db_username`
- `DB_PASSWORD=your_db_user_password`
- `DB_HOST=localhost`
- `DB_PORT=your_db_port`
- `ADMIN_EMAIL=admin_email`
- `ADMIN_PASSWORD=admin_password`

### `frontend/.env.example`

This file is used by the frontend service.

- `VITE_API_BACKEND_URL=your_api_backend_url`

The frontend URL should point to the API base URL, for example:

```env
VITE_API_BACKEND_URL=http://localhost:8084/api/v1
```

## Docker Stack

From the project root, start the full application stack with:

```bash
docker compose up --build
```

This will:

- build the backend image
- build the frontend image
- start MySQL
- wait for MySQL to become healthy
- start the backend
- start the frontend

## Backend Only

If you only want the API, start MySQL first, then run the backend container:

```bash
docker compose up mysql -d
docker compose up backend
```

If you want to run the backend directly on your machine instead of inside Docker, go to `backend/`, make sure `backend/.env` is configured, and start the FastAPI app using the backend project instructions.

## Frontend Only

The frontend expects the backend API to already be reachable.

If the backend is running locally or through Docker, configure `frontend/.env` so `VITE_API_BACKEND_URL` points to the right API URL.

Then run the frontend from `frontend/`:

```bash
npm install
npm run dev -- --host 0.0.0.0 --port 8000
```

If you want to use Docker for the frontend only, you can start just that service after the backend is available:

```bash
docker compose up frontend
```

## Useful commands

Run in detached mode:

```bash
docker compose up -d --build
```

Follow logs:

```bash
docker compose logs -f
```

Stop the stack:

```bash
docker compose down
```

## Exposed ports

- MySQL: `3308 -> 3306`
- Backend: `8084 -> 8084`
- Frontend: `8000 -> 8000`

## Persisted data

Stopping the containers does not remove the persisted data by default.

The following data is kept:

- MySQL data stored in the named volume `mysql-data`
- uploaded files and tile cache stored in `backend/storage`

If you remove the volume with `docker compose down -v`, the MySQL database will be deleted too.
