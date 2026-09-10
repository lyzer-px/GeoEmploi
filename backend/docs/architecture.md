# GeoEmploi Documentation

This document explains how the project is organized, what the backend service layer does, how FastAPI dependencies are used, what `require_ownership` does, and which data survives container restarts.

## Overview

GeoEmploi is split into two main parts:

- `backend/`: a FastAPI API in Python, with JWT authentication, RBAC, offers, applications, skills, and experiences
- `frontend/`: a React + TypeScript + Vite application

The backend entry point is [`backend/app/main.py`](backend/app/main.py).
At startup it:

- configures logging
- loads settings from environment variables
- initializes the MySQL database
- creates tables if they do not exist
- initializes permissions and roles
- creates the admin user if needed

## Backend Architecture

The backend follows a simple layered structure:

- API routers expose HTTP endpoints
- FastAPI dependencies prepare request-scoped objects and enforce access control
- services contain business logic and database operations
- ORM models describe the persistent entities

### Role of services

Services are the place where the application logic lives. They:

- query and mutate the database
- encapsulate rules that belong to a specific domain
- keep route handlers thin

Examples:

- `OfferService` handles offer creation, listing, updates, deletions, geocoding-related exports, and offer/application aggregation
- `ApplicationService` stores uploaded files, creates applications, fetches files back from disk, and updates application status
- `TileService` downloads map tiles, caches them, and returns cached data when available

Relevant files:

- [`backend/app/services/offer_service.py`](backend/app/services/offer_service.py)
- [`backend/app/services/application_service.py`](backend/app/services/application_service.py)
- [`backend/app/services/tile_cache.py`](backend/app/services/tile_cache.py)

### Role of dependencies

FastAPI dependencies are used to build reusable request guards and object loaders.
They are not the same thing as Python package dependencies.

In this project, dependencies mostly do three jobs:

- authenticate the current user from the JWT token
- fetch database objects such as an offer, application, skill, or experience
- check permissions and ownership before allowing a sensitive operation

Examples:

- `get_current_user` loads the authenticated user
- `require_permission` checks whether the current user has a specific permission
- `require_ownership` checks permission plus ownership of the target object

Relevant file:

- [`backend/app/api/dependencies/auth.py`](backend/app/api/dependencies/auth.py)

## What `require_ownership` does

`require_ownership` is a dependency factory that protects updates and deletions on owned resources.

It takes four arguments:

- `resource`: the resource type, for example `Resource.OFFER`
- `action`: the requested action, for example `Action.UPDATE` or `Action.DELETE`
- `owner_field`: the attribute containing the owner ID, for example `"employer_id"` or `"user_id"`
- `resource_fetcher`: a callable that retrieves the target object from the database

It then enforces this logic:

1. load the current user
2. load the role service
3. fetch the target object
4. if the user has the `*_ANY` permission for that resource, allow the request
5. otherwise read the owner ID from the configured owner field
6. if the user has the standard permission and owns the object, allow the request
7. otherwise return `403 Forbidden`

This is used for things like:

- employers updating or deleting their own offers
- users updating or deleting their own skills
- users updating or deleting their own experiences
- users deleting their own applications

Example usages:

- [`backend/app/api/dependencies/offers.py`](backend/app/api/dependencies/offers.py)
- [`backend/app/api/dependencies/skills.py`](backend/app/api/dependencies/skills.py)
- [`backend/app/api/dependencies/experiences.py`](backend/app/api/dependencies/experiences.py)
- [`backend/app/api/dependencies/application.py`](backend/app/api/dependencies/application.py)

## Data persistence

Two parts of the project persist data across container restarts.

### MySQL volume

In [`docker-compose.yml`](docker-compose.yml), MySQL uses the named volume `mysql-data` mounted at `/var/lib/mysql`.

That means the following data survives a normal stop/start cycle:

- users
- roles and permissions
- offers
- applications
- skills
- experiences
- any other database rows stored in MySQL

### Backend storage directory

The backend mounts `./backend/storage:/code/backend/storage`.

This directory is used for:

- uploaded CVs in `storage/cv_tech/`
- uploaded cover letters in `storage/cover_letter/`
- cached map tiles in `storage/tile_cache/`

Relevant files:

- [`backend/app/services/application_service.py`](backend/app/services/application_service.py)
- [`backend/app/services/tile_cache.py`](backend/app/services/tile_cache.py)

## Important files

- [`backend/app/main.py`](backend/app/main.py)
- [`backend/app/api/dependencies/auth.py`](backend/app/api/dependencies/auth.py)
- [`docker-compose.yml`](docker-compose.yml)
- [`backend/Dockerfile`](backend/Dockerfile)
- [`frontend/Dockerfile`](frontend/Dockerfile)
