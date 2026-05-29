//Get Mapbox token from local config.js
mapboxgl.accessToken = MAPBOX_TOKEN;

const API_URL = "http://127.0.0.1:8000/api/v1/trucks";

const map = new mapboxgl.Map({
	container: "map",
	style: "mapbox://styles/mapbox/dark-v11",

	//Mapbox uses longitude, latitude order
	center: [139.6917, 35.6895],
	zoom: 12
});

const markers = {};

async function loadTrucks() {
	try {
		const response = await fetch(API_URL);
		const trucks = await response.json();

		const info = document.getElementById("truck-info");

		if (trucks.length === 0) {
			info.innerHTML = "No trucks yet";
			return;
		}

		trucks.forEach((truck) => {
			const lngLat = [truck.longitude, truck.latitude];

			const popupHtml = `
				<b>${truck.truck_id}</b><br>
				Speed: ${truck.speed} km/h<br>
				Battery: ${truck.battery_level}%<br>
				Time: ${truck.received_at}
			`;

			if (!markers[truck.truck_id]) {
				markers[truck.truck_id] = new mapboxgl.Marker()
					.setLngLat(lngLat)
					.setPopup(new mapboxgl.Popup().setHTML(popupHtml))
					.addTo(map);
			} else {
				markers[truck.truck_id].setLngLat(lngLat);
			}

			info.innerHTML = `
				<b>${truck.truck_id}</b><br>
				Speed: ${truck.speed} km/h<br>
				Battery: ${truck.battery_level}%<br>
				Latitude: ${truck.latitude}<br>
				Longitude: ${truck.longitude}<br>
				Updated: ${truck.received_at}
			`;
		});
	} catch (error) {
		document.getElementById("truck-info").innerHTML = "Cannot connect to API";
	}
}

setInterval(loadTrucks, 3000);
loadTrucks();