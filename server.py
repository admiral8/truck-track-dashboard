from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
import uvicorn

from database import get_connection

app = FastAPI(title="T2 Fleet Telemetry API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Temporary in-memory storage. Data is lost when the server restarts.
latest_telemetry = {}


class TelemetryData(BaseModel):
    truck_id: str
    latitude: float
    longitude: float
    speed: float
    battery_level: int
    status: str


def save_telemetry_to_db(data: TelemetryData, received_at: str):
    conn = get_connection()
    cursor = conn.cursor()

    cursor.execute(
        """
        INSERT INTO telemetry_logs (
            truck_id,
            latitude,
            longitude,
            speed,
            battery_level,
            status,
            received_at
        )
        VALUES (%s, %s, %s, %s, %s, %s, %s)
        """,
        (
            data.truck_id,
            data.latitude,
            data.longitude,
            data.speed,
            data.battery_level,
            data.status,
            received_at,
        ),
    )

    conn.commit()
    cursor.close()
    conn.close()


@app.post("/api/v1/telemetry")
async def receive_telemetry(data: TelemetryData):
    received_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    latest_telemetry[data.truck_id] = {
        "truck_id": data.truck_id,
        "latitude": data.latitude,
        "longitude": data.longitude,
        "speed": data.speed,
        "battery_level": data.battery_level,
        "status": data.status,
        "received_at": received_at,
    }

    save_telemetry_to_db(data, received_at)

    print(
        f"[{received_at}] Truck {data.truck_id} -> "
        f"Coordinates: {data.latitude}, {data.longitude} | "
        f"Speed: {data.speed} km/h | "
        f"Battery: {data.battery_level}% | "
        f"Status: {data.status}"
    )

    return {
        "status": "success",
        "message": f"Telemetry for {data.truck_id} received",
    }


# Endpoint used by the dashboard to fetch latest truck data.
@app.get("/api/v1/trucks")
async def get_trucks():
    return list(latest_telemetry.values())


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)