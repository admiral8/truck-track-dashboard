# Truck Track Dashboard

A simple truck telemetry dashboard built with FastAPI, PostgreSQL, Python, and Mapbox.

## Overview

This project simulates truck telemetry data, stores it in PostgreSQL, and visualizes truck locations on a Mapbox dashboard.

## Screenshot

![Truck Track Dashboard](screenshots/dashboard.png)

## Features

- Python truck simulator
- FastAPI backend API
- PostgreSQL telemetry storage
- Mapbox-based dashboard
- Multiple truck simulation
- Truck speed, battery level, status, latitude, and longitude display
- Real-time-like updates every 3 seconds

## Tech Stack

- Python
- FastAPI
- PostgreSQL
- Mapbox GL JS
- JavaScript
- HTML / CSS

## How It Works

```text
simulator.py -> FastAPI backend -> PostgreSQL
                         ↓
                 frontend dashboard -> Mapbox map
```

## Project Structure

```text
T2/
├── server.py
├── simulator.py
├── database.py
├── frontend/
│   ├── index.html
│   ├── app.js
│   └── style.css
├── screenshots/
│   └── dashboard.png
├── requirements.txt
├── README.md
└── .gitignore
```

## Setup

```bash
pip install -r requirements.txt
```

## Database Setup

Create PostgreSQL database:

```bash
createdb truck_dashboard
```

Create telemetry table:

```sql
CREATE TABLE telemetry_logs (
	id SERIAL PRIMARY KEY,
	truck_id VARCHAR(50) NOT NULL,
	latitude DOUBLE PRECISION NOT NULL,
	longitude DOUBLE PRECISION NOT NULL,
	speed DOUBLE PRECISION NOT NULL,
	battery_level INTEGER NOT NULL,
	status VARCHAR(30) NOT NULL,
	received_at TIMESTAMP NOT NULL
);
```

## Run Backend

```bash
python server.py
```

## Run Simulator

```bash
python simulator.py
```

## Open Dashboard

Open:

```text
frontend/index.html
```

## Mapbox Token

You need your own Mapbox public token.

Create a local file:

```text
frontend/config.js
```

Add your token:

```js
const MAPBOX_TOKEN = "your_mapbox_token_here";
```

This file is ignored by Git and should not be pushed to GitHub.