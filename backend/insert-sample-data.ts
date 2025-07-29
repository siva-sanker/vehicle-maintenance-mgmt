import { initDatabase, getDatabase } from './src/config/database';

const sampleData = {
    vehicles: [
        {
            id: 'V001',
            make: 'Toyota',
            model: 'Camry',
            purchase_date: '2022-01-15',
            registration_number: 'ABC123',
            purchase_price: 25000.00,
            fuel_type: 'Petrol',
            engine_number: 'ENG001',
            chassis_number: 'CHS001',
            kilometers: 15000,
            color: 'White',
            owner: 'John Smith',
            phone: '+1234567890',
            address: '123 Main St, City',
            status: 'active'
        },
        {
            id: 'V002',
            make: 'Honda',
            model: 'Civic',
            purchase_date: '2021-06-20',
            registration_number: 'XYZ789',
            purchase_price: 22000.00,
            fuel_type: 'Petrol',
            engine_number: 'ENG002',
            chassis_number: 'CHS002',
            kilometers: 25000,
            color: 'Blue',
            owner: 'Sarah Johnson',
            phone: '+1234567891',
            address: '456 Oak Ave, Town',
            status: 'active'
        },
        {
            id: 'V003',
            make: 'Ford',
            model: 'F-150',
            purchase_date: '2020-03-10',
            registration_number: 'DEF456',
            purchase_price: 35000.00,
            fuel_type: 'Diesel',
            engine_number: 'ENG003',
            chassis_number: 'CHS003',
            kilometers: 45000,
            color: 'Black',
            owner: 'Mike Wilson',
            phone: '+1234567892',
            address: '789 Pine Rd, Village',
            status: 'active'
        },
        {
            id: 'V004',
            make: 'BMW',
            model: 'X5',
            purchase_date: '2023-02-28',
            registration_number: 'GHI789',
            purchase_price: 55000.00,
            fuel_type: 'Petrol',
            engine_number: 'ENG004',
            chassis_number: 'CHS004',
            kilometers: 8000,
            color: 'Silver',
            owner: 'Lisa Brown',
            phone: '+1234567893',
            address: '321 Elm St, Borough',
            status: 'active'
        },
        {
            id: 'V005',
            make: 'Mercedes',
            model: 'C-Class',
            purchase_date: '2022-11-05',
            registration_number: 'JKL012',
            purchase_price: 42000.00,
            fuel_type: 'Petrol',
            engine_number: 'ENG005',
            chassis_number: 'CHS005',
            kilometers: 18000,
            color: 'Red',
            owner: 'David Lee',
            phone: '+1234567894',
            address: '654 Maple Dr, County',
            status: 'maintenance'
        }
    ],
    drivers: [
        {
            id: 'D001',
            name: 'Robert Johnson',
            phone: '+1234567900',
            address: '111 Driver St, City',
            license_number: 'DL001',
            status: 'active'
        },
        {
            id: 'D002',
            name: 'Maria Garcia',
            phone: '+1234567901',
            address: '222 Driver Ave, Town',
            license_number: 'DL002',
            status: 'active'
        },
        {
            id: 'D003',
            name: 'James Wilson',
            phone: '+1234567902',
            address: '333 Driver Rd, Village',
            license_number: 'DL003',
            status: 'active'
        },
        {
            id: 'D004',
            name: 'Emily Davis',
            phone: '+1234567903',
            address: '444 Driver Blvd, Borough',
            license_number: 'DL004',
            status: 'active'
        },
        {
            id: 'D005',
            name: 'Michael Chen',
            phone: '+1234567904',
            address: '555 Driver Way, County',
            license_number: 'DL005',
            status: 'active'
        }
    ],
    maintenance: [
        {
            id: 'M001',
            vehicle_id: 'V001',
            description: 'Oil change and filter replacement',
            date: '2024-01-15',
            cost: 45.00,
            status: 'completed'
        },
        {
            id: 'M002',
            vehicle_id: 'V002',
            description: 'Brake pad replacement',
            date: '2024-02-10',
            cost: 120.00,
            status: 'completed'
        },
        {
            id: 'M003',
            vehicle_id: 'V003',
            description: 'Tire rotation and alignment',
            date: '2024-03-05',
            cost: 80.00,
            status: 'completed'
        },
        {
            id: 'M004',
            vehicle_id: 'V004',
            description: 'Air filter replacement',
            date: '2024-03-20',
            cost: 25.00,
            status: 'completed'
        },
        {
            id: 'M005',
            vehicle_id: 'V005',
            description: 'Engine diagnostic and tune-up',
            date: '2024-04-01',
            cost: 200.00,
            status: 'scheduled'
        }
    ],
    insurance: [
        {
            id: 'I001',
            vehicle_id: 'V001',
            policy_number: 'POL001',
            insurer: 'State Farm',
            policy_type: 'Comprehensive',
            start_date: '2024-01-01',
            end_date: '2025-01-01',
            payment: 1200.00,
            issue_date: '2024-01-01',
            premium_amount: 1200.00,
            has_insurance: true
        },
        {
            id: 'I002',
            vehicle_id: 'V002',
            policy_number: 'POL002',
            insurer: 'Allstate',
            policy_type: 'Liability',
            start_date: '2024-01-01',
            end_date: '2025-01-01',
            payment: 800.00,
            issue_date: '2024-01-01',
            premium_amount: 800.00,
            has_insurance: true
        },
        {
            id: 'I003',
            vehicle_id: 'V003',
            policy_number: 'POL003',
            insurer: 'Geico',
            policy_type: 'Comprehensive',
            start_date: '2024-01-01',
            end_date: '2025-01-01',
            payment: 1500.00,
            issue_date: '2024-01-01',
            premium_amount: 1500.00,
            has_insurance: true
        }
    ],
    claims: [
        {
            id: 'C001',
            vehicle_id: 'V001',
            claim_date: '2024-02-15',
            claim_amount: 2500.00,
            reason: 'Minor collision damage',
            status: 'approved'
        },
        {
            id: 'C002',
            vehicle_id: 'V003',
            claim_date: '2024-03-10',
            claim_amount: 5000.00,
            reason: 'Hail damage repair',
            status: 'pending'
        }
    ],
    vehicle_locations: [
        {
            id: 'L001',
            vehicle_id: 'V001',
            latitude: 40.7128,
            longitude: -74.0060,
            address: 'New York, NY'
        },
        {
            id: 'L002',
            vehicle_id: 'V002',
            latitude: 34.0522,
            longitude: -118.2437,
            address: 'Los Angeles, CA'
        },
        {
            id: 'L003',
            vehicle_id: 'V003',
            latitude: 41.8781,
            longitude: -87.6298,
            address: 'Chicago, IL'
        }
    ]
};

