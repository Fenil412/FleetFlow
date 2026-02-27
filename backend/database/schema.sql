-- FleetFlow: Modular Fleet & Logistics Management System
-- Database Schema (PostgreSQL 14+)
-- Designed for High Availability, Real-time Updates, and Analytics

-- Extensions (if needed)
-- CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

--------------------------------------------------------------------------------
-- 1. RBAC MODULE
--------------------------------------------------------------------------------

-- Roles Table
CREATE TABLE IF NOT EXISTS roles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Initial Roles
INSERT INTO roles (name, description) VALUES 
('ADMIN', 'Full system access'),
('DISPATCHER', 'Manage trips and drivers'),
('MECHANIC', 'Manage vehicle maintenance'),
('VIEWER', 'Read-only access to analytics');

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    role_id BIGINT REFERENCES roles(id) ON DELETE SET NULL,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_login_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_role_id ON users(role_id);
CREATE INDEX idx_users_email ON users(email);

--------------------------------------------------------------------------------
-- 2. VEHICLE MODULE
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS vehicles (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    model VARCHAR(100),
    license_plate VARCHAR(20) UNIQUE NOT NULL,
    vehicle_type VARCHAR(20) NOT NULL, -- Truck, Van, Bike
    max_capacity_kg NUMERIC(10, 2) NOT NULL,
    odometer_km NUMERIC(15, 2) DEFAULT 0,
    acquisition_cost NUMERIC(15, 2),
    status VARCHAR(20) DEFAULT 'AVAILABLE',
    is_retired BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT check_vehicle_type CHECK (vehicle_type IN ('Truck', 'Van', 'Bike')),
    CONSTRAINT check_vehicle_status CHECK (status IN ('AVAILABLE', 'ON_TRIP', 'IN_SHOP', 'OUT_OF_SERVICE'))
);

CREATE INDEX idx_vehicles_status ON vehicles(status);
CREATE INDEX idx_vehicles_type ON vehicles(vehicle_type);
CREATE INDEX idx_vehicles_plate ON vehicles(license_plate);

--------------------------------------------------------------------------------
-- 3. DRIVER MODULE
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS drivers (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    license_number VARCHAR(50) UNIQUE NOT NULL,
    license_expiry DATE NOT NULL,
    phone VARCHAR(20),
    safety_score NUMERIC(3, 2) DEFAULT 5.00,
    status VARCHAR(20) DEFAULT 'OFF_DUTY',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT check_driver_status CHECK (status IN ('ON_DUTY', 'OFF_DUTY', 'ON_TRIP', 'SUSPENDED')),
    CONSTRAINT check_safety_score CHECK (safety_score >= 0 AND safety_score <= 5)
);

CREATE INDEX idx_drivers_status ON drivers(status);
CREATE INDEX idx_drivers_expiry ON drivers(license_expiry);

--------------------------------------------------------------------------------
-- 4. TRIP MODULE (HIGH VOLUME)
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS trips (
    id BIGSERIAL PRIMARY KEY,
    vehicle_id BIGINT NOT NULL REFERENCES vehicles(id) ON DELETE RESTRICT,
    driver_id BIGINT NOT NULL REFERENCES drivers(id) ON DELETE RESTRICT,
    cargo_weight_kg NUMERIC(10, 2) NOT NULL,
    origin TEXT NOT NULL,
    destination TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'DRAFT',
    start_time TIMESTAMPTZ,
    end_time TIMESTAMPTZ,
    start_odometer NUMERIC(15, 2),
    end_odometer NUMERIC(15, 2),
    revenue NUMERIC(15, 2) DEFAULT 0,
    created_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT check_trip_status CHECK (status IN ('DRAFT', 'DISPATCHED', 'COMPLETED', 'CANCELLED'))
);

-- Optimized indexes for dashboard and history
CREATE INDEX idx_trips_status ON trips(status);
CREATE INDEX idx_trips_vehicle_date ON trips(vehicle_id, created_at DESC);
CREATE INDEX idx_trips_driver_date ON trips(driver_id, created_at DESC);
CREATE INDEX idx_trips_created_at_range ON trips(created_at DESC);

-- NOTE: Cargo capacity validation is handled in the Node.js backend logic.

--------------------------------------------------------------------------------
-- 5. MAINTENANCE MODULE
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS maintenance_logs (
    id BIGSERIAL PRIMARY KEY,
    vehicle_id BIGINT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    service_type VARCHAR(100) NOT NULL,
    description TEXT,
    cost NUMERIC(15, 2) NOT NULL,
    service_date DATE NOT NULL,
    next_service_due DATE,
    created_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_maintenance_vehicle_date ON maintenance_logs(vehicle_id, service_date DESC);

-- NOTE: Backend will auto-switch vehicle status to 'IN_SHOP' during maintenance.

--------------------------------------------------------------------------------
-- 6. FUEL MODULE
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS fuel_logs (
    id BIGSERIAL PRIMARY KEY,
    vehicle_id BIGINT NOT NULL REFERENCES vehicles(id) ON DELETE CASCADE,
    trip_id BIGINT REFERENCES trips(id) ON DELETE SET NULL,
    liters NUMERIC(10, 2) NOT NULL,
    cost NUMERIC(15, 2) NOT NULL,
    fuel_date TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    odometer_km NUMERIC(15, 2),
    created_by BIGINT REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_fuel_vehicle_date ON fuel_logs(vehicle_id, fuel_date DESC);
CREATE INDEX idx_fuel_trip ON fuel_logs(trip_id);

--------------------------------------------------------------------------------
-- 7. DRIVER PERFORMANCE MODULE
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS driver_performance (
    id BIGSERIAL PRIMARY KEY,
    driver_id BIGINT NOT NULL REFERENCES drivers(id) ON DELETE CASCADE,
    trip_id BIGINT REFERENCES trips(id) ON DELETE CASCADE,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    incidents INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_perf_driver ON driver_performance(driver_id);

--------------------------------------------------------------------------------
-- 8. AUDIT LOGS
--------------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS audit_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id BIGINT REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id BIGINT NOT NULL,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_user_entity ON audit_logs(user_id, entity_type);
CREATE INDEX idx_audit_created_at ON audit_logs(created_at DESC);

--------------------------------------------------------------------------------
-- 9. ANALYTICS VIEW
--------------------------------------------------------------------------------

-- Materialized-ready Operational Cost View
CREATE OR REPLACE VIEW vehicle_operational_cost AS
WITH fuel_totals AS (
    SELECT vehicle_id, SUM(cost) as total_fuel_cost
    FROM fuel_logs
    GROUP BY vehicle_id
),
maint_totals AS (
    SELECT vehicle_id, SUM(cost) as total_maint_cost
    FROM maintenance_logs
    GROUP BY vehicle_id
)
SELECT 
    v.id,
    v.name,
    v.license_plate,
    COALESCE(f.total_fuel_cost, 0) as total_fuel_cost,
    COALESCE(m.total_maint_cost, 0) as total_maint_cost,
    (COALESCE(f.total_fuel_cost, 0) + COALESCE(m.total_maint_cost, 0)) as total_operational_cost
FROM vehicles v
LEFT JOIN fuel_totals f ON v.id = f.vehicle_id
LEFT JOIN maint_totals m ON v.id = m.vehicle_id;

--------------------------------------------------------------------------------
-- Trigger for automatic updated_at (Requires a function)
--------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_modtime BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_vehicles_modtime BEFORE UPDATE ON vehicles FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_drivers_modtime BEFORE UPDATE ON drivers FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
CREATE TRIGGER update_trips_modtime BEFORE UPDATE ON trips FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
