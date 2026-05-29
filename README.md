# Truck Track Dashboard

A simple truck telemetry dashboard built with FastAPI, Python, and Mapbox.

## Overview

This project simulates truck telemetry data and visualizes the truck location on a Mapbox dashboard.

## Features

- Python truck simulator
- FastAPI backend API
- Mapbox-based dashboard
- Truck speed, battery level, latitude, and longitude display
- Real-time-like updates every 3 seconds

## Tech Stack

- Python
- FastAPI
- Mapbox GL JS
- JavaScript
- HTML / CSS

## How It Works

```text
simulator.py -> FastAPI backend -> frontend dashboard -> Mapbox map
```

## Project Structure

```text
T2/
├── server.py
├── simulator.py
├── frontend/
│   └── index.html
├── requirements.txt
├── README.md
└── .gitignore
```

## Setup

```bash
pip install -r requirements.txt
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

Replace this line in `frontend/index.html`:

```js
mapboxgl.accessToken = "your_mapbox_token_here";
```