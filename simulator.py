import time
import random
import requests

SERVER_URL = "http://127.0.0.1:8000/api/v1/telemetry"

trucks = [
	{
		"truck_id": "T2-TRUCK-001",
		"latitude": 35.6895,
		"longitude": 139.6917,
	},
	{
		"truck_id": "T2-TRUCK-002",
		"latitude": 35.7000,
		"longitude": 139.7500,
	},
	{
		"truck_id": "T2-TRUCK-003",
		"latitude": 35.6700,
		"longitude": 139.7600,
	},
]

print("Simulator started for multiple trucks...")


def get_status(speed, battery_level):
	if battery_level < 75:
		return "low_battery"

	if speed < 45:
		return "idle"

	return "moving"


try:
	while True:
		for truck in trucks:
			# Simulate small movement around the current position.
			truck["latitude"] += random.uniform(-0.0005, 0.0005)
			truck["longitude"] += random.uniform(-0.0005, 0.0005)

			speed = round(random.uniform(30.0, 70.0), 1)
			battery_level = random.randint(70, 95)
			status = get_status(speed, battery_level)

			payload = {
				"truck_id": truck["truck_id"],
				"latitude": round(truck["latitude"], 6),
				"longitude": round(truck["longitude"], 6),
				"speed": speed,
				"battery_level": battery_level,
				"status": status,
			}

			try:
				response = requests.post(SERVER_URL, json=payload)

				if response.status_code == 200:
					print(
						f"Sent {payload['truck_id']}: "
						f"{payload['latitude']}, {payload['longitude']} | "
						f"{payload['status']}"
					)
				else:
					print(f"Server error: {response.status_code}")

			except requests.exceptions.ConnectionError:
				print("Start server.py first")

		time.sleep(3)

except KeyboardInterrupt:
	print("\nSimulator stopped.")