async function insertSampleData() {
    try {
        console.log('🚀 Starting to insert sample data...');

        // Initialize database
        await initDatabase();
        const pool = getDatabase();

        // Insert vehicles
        console.log('📦 Inserting vehicles...');
        for (const vehicle of sampleData.vehicles) {
            await pool.request()
                .input('id', vehicle.id)
                .input('make', vehicle.make)
                .input('model', vehicle.model)
                .input('purchase_date', vehicle.purchase_date)
                .input('registration_number', vehicle.registration_number)
                .input('purchase_price', vehicle.purchase_price)
                .input('fuel_type', vehicle.fuel_type)
                .input('engine_number', vehicle.engine_number)
                .input('chassis_number', vehicle.chassis_number)
                .input('kilometers', vehicle.kilometers)
                .input('color', vehicle.color)
                .input('owner', vehicle.owner)
                .input('phone', vehicle.phone)
                .input('address', vehicle.address)
                .input('status', vehicle.status)
                .query(`
          INSERT INTO vehicles (id, make, model, purchase_date, registration_number, 
                              purchase_price, fuel_type, engine_number, chassis_number, 
                              kilometers, color, owner, phone, address, status)
          VALUES (@id, @make, @model, @purchase_date, @registration_number, 
                  @purchase_price, @fuel_type, @engine_number, @chassis_number, 
                  @kilometers, @color, @owner, @phone, @address, @status)
        `);
        }
        console.log('✅ Vehicles inserted successfully');

        // Insert drivers
        console.log('👥 Inserting drivers...');
        for (const driver of sampleData.drivers) {
            await pool.request()
                .input('id', driver.id)
                .input('name', driver.name)
                .input('phone', driver.phone)
                .input('address', driver.address)
                .input('license_number', driver.license_number)
                .input('status', driver.status)
                .query(`
          INSERT INTO drivers (id, name, phone, address, license_number, status)
          VALUES (@id, @name, @phone, @address, @license_number, @status)
        `);
        }
        console.log('✅ Drivers inserted successfully');

        // Insert maintenance records
        console.log('🔧 Inserting maintenance records...');
        for (const maintenance of sampleData.maintenance) {
            await pool.request()
                .input('id', maintenance.id)
                .input('vehicle_id', maintenance.vehicle_id)
                .input('description', maintenance.description)
                .input('date', maintenance.date)
                .input('cost', maintenance.cost)
                .input('status', maintenance.status)
                .query(`
          INSERT INTO maintenance (id, vehicle_id, description, date, cost, status)
          VALUES (@id, @vehicle_id, @description, @date, @cost, @status)
        `);
        }
        console.log('✅ Maintenance records inserted successfully');

        // Insert insurance records
        console.log('🛡️ Inserting insurance records...');
        for (const insurance of sampleData.insurance) {
            await pool.request()
                .input('id', insurance.id)
                .input('vehicle_id', insurance.vehicle_id)
                .input('policy_number', insurance.policy_number)
                .input('insurer', insurance.insurer)
                .input('policy_type', insurance.policy_type)
                .input('start_date', insurance.start_date)
                .input('end_date', insurance.end_date)
                .input('payment', insurance.payment)
                .input('issue_date', insurance.issue_date)
                .input('premium_amount', insurance.premium_amount)
                .input('has_insurance', insurance.has_insurance)
                .query(`
          INSERT INTO insurance (id, vehicle_id, policy_number, insurer, policy_type, 
                               start_date, end_date, payment, issue_date, premium_amount, has_insurance)
          VALUES (@id, @vehicle_id, @policy_number, @insurer, @policy_type, 
                  @start_date, @end_date, @payment, @issue_date, @premium_amount, @has_insurance)
        `);
        }
        console.log('✅ Insurance records inserted successfully');

        // Insert claims records
        console.log('📋 Inserting claims records...');
        for (const claim of sampleData.claims) {
            await pool.request()
                .input('id', claim.id)
                .input('vehicle_id', claim.vehicle_id)
                .input('claim_date', claim.claim_date)
                .input('claim_amount', claim.claim_amount)
                .input('reason', claim.reason)
                .input('status', claim.status)
                .query(`
          INSERT INTO claims (id, vehicle_id, claim_date, claim_amount, reason, status)
          VALUES (@id, @vehicle_id, @claim_date, @claim_amount, @reason, @status)
        `);
        }
        console.log('✅ Claims records inserted successfully');

        // Insert vehicle locations
        console.log('📍 Inserting vehicle locations...');
        for (const location of sampleData.vehicle_locations) {
            await pool.request()
                .input('id', location.id)
                .input('vehicle_id', location.vehicle_id)
                .input('latitude', location.latitude)
                .input('longitude', location.longitude)
                .input('address', location.address)
                .query(`
          INSERT INTO vehicle_locations (id, vehicle_id, latitude, longitude, address)
          VALUES (@id, @vehicle_id, @latitude, @longitude, @address)
        `);
        }
        console.log('✅ Vehicle locations inserted successfully');

        // Verify data insertion
        console.log('🔍 Verifying data insertion...');
        const vehicleCount = await pool.request().query('SELECT COUNT(*) as count FROM vehicles');
        const driverCount = await pool.request().query('SELECT COUNT(*) as count FROM drivers');
        const maintenanceCount = await pool.request().query('SELECT COUNT(*) as count FROM maintenance');
        const insuranceCount = await pool.request().query('SELECT COUNT(*) as count FROM insurance');
        const claimsCount = await pool.request().query('SELECT COUNT(*) as count FROM claims');
        const locationsCount = await pool.request().query('SELECT COUNT(*) as count FROM vehicle_locations');

        console.log('📊 Data Summary:');
        console.log(`   Vehicles: ${vehicleCount.recordset[0].count}`);
        console.log(`   Drivers: ${driverCount.recordset[0].count}`);
        console.log(`   Maintenance Records: ${maintenanceCount.recordset[0].count}`);
        console.log(`   Insurance Records: ${insuranceCount.recordset[0].count}`);
        console.log(`   Claims Records: ${claimsCount.recordset[0].count}`);
        console.log(`   Vehicle Locations: ${locationsCount.recordset[0].count}`);

        console.log('🎉 Sample data insertion completed successfully!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Error inserting sample data:', error);
        process.exit(1);
    }
}

insertSampleData(); 