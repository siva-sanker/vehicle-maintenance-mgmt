import { initDatabase, getDatabase } from './src/config/database';

async function testDatabaseConnection() {
    try {
        console.log('🧪 Testing database connection...');

        // Initialize database
        await initDatabase();
        console.log('✅ Database initialized successfully');

        // Test basic query
        const pool = getDatabase();
        const result = await pool.request().query('SELECT 1 as test');
        console.log('✅ Database query test passed:', result.recordset[0]);

        // Test vehicles table
        const vehiclesResult = await pool.request().query('SELECT COUNT(*) as count FROM vehicles');
        console.log('✅ Vehicles table accessible:', vehiclesResult.recordset[0]);

        // Test drivers table
        const driversResult = await pool.request().query('SELECT COUNT(*) as count FROM drivers');
        console.log('✅ Drivers table accessible:', driversResult.recordset[0]);

        // Test maintenance table
        const maintenanceResult = await pool.request().query('SELECT COUNT(*) as count FROM maintenance');
        console.log('✅ Maintenance table accessible:', maintenanceResult.recordset[0]);

        console.log('🎉 All database tests passed!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Database test failed:', error);
        process.exit(1);
    }
}

testDatabaseConnection(); 