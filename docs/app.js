mapboxgl.accessToken = MAPBOX_TOKEN;

const API_URL = "http://127.0.0.1:8000/api/v1/trucks";

const map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/satellite-streets-v12",
  center: [139.6917, 35.6895],
  zoom: 15.5,
  pitch: 65,
  bearing: -25,
  antialias: true,
});

map.on("style.load", () => {
  if (!map.getSource("composite")) return;

  const layers = map.getStyle().layers;
  const labelLayer = layers.find((layer) => layer.type === "symbol" && layer.layout?.["text-field"]);

  if (!map.getLayer("3d-buildings")) {
    map.addLayer(
      {
        id: "3d-buildings",
        source: "composite",
        "source-layer": "building",
        filter: ["==", "extrude", "true"],
        type: "fill-extrusion",
        minzoom: 15,
        paint: {
          "fill-extrusion-color": "#d9d5ca",
          "fill-extrusion-height": ["interpolate", ["linear"], ["zoom"], 15, 0, 15.5, ["get", "height"]],
          "fill-extrusion-base": ["interpolate", ["linear"], ["zoom"], 15, 0, 15.5, ["get", "min_height"]],
          "fill-extrusion-opacity": 0.85,
        },
      },
      labelLayer?.id,
    );
  }
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
    offline: "#6b7280",
  };

  return colors[status] || "#6b7280";
}

function getStatusLabel(status) {
  const labels = {
    moving: "Moving",
    idle: "Idle",
    low_battery: "Low Battery",
    offline: "Offline",
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

function formatTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString("ja-JP", { timeZone: "Asia/Tokyo" });
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
      const receivedAt = escapeHTML(formatTime(truck.received_at));

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
                <p>Updated: ${escapeHTML(formatTime(truck.received_at))}</p>
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
// ===== Demo mode (when API is not reachable, e.g. on GitHub Pages) =====
const DEMO_CENTER = [139.6917, 35.6895]; // same as map center
const DEMO_COUNT = 30;
const DEMO_STATUSES = ["moving", "moving", "idle", "low_battery"];

let demoTrucks = [];

function makeDemoTruck(i) {
  return {
    truck_id: `DEMO-${String(i).padStart(3, "0")}`,
    latitude: DEMO_CENTER[1] + Math.random() * 0.02 - 0.01,
    longitude: DEMO_CENTER[0] + Math.random() * 0.02 - 0.01,
    speed: Math.random() * 80,
    battery_level: Math.round(20 + Math.random() * (100 - 20)),
    status: DEMO_STATUSES[Math.floor(Math.random() * DEMO_STATUSES.length)],
    received_at: new Date().toISOString(),
  };
}

function getDemoTrucks() {
  if (demoTrucks.length === 0) {
    for (let i = 1; i <= DEMO_COUNT; i++) {
      demoTrucks.push(makeDemoTruck(i));
    }
  }

  // moving trucks drive a little every update
  demoTrucks.forEach((truck) => {
    if (truck.status === "moving") {
      truck.latitude += Math.random() * 0.0006 - 0.0003;
      truck.longitude += Math.random() * 0.0006 - 0.0003;
    }
    truck.received_at = new Date().toISOString();
  });

  return demoTrucks;
}

function showDemoBadge() {
  if (document.getElementById("demo-badge")) return;

  const badge = document.createElement("div");
  badge.id = "demo-badge";
  badge.textContent = "Demo mode — API offline, showing simulated trucks";
  badge.style.cssText =
    "position:fixed;bottom:16px;left:16px;z-index:1000;padding:8px 12px;" +
    "background:rgba(234,179,8,0.95);color:#111;font:600 13px sans-serif;border-radius:8px;";
  document.body.appendChild(badge);
}

function hideDemoBadge() {
  document.getElementById("demo-badge")?.remove();
}

// ===== Load trucks =====
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

    hideDemoBadge();
    allTrucks = trucks;
    updateMarkers(allTrucks);
    renderTrucks();
  } catch (error) {
    console.warn("API unavailable, using demo data:", error.message);

    showDemoBadge();
    allTrucks = getDemoTrucks();
    updateMarkers(allTrucks);
    renderTrucks();
  }
}

searchInput.addEventListener("input", renderTrucks);
statusFilter.addEventListener("change", renderTrucks);

loadTrucks();
setInterval(loadTrucks, 3000);
