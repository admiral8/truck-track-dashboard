mapboxgl.accessToken = MAPBOX_TOKEN;

const API_URL = "http://127.0.0.1:8000/api/v1/trucks";

const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/dark-v11",
  center: [139.6917, 35.6895],
  zoom: 10,
});

map.addControl(new mapboxgl.NavigationControl(), "top-right");

const markers = {};
let allTrucks = [];

const searchInput = document.getElementById("truck-search");
const statusFilter = document.getElementById("status-filter");
const tableBody = document.getElementById("truck-info");

function getMarkerColor(status) {
  const colors = {
    moving: "#22c55e",
    idle: "#eab308",
    low_battery: "#ef4444",
  };

  return colors[status] || "#6b7280";
}

function getStatusLabel(status) {
  const labels = {
    moving: "Moving",
    idle: "Idle",
    low_battery: "Low Battery",
  };

  return labels[status] || status;
}

function escapeHTML(value) {
  return String(value ?? "").replace(
    /[&<>"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[char],
  );
}

function formatNumber(value, digits = 2) {
  const number = Number(value);
  return Number.isFinite(number) ? number.toFixed(digits) : "—";
}

function renderTrucks() {
  const query = searchInput.value.trim().toLowerCase();
  const filter = statusFilter.value;

  const filtered = allTrucks.filter((truck) => {
    const matchesSearch = String(truck.truck_id).toLowerCase().includes(query);

    const matchesStatus = filter === "all" || truck.status === filter;

    return matchesSearch && matchesStatus;
  });

  if (filtered.length === 0) {
    tableBody.innerHTML = `
            <tr>
                <td colspan="7" class="empty-state">
                    No matching trucks found
                </td>
            </tr>
        `;
    return;
  }

  tableBody.innerHTML = filtered
    .map((truck) => {
      const status = escapeHTML(truck.status);
      const label = escapeHTML(getStatusLabel(truck.status));
      const id = escapeHTML(truck.truck_id);
      const receivedAt = escapeHTML(truck.received_at ?? "—");

      return `
            <tr>
                <td class="truck-id">${id}</td>
                <td>
                    <span class="status-badge" data-status="${status}">
                        <span class="status-dot"></span>
                        ${label}
                    </span>
                </td>
                <td>${formatNumber(truck.speed, 1)} km/h</td>
                <td>${formatNumber(truck.battery_level, 0)}%</td>
                <td>${formatNumber(truck.latitude, 6)}</td>
                <td>${formatNumber(truck.longitude, 6)}</td>
                <td>${receivedAt}</td>
            </tr>
        `;
    })
    .join("");
}

function updateMarkers(trucks) {
  const currentIds = new Set();

  trucks.forEach((truck) => {
    const id = String(truck.truck_id);
    const longitude = Number(truck.longitude);
    const latitude = Number(truck.latitude);

    if (!Number.isFinite(longitude) || !Number.isFinite(latitude)) {
      return;
    }

    currentIds.add(id);

    const lngLat = [longitude, latitude];
    const color = getMarkerColor(truck.status);

    const popupHTML = `
            <div class="truck-popup">
                <strong>${escapeHTML(id)}</strong>
                <p>Status: ${escapeHTML(getStatusLabel(truck.status))}</p>
                <p>Speed: ${formatNumber(truck.speed, 1)} km/h</p>
                <p>Battery: ${formatNumber(truck.battery_level, 0)}%</p>
                <p>Updated: ${escapeHTML(truck.received_at ?? "—")}</p>
            </div>
        `;

    if (!markers[id]) {
      markers[id] = new mapboxgl.Marker({ color })
        .setLngLat(lngLat)
        .setPopup(new mapboxgl.Popup({ offset: 20 }).setHTML(popupHTML))
        .addTo(map);
    } else {
      const marker = markers[id];

      marker.setLngLat(lngLat);
      marker.getPopup().setHTML(popupHTML);

      if (marker.currentColor !== color) {
        marker
          .getElement()
          .querySelectorAll("svg path")
          .forEach((path) => {
            if (path.getAttribute("fill") && path.getAttribute("fill") !== "none") {
              path.setAttribute("fill", color);
            }
          });
      }
    }

    markers[id].currentColor = color;
  });

  Object.keys(markers).forEach((id) => {
    if (!currentIds.has(id)) {
      markers[id].remove();
      delete markers[id];
    }
  });
}

async function loadTrucks() {
  try {
    const response = await fetch(API_URL, {
      cache: "no-store",
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }

    const trucks = await response.json();

    if (!Array.isArray(trucks)) {
      throw new Error("Unexpected API response");
    }

    allTrucks = trucks;

    updateMarkers(allTrucks);
    renderTrucks();
  } catch (error) {
    console.error("Failed to load trucks:", error);

    if (allTrucks.length === 0) {
      tableBody.innerHTML = `
                <tr>
                    <td colspan="7" class="empty-state">
                        Cannot connect to API
                    </td>
                </tr>
            `;
    }
  }
}

searchInput.addEventListener("input", renderTrucks);
statusFilter.addEventListener("change", renderTrucks);

loadTrucks();
setInterval(loadTrucks, 3000);
