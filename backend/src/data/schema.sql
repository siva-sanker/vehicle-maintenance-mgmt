-- Create database schema for vehicle management system

CREATE DATABASE IF NOT EXISTS vehicle_management;
USE vehicle_management;

-- Vehicles table
CREATE TABLE vehicles (
    id VARCHAR(36) PRIMARY KEY,
    make VARCHAR(100) NOT NULL,
    model VARCHAR(100) NOT NULL,
    purchase_date DATE NOT NULL,
    registration_number VARCHAR(50) UNIQUE NOT NULL,
    purchase_price DECIMAL(10,2) NOT NULL,
    fuel_type VARCHAR(50) NOT NULL,
    engine_number VARCHAR(100),
    chassis_number VARCHAR(100),
    kilometers INT DEFAULT 0,
    color VARCHAR(50),
    owner VARCHAR(100),
    phone VARCHAR(20),
    address TEXT,
    status VARCHAR(50) DEFAULT 'active',
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Drivers table
CREATE TABLE drivers (
    id VARCHAR(36) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT,
    license_number VARCHAR(50),
    status VARCHAR(50) DEFAULT 'active',
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Maintenance table
CREATE TABLE maintenance (
    id VARCHAR(36) PRIMARY KEY,
    vehicle_id VARCHAR(36) NOT NULL,
    description TEXT NOT NULL,
    date DATE NOT NULL,
    cost DECIMAL(10,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'scheduled',
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);

-- Insurance table
CREATE TABLE insurance (
    id VARCHAR(36) PRIMARY KEY,
    vehicle_id VARCHAR(36) NOT NULL,
    policy_number VARCHAR(100) NOT NULL,
    insurer VARCHAR(100) NOT NULL,
    policy_type VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    payment DECIMAL(10,2) NOT NULL,
    issue_date DATE NOT NULL,
    premium_amount DECIMAL(10,2) NOT NULL,
    has_insurance BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);

-- Claims table
CREATE TABLE claims (
    id VARCHAR(36) PRIMARY KEY,
    vehicle_id VARCHAR(36) NOT NULL,
    claim_date DATE NOT NULL,
    claim_amount DECIMAL(10,2) NOT NULL,
    reason TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);

-- Vehicle locations table
CREATE TABLE vehicle_locations (
    id VARCHAR(36) PRIMARY KEY,
    vehicle_id VARCHAR(36) NOT NULL,
    latitude DECIMAL(10,8) NOT NULL,
    longitude DECIMAL(11,8) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    address TEXT,
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
);

-- Indexes for better performance
CREATE INDEX idx_vehicles_status ON vehicles(status);
CREATE INDEX idx_vehicles_deleted_at ON vehicles(deleted_at);
CREATE INDEX idx_drivers_status ON drivers(status);
CREATE INDEX idx_drivers_deleted_at ON drivers(deleted_at);
CREATE INDEX idx_maintenance_vehicle_id ON maintenance(vehicle_id);
CREATE INDEX idx_maintenance_date ON maintenance(date);
CREATE INDEX idx_maintenance_status ON maintenance(status);