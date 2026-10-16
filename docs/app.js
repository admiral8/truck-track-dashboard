mapboxgl.accessToken = MAPBOX_TOKEN;

const API_URL = "http://127.0.0.1:8000/api/v1/trucks";

const map = new mapboxgl.Map({
	container: "map",
	style: "mapbox://styles/mapbox/dark-v11",

	// Mapbox uses [longitude, latitude], not [latitude, longitude].
	center: [139.6917, 35.6895],
	zoom: 11
});

const markers = {};

function getMarkerColor(status) {
	if (status === "moving") {
		return "#22c55e";
	}

	if (status === "idle") {
		return "#eab308";
	}

	if (status === "low_battery") {
		return "#ef4444";
	}

	return "#6b7280";
}

async function loadTrucks() {
	try {
		const response = await fetch(API_URL);
		const trucks = await response.json();

		const info = document.getElementById("truck-info");

		if (trucks.length === 0) {
			info.innerHTML = "No trucks yet";
			return;
		}

		info.innerHTML = "";

		trucks.forEach((truck) => {
			const lngLat = [truck.longitude, truck.latitude];
			const color = getMarkerColor(truck.status);

			const popupHtml = `
				<b>${truck.truck_id}</b><br>
				Status: ${truck.status}<br>
				Speed: ${truck.speed} km/h<br>
				Battery: ${truck.battery_level}%<br>
				Time: ${truck.received_at}
			`;

			if (!markers[truck.truck_id]) {
				markers[truck.truck_id] = new mapboxgl.Marker({ color: color })
					.setLngLat(lngLat)
					.setPopup(new mapboxgl.Popup().setHTML(popupHtml))
					.addTo(map);
			} else {
				markers[truck.truck_id].setLngLat(lngLat);
			}

			info.innerHTML += `
				<div style="margin-bottom: 12px;">
					<b>${truck.truck_id}</b><br>
					Status: ${truck.status}<br>
					Speed: ${truck.speed} km/h<br>
					Battery: ${truck.battery_level}%<br>
					Latitude: ${truck.latitude}<br>
					Longitude: ${truck.longitude}<br>
					Updated: ${truck.received_at}
				</div>
			`;
		});
	} catch (error) {
		document.getElementById("truck-info").innerHTML = "Cannot connect to API";
	}
}

setInterval(loadTrucks, 3000);
loadTrucks();