import time
import random
import requests

SERVER_URL = "http://127.0.0.1:8000/api/v1/telemetry"
TRUCK_ID = "T2-TRUCK-001"

current_lat = 35.6895
current_lng = 139.6917

print(f"Simulator started for {TRUCK_ID}...")

try:
    while True:
        current_lat += random.uniform(-0.0005, 0.0005)
        current_lng += random.uniform(-0.0005, 0.0005)

        payload = {
            "truck_id": TRUCK_ID,
            "latitude": round(current_lat, 6),
            "longitude": round(current_lng, 6),
            "speed": round(random.uniform(40.0, 70.0), 1),
            "battery_level": random.randint(70, 95),
        }

        try:
            response = requests.post(SERVER_URL, json=payload)

            if response.status_code == 200:
                print(
                    f"Sent: {payload['latitude']}, "
                    f"{payload['longitude']}"
                )
            else:
                print(f"Server error: {response.status_code}")

        except requests.exceptions.ConnectionError:
            print("Start server.py first")

        time.sleep(3)

except KeyboardInterrupt:
    print("\nSimulator stopped.")