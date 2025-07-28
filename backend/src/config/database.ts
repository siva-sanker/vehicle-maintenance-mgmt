// backend/src/config/database.ts

import 'dotenv/config';
import path from 'path';
import sql, { ConnectionPool, config as SqlConfig } from 'mssql';

let pool: ConnectionPool | undefined = undefined;

// MSSQL connection config (use your .env or hardcode for testing)
const dbConfig: SqlConfig = {
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || 'yourStrong(!)Password',
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_NAME || 'vehicle_management',
  options: {
    encrypt: false, // Set to true if using Azure
    trustServerCertificate: true,
  },
  port: parseInt(process.env.DB_PORT || '1433', 10),
};

// Initialize and create tables if not already present
export const initDatabase = async () => {
  try {
    pool = await sql.connect(dbConfig);
    console.log('Connected to MSSQL database');
    await createTables();
    return pool;
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};

// Get database instance (throws error if not initialized)
export const getDatabase = () => {
  if (!pool) {
    throw new Error('Database not initialized. Call initDatabase() first.');
  }
  return pool;
};

const createTables = async () => {
  const tableSql = `
    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='vehicles' AND xtype='U')
    CREATE TABLE vehicles (
      id NVARCHAR(50) PRIMARY KEY,
      make NVARCHAR(100) NOT NULL,
      model NVARCHAR(100) NOT NULL,
      purchase_date DATE NOT NULL,
      registration_number NVARCHAR(100) UNIQUE NOT NULL,
      purchase_price FLOAT NOT NULL,
      fuel_type NVARCHAR(50) NOT NULL,
      engine_number NVARCHAR(100),
      chassis_number NVARCHAR(100),
      kilometers INT DEFAULT 0,
      color NVARCHAR(50),
      owner NVARCHAR(100),
      phone NVARCHAR(50),
      address NVARCHAR(255),
      status NVARCHAR(50) DEFAULT 'active',
      last_updated DATETIME DEFAULT GETDATE(),
      deleted_at DATETIME NULL,
      created_at DATETIME DEFAULT GETDATE()
    );

    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='drivers' AND xtype='U')
    CREATE TABLE drivers (
      id NVARCHAR(50) PRIMARY KEY,
      name NVARCHAR(100) NOT NULL,
      phone NVARCHAR(50) NOT NULL,
      address NVARCHAR(255),
      license_number NVARCHAR(100),
      status NVARCHAR(50) DEFAULT 'active',
      last_updated DATETIME DEFAULT GETDATE(),
      deleted_at DATETIME NULL,
      created_at DATETIME DEFAULT GETDATE()
    );

    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='maintenance' AND xtype='U')
    CREATE TABLE maintenance (
      id NVARCHAR(50) PRIMARY KEY,
      vehicle_id NVARCHAR(50) NOT NULL,
      description NVARCHAR(255) NOT NULL,
      date DATE NOT NULL,
      cost FLOAT NOT NULL,
      status NVARCHAR(50) DEFAULT 'scheduled',
      last_updated DATETIME DEFAULT GETDATE(),
      created_at DATETIME DEFAULT GETDATE(),
      FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
    );

    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='insurance' AND xtype='U')
    CREATE TABLE insurance (
      id NVARCHAR(50) PRIMARY KEY,
      vehicle_id NVARCHAR(50) NOT NULL,
      policy_number NVARCHAR(100) NOT NULL,
      insurer NVARCHAR(100) NOT NULL,
      policy_type NVARCHAR(100) NOT NULL,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      payment FLOAT NOT NULL,
      issue_date DATE NOT NULL,
      premium_amount FLOAT NOT NULL,
      has_insurance BIT DEFAULT 1,
      created_at DATETIME DEFAULT GETDATE(),
      FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
    );

    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='claims' AND xtype='U')
    CREATE TABLE claims (
      id NVARCHAR(50) PRIMARY KEY,
      vehicle_id NVARCHAR(50) NOT NULL,
      claim_date DATE NOT NULL,
      claim_amount FLOAT NOT NULL,
      reason NVARCHAR(255) NOT NULL,
      status NVARCHAR(50) DEFAULT 'pending',
      created_at DATETIME DEFAULT GETDATE(),
      FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
    );

    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='vehicle_locations' AND xtype='U')
    CREATE TABLE vehicle_locations (
      id NVARCHAR(50) PRIMARY KEY,
      vehicle_id NVARCHAR(50) NOT NULL,
      latitude FLOAT NOT NULL,
      longitude FLOAT NOT NULL,
      timestamp DATETIME DEFAULT GETDATE(),
      address NVARCHAR(255),
      FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE
    );

    -- Indexes
    IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='idx_vehicles_status')
      CREATE INDEX idx_vehicles_status ON vehicles(status);
    IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='idx_vehicles_deleted_at')
      CREATE INDEX idx_vehicles_deleted_at ON vehicles(deleted_at);
    IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='idx_drivers_status')
      CREATE INDEX idx_drivers_status ON drivers(status);
    IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='idx_drivers_deleted_at')
      CREATE INDEX idx_drivers_deleted_at ON drivers(deleted_at);
    IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='idx_maintenance_vehicle_id')
      CREATE INDEX idx_maintenance_vehicle_id ON maintenance(vehicle_id);
    IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='idx_maintenance_date')
      CREATE INDEX idx_maintenance_date ON maintenance(date);
    IF NOT EXISTS (SELECT * FROM sys.indexes WHERE name='idx_maintenance_status')
      CREATE INDEX idx_maintenance_status ON maintenance(status);
  `;

  // Split and run each statement (MSSQL doesn't support multiple CREATEs in one batch)
  for (const statement of tableSql.split(';')) {
    const trimmed = statement.trim();
    if (trimmed) {
      await pool!.request().query(trimmed);
    }
  }
  console.log('Database tables created/verified');
};
