// scripts/migrate.ts
import fs from 'fs';
import path from 'path';
import { pool } from '../config/database';

const migrationSQL = fs.readFileSync(
  path.join(__dirname, '../sql/schema.sql'), 
  'utf-8'
);

async function runMigration() {
  try {
    console.log('Running database migration...');
    
    // Split SQL statements by semicolon and execute each one
    const statements = migrationSQL
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0);
    
    for (const statement of statements) {
      if (statement.trim()) {
        await pool.execute(statement);
        console.log('Executed:', statement.substring(0, 50) + '...');
      }
    }
    
    console.log('Migration completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();