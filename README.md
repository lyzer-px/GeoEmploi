# GeoEmploi

GeoEmploi is a web application that connects job seekers and employers through geolocation.

The goal is to let users search for nearby job offers, apply directly from the application, and allow employers to publish and manage their offers.

The project is built for the Epitech GeoEmploi specifications.

---

## Getting Started

To launch the project, follow the Docker setup instructions in [`INSTALLATION.md`](INSTALLATION.md).

---

## Features

### Job Seekers

- Create and manage a professional profile
- Manage skills and experience
- Set availability
- Search for geolocated job offers
- Browse offers on an interactive map
- Apply directly from the application
- Track applications

### Employers

- Create an employer account
- Verify company activity
- Create and publish job offers
- Geolocate offers
- Define a publication radius
- Receive applications
- Manage application status
- View dashboard statistics
- Get notified when new applications arrive

### Administration

- Moderate offers
- Manage user accounts
- Activate or suspend accounts
- View national metrics
- Handle reports

### Geolocation

- Browse offers without an account
- Use an interactive map
- Geolocate offers at the city or district level
- Use OpenStreetMap
- Render maps with Leaflet

---

## Architecture

The project is split into two main parts:

```text
geoemploi/
├── frontend/             # React application
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   ├── routes.tsx
│   │   ├── services/
│   │   └── ...
│   ├── package.json
│   └── ...
│
├── backend/              # Python API
│   ├── app/
│   │   ├── api/
│   │   │   └── dependencies/
│   │   ├── core/
│   │   ├── db/
│   │   │   └── models/
│   │   ├── schemas/
│   │   │   ├── input/
│   │   │   └── output/
│   │   └── services/
│   │   └── main.py
│   ├── docs/
│   │   └── architecture.md
│   ├── requirements.txt
│   └── ...
│
├── INSTALLATION.md
├── .gitignore
└── README.md
```

## Documentation

- [`INSTALLATION.md`](INSTALLATION.md) for Docker launch instructions
- [`backend/docs/architecture.md`](backend/docs/architecture.md) for backend architecture, services, dependencies, and ownership checks
- [`frontend/docs/INSTALLATION_FRONTEND.md`](frontend/docs/INSTALLATION_FRONTEND.md) for frontend development setup
