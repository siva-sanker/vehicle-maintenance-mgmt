// backend/src/config/database.ts

import 'dotenv/config';
import path from 'path';
import sql, { ConnectionPool, config as SqlConfig } from 'mssql';
import { config } from './env';

let pool: ConnectionPool | undefined = undefined;

// MSSQL connection config
const dbConfig: SqlConfig = {
  user: config.database.user,
  password: config.database.password,
  server: config.database.server,
  database: config.database.database,
  options: config.database.options,
  port: config.database.port,
};

// Initialize and create tables if not already present
export const initDatabase = async () => {
  try {
    console.log('Attempting to connect to database...');
    console.log('Database config:', {
      server: dbConfig.server,
      database: dbConfig.database,
      port: dbConfig.port,
      user: dbConfig.user
    });

    pool = await sql.connect(dbConfig);
    console.log('Connected to MSSQL database successfully');
    await createTables();
    return pool;
  } catch (error) {
    console.error('Database connection failed:', error);
    console.error('Please check your database configuration in src/config/env.ts');
    console.error('Make sure your SQL Server is running and accessible');
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
    -- Drop foreign key constraint if it exists
    IF EXISTS (SELECT * FROM sys.foreign_keys WHERE name = 'FK_assigned_vehicles')
      ALTER TABLE drivers DROP CONSTRAINT FK_assigned_vehicles
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
      created_at DATETIME DEFAULT GETDATE(),
      assigned_vehicles NVARCHAR(MAX) NULL
    );
    
    -- Add assigned_vehicles column if table exists but column doesn't
    IF EXISTS (SELECT * FROM sysobjects WHERE name='drivers' AND xtype='U')
    AND NOT EXISTS (SELECT * FROM syscolumns WHERE id = OBJECT_ID('drivers') AND name = 'assigned_vehicles')
    BEGIN
      ALTER TABLE drivers ADD assigned_vehicles NVARCHAR(MAX) NULL
    END

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

  try {
    // Split and run each statement (MSSQL doesn't support multiple CREATEs in one batch)
    for (const statement of tableSql.split(';')) {
      const trimmed = statement.trim();
      if (trimmed) {
        await pool!.request().query(trimmed);
      }
    }
    console.log('Database tables created/verified successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
    throw error;
  }
};
