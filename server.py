from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from datetime import datetime
import uvicorn

app = FastAPI(title="T2 Fleet Telemetry API")

# front to success back
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

latest_telemetry = {}


class TelemetryData(BaseModel):
    truck_id: str
    latitude: float
    longitude: float
    speed: float
    battery_level: int


@app.post("/api/v1/telemetry")
async def receive_telemetry(data: TelemetryData):
    received_at = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    latest_telemetry[data.truck_id] = {
        "truck_id": data.truck_id,
        "latitude": data.latitude,
        "longitude": data.longitude,
        "speed": data.speed,
        "battery_level": data.battery_level,
        "received_at": received_at,
    }

    print(
        f"[{received_at}] Truck {data.truck_id} -> "
        f"Coordinates: {data.latitude}, {data.longitude} | "
        f"Speed: {data.speed} km/h | "
        f"Battery: {data.battery_level}%"
    )

    return {
        "status": "success",
        "message": f"Telemetry for {data.truck_id} received",
    }


# endpoint for the map
@app.get("/api/v1/trucks")
async def get_trucks():
    return list(latest_telemetry.values())


if __name__ == "__main__":
    uvicorn.run(app, host="127.0.0.1", port=8000)