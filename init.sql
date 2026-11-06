CREATE TABLE IF NOT EXISTS telemetry_logs (
    id SERIAL PRIMARY KEY,
    truck_id VARCHAR(50) NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    speed DOUBLE PRECISION NOT NULL,
    battery_level INTEGER NOT NULL,
    status VARCHAR(50) NOT NULL,
    received_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_telemetry_truck_time ON telemetry_logs (truck_id, received_at DESC);

CREATE TABLE IF NOT EXISTS trucks_latest (
    truck_id VARCHAR(50) PRIMARY KEY,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    speed DOUBLE PRECISION NOT NULL,
    battery_level INTEGER NOT NULL,
    status VARCHAR(50) NOT NULL,
    received_at TIMESTAMPTZ NOT NULL
);
