// backend/src/config/database.ts

import 'dotenv/config';
import path from 'path';
import { Database, open } from 'sqlite';
import sqlite3 from 'sqlite3';

const dbPath = path.join(__dirname, '../data/vehicle_management.sqlite3');

let db: Database | undefined = undefined;

// Initialize and create tables if not already present
export const initDatabase = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });
    console.log('Connected to SQLite database');
    await createTables();
    return db;
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};

// Get database instance (throws error if not initialized)
export const getDatabase = () => {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return db;
};

const createTables = async () => {
  const sql = `
    -- Vehicles table
    CREATE TABLE IF NOT EXISTS vehicles (
      id TEXT PRIMARY KEY,
      make TEXT NOT NULL,
      model TEXT NOT NULL,
      purchase_date TEXT NOT NULL,
      registration_number TEXT UNIQUE NOT NULL,
      purchase_price REAL NOT NULL,
      fuel_type TEXT NOT NULL,
      engine_number TEXT,
      chassis_number TEXT,
      kilometers INTEGER DEFAULT 0,
      color TEXT,
      owner TEXT,
      phone TEXT,
      address TEXT,
      status TEXT DEFAULT 'active',
      last_updated TEXT DEFAULT CURRENT_TIMESTAMP,
      deleted_at TEXT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Drivers table
    CREATE TABLE IF NOT EXISTS drivers (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      address TEXT,
      license_number TEXT,
      status TEXT DEFAULT 'active',
      last_updated TEXT DEFAULT CURRENT_TIMESTAMP,
      deleted_at TEXT NULL,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );

    -- Maintenance table
    CREATE TABLE IF NOT EXISTS maintenance (
      id TEXT PRIMARY KEY,
      vehicle_id TEXT NOT NULL,
      description TEXT NOT NULL,
      date TEXT NOT NULL,
      cost REAL NOT NULL,
      status TEXT DEFAULT 'scheduled',
      last_updated TEXT DEFAULT CURRENT_TIMESTAMP,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
    );

    -- Insurance table
    CREATE TABLE IF NOT EXISTS insurance (
      id TEXT PRIMARY KEY,
      vehicle_id TEXT NOT NULL,
      policy_number TEXT NOT NULL,
      insurer TEXT NOT NULL,
      policy_type TEXT NOT NULL,
      start_date TEXT NOT NULL,
      end_date TEXT NOT NULL,
      payment REAL NOT NULL,
      issue_date TEXT NOT NULL,
      premium_amount REAL NOT NULL,
      has_insurance INTEGER DEFAULT 1,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
    );

    -- Claims table
    CREATE TABLE IF NOT EXISTS claims (
      id TEXT PRIMARY KEY,
      vehicle_id TEXT NOT NULL,
      claim_date TEXT NOT NULL,
      claim_amount REAL NOT NULL,
      reason TEXT NOT NULL,
      status TEXT DEFAULT 'pending',
      created_at TEXT DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
    );

    -- Vehicle locations table
    CREATE TABLE IF NOT EXISTS vehicle_locations (
      id TEXT PRIMARY KEY,
      vehicle_id TEXT NOT NULL,
      latitude REAL NOT NULL,
      longitude REAL NOT NULL,
      timestamp TEXT DEFAULT CURRENT_TIMESTAMP,
      address TEXT,
      FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
    );

    -- Indexes
    CREATE INDEX IF NOT EXISTS idx_vehicles_status ON vehicles(status);
    CREATE INDEX IF NOT EXISTS idx_vehicles_deleted_at ON vehicles(deleted_at);
    CREATE INDEX IF NOT EXISTS idx_drivers_status ON drivers(status);
    CREATE INDEX IF NOT EXISTS idx_drivers_deleted_at ON drivers(deleted_at);
    CREATE INDEX IF NOT EXISTS idx_maintenance_vehicle_id ON maintenance(vehicle_id);
    CREATE INDEX IF NOT EXISTS idx_maintenance_date ON maintenance(date);
    CREATE INDEX IF NOT EXISTS idx_maintenance_status ON maintenance(status);
  `;
  await db!.exec(sql);
  console.log('Database tables created/verified');
};
