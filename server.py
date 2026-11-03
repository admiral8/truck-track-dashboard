from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from datetime import datetime
from typing import Literal
import uvicorn


from database import get_connection

app = FastAPI(title="Truck Telemetry API")

@app.get("/health")
def health_check():
    return {"status": "ok"}

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Only here
latest_telemetry = {}


class TelemetryData(BaseModel):
    truck_id: str = Field(min_length=1)
    latitude: float = Field(ge=-90, le=90)
    longitude: float = Field(ge=-180, le=180)
    speed: float = Field(ge=0, le=200)
    battery_level: int = Field(ge=0, le=100)
    status: Literal["low_battery", "idle", "moving"]


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


# Endpoint
@app.get("/api/v1/trucks")
async def get_trucks():
    return list(latest_telemetry.values())


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)