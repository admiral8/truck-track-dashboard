# Truck Track Dashboard

A truck telemetry dashboard built with FastAPI, PostgreSQL, Docker, and Mapbox GL JS.

## Overview

Truck Track Dashboard is a personal backend development project that simulates truck telemetry data, stores it in PostgreSQL, and visualizes vehicle locations on an interactive map.

The project demonstrates REST API development, database integration, containerization, and communication between multiple services.

## Screenshot

![Truck Track Dashboard](screenshots/dashboard.png)

## Features

- Simulates telemetry data for multiple trucks
- REST API built with FastAPI
- PostgreSQL database for telemetry storage
- Interactive map powered by Mapbox GL JS
- Displays truck location, speed, battery level, and status
- Telemetry updates every 3 seconds
- Multi-container environment using Docker Compose
- Container health checks for the backend and database
- Configuration through environment variables

## Tech Stack

**Backend**
- Python
- FastAPI

**Database**
- PostgreSQL 16

**Frontend**
- JavaScript
- HTML / CSS
- Mapbox GL JS

**Infrastructure**
- Docker
- Docker Compose

## Architecture

```text
                  Truck Simulator
                         |
                         | HTTP POST
                         v
                   FastAPI Backend
                         |
                         | SQL
                         v
                    PostgreSQL
                         ^
                         |
                   FastAPI Backend
                         ^
                         | HTTP GET
                         |
                 Frontend Dashboard
                         |
                         v
                    Mapbox GL JS
```

The simulator generates telemetry data and sends it to the FastAPI backend.

The backend stores the data in PostgreSQL and provides API endpoints for retrieving the latest truck information.

The frontend fetches data from the API and displays truck locations on an interactive Mapbox map.

## Project Structure

```text
truck-track-dashboard/
├── server.py
├── simulator.py
├── database.py
├── init.sql
├── requirements.txt
├── Dockerfile
├── docker-compose.yml
├── .dockerignore
├── .gitignore
├── .env.example
├── README.md
├── frontend/
│   ├── index.html
│   ├── app.js
│   ├── style.css
│   └── config.example.js
└── screenshots/
    └── dashboard.png
```

## Quick Start (Docker)

### Prerequisites

- Docker Desktop
- Git
- A Mapbox public access token

### 1. Clone the Repository

```bash
git clone https://github.com/admiral8/truck-track-dashboard.git
cd truck-track-dashboard
```

### 2. Configure Environment Variables

Create a local `.env` file from the provided template:

```bash
cp .env.example .env
```

The default configuration is:

```env
POSTGRES_DB=truck_dashboard
POSTGRES_USER=postgres
POSTGRES_PASSWORD=change_me
POSTGRES_HOST=db
POSTGRES_PORT=5432
```

You can change these values in your local `.env` file.

Do not commit `.env` to GitHub.

### 3. Build and Start the Containers

```bash
docker compose up --build -d
```

Docker Compose starts three services:

| Service | Description |
|---------|-------------|
| `db` | PostgreSQL database |
| `backend` | FastAPI application |
| `simulator` | Truck telemetry simulator |

The backend waits for the database health check to pass before starting.

The simulator waits for the backend health check to pass before starting.

### 4. Verify the Containers

```bash
docker compose ps
```

The backend and database should report a healthy status.

The simulator should be running.

### 5. Configure Mapbox

Create your local Mapbox configuration file:

```bash
cp frontend/config.example.js frontend/config.js
```

Open `frontend/config.js` and replace the placeholder with your own Mapbox public access token:

```javascript
const MAPBOX_TOKEN = "your_mapbox_public_token";
```

You can create a token at:

https://account.mapbox.com/

The `frontend/config.js` file is ignored by Git and should not be committed to GitHub.

### 6. Open the Dashboard

Open the following file in your browser:

```text
frontend/index.html
```

The dashboard uses Mapbox to display simulated truck locations.

### 7. API Documentation

FastAPI provides interactive API documentation through Swagger UI:

http://localhost:8000/docs

### 8. Stop the Containers

```bash
docker compose down
```

This stops and removes the containers while preserving the PostgreSQL data volume.

To remove the containers and the database volume:

```bash
docker compose down -v
```

**Warning:** The `-v` option deletes the database volume and its stored data.

## API Endpoints

### POST /api/v1/telemetry

Receives telemetry data from the simulator and stores it in PostgreSQL.

Example payload:

```json
{
  "truck_id": "TRUCK-001"
  "latitude": 35.6895,
  "longitude": 139.6917,
  "speed": 58.5,
  "battery_level": 82,
  "status": "moving"
}
```

### GET /api/v1/trucks

Returns the latest telemetry data for all trucks.

The frontend uses this endpoint to display current vehicle information.

## Database

PostgreSQL stores truck telemetry records.

The database initialization script is located at:

```text
init.sql
```

When PostgreSQL initializes a new database volume, the script creates the required database structure.

Database data is stored in a Docker named volume to persist across container restarts.

## Security Notes

- Environment variables are stored in a local `.env` file.
- `.env` is excluded from Git using `.gitignore`.
- Local Mapbox configuration is excluded from Git.
- Use your own Mapbox public token.
- Never place secret Mapbox tokens in frontend code.
- For production use, replace example database credentials with secure values.

## Future Improvements

- Display historical truck routes on the map
- Detect abnormal telemetry data
- Add automated tests
- Add CI/CD with GitHub Actions
- Improve error handling and logging
- Add authentication and authorization
- Deploy the application to a cloud environment

---

*God bless this code.* 🙏