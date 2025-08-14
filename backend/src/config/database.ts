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

    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='vehicles' AND xtype='U')
    CREATE TABLE vehicles (
    v_id_pk BIGINT PRIMARY KEY,
    v_make NVARCHAR(100) NOT NULL,
    v_model NVARCHAR(100) NOT NULL,
    v_purchase_date DATE NOT NULL,
    v_registration_number NVARCHAR(100) UNIQUE NOT NULL,
    v_purchase_price FLOAT NOT NULL,
    v_fuel_type NVARCHAR(50) NOT NULL,
    v_engine_number NVARCHAR(100),
    v_chassis_number NVARCHAR(100),
    v_kilometers INT DEFAULT 0,
    v_color NVARCHAR(50),
    v_owner NVARCHAR(100),
    v_phone NVARCHAR(50),
    v_address NVARCHAR(255),
    v_status NVARCHAR(50) DEFAULT 'active',
    v_deleted_at DATETIME NULL,
    v_created_at DATETIME DEFAULT GETDATE(),
    v_modified_by_fk BIGINT,
    v_modified_on DATETIME DEFAULT GETDATE(),
    v_provider_id_fk BIGINT,
    v_outlet_fk BIGINT
    );

    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='vehicle_drivers' AND xtype='U')
    CREATE TABLE vehicle_drivers (
        vd_id_pk BIGINT PRIMARY KEY,
        vd_license_number NVARCHAR(100),
        vd_status NVARCHAR(50) DEFAULT 'active',
        vd_deleted_at DATETIME NULL,
        vd_created_at DATETIME DEFAULT GETDATE(),
        vd_assigned_vehicles NVARCHAR(MAX) NULL,
        vd_modified_by_fk BIGINT NULL,
        vd_modified_on DATETIME DEFAULT GETDATE(),
        vd_provider_id_fk BIGINT NULL,
        vd_outlet_fk BIGINT NULL,
        FOREIGN KEY (vd_id_pk) REFERENCES EMP_Physician_Master(em_employeeid_pk) ON DELETE CASCADE
      );
    

    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='vehicle_maintenance' AND xtype='U')
    CREATE TABLE vehicle_maintenance (
    vm_id_pk BIGINT PRIMARY KEY,
    vm_vehicle_id_fk BIGINT NOT NULL,
    vm_description NVARCHAR(255) NOT NULL,
    vm_date DATE NOT NULL,
    vm_odo_before varchar(30),
    vm_odo_after varchar(30),
    vm_cost FLOAT NOT NULL,
    vm_status NVARCHAR(50) DEFAULT 'scheduled',
    vm_created_at DATETIME DEFAULT GETDATE(),
    vm_modified_by_fk BIGINT,
    vm_modified_on DATETIME DEFAULT GETDATE(),
    vm_provider_id_fk BIGINT,
    vm_outlet_fk BIGINT,
    FOREIGN KEY (vm_vehicle_id_fk) REFERENCES vehicles(v_id_pk) ON DELETE CASCADE
  );

    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='vehicle_insurance' AND xtype='U')
    CREATE TABLE vehicle_insurance (
    vi_id BIGINT PRIMARY KEY,
    vi_vehicle_id BIGINT NOT NULL,
    vi_policy_number NVARCHAR(100) NOT NULL,
    vi_insurer NVARCHAR(100) NOT NULL,
    vi_policy_type NVARCHAR(100) NOT NULL,
    vi_start_date DATE NOT NULL,
    vi_end_date DATE NOT NULL,
    vi_payment FLOAT NOT NULL,
    vi_issue_date DATE NOT NULL,
    vi_premium_amount FLOAT NOT NULL,
    vi_has_insurance BIT DEFAULT 1,
    vi_created_at DATETIME DEFAULT GETDATE(),
    vi_modified_by_fk BIGINT,
    vi_modified_on DATETIME DEFAULT GETDATE(),
    vi_provider_id_fk BIGINT,
    vi_outlet_fk BIGINT,
    FOREIGN KEY (vi_vehicle_id) REFERENCES vehicles(v_id_pk) ON DELETE CASCADE
  );

    IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='vehicle_claims' AND xtype='U')
    CREATE TABLE vehicle_claims (
    vc_id_pk BIGINT PRIMARY KEY,
    vc_vehicle_id_fk BIGINT NOT NULL,
    vc_claim_date DATE NOT NULL,
    vc_claim_amount FLOAT NOT NULL,
    vc_reason NVARCHAR(255) NOT NULL,
    vc_status NVARCHAR(50) DEFAULT 'pending',
    vc_created_at DATETIME DEFAULT GETDATE(),
    vc_modified_by_fk BIGINT,
    vc_modified_on DATETIME DEFAULT GETDATE(),
    vc_provider_id_fk BIGINT,
    vc_outlet_fk BIGINT,
    FOREIGN KEY (vc_vehicle_id_fk) REFERENCES vehicles(v_id_pk) ON DELETE CASCADE
  ); `;

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