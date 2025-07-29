-- Sample Data for Vehicle Maintenance Management System
-- Run these INSERT statements after your database is set up

-- Insert Sample Vehicles
INSERT INTO vehicles (id, make, model, purchase_date, registration_number, purchase_price, fuel_type, engine_number, chassis_number, kilometers, color, owner, phone, address, status) VALUES
('V001', 'Toyota', 'Camry', '2022-01-15', 'ABC123', 25000.00, 'Petrol', 'ENG001', 'CHS001', 15000, 'White', 'John Smith', '+1234567890', '123 Main St, City', 'active'),
('V002', 'Honda', 'Civic', '2021-06-20', 'XYZ789', 22000.00, 'Petrol', 'ENG002', 'CHS002', 25000, 'Blue', 'Sarah Johnson', '+1234567891', '456 Oak Ave, Town', 'active'),
('V003', 'Ford', 'F-150', '2020-03-10', 'DEF456', 35000.00, 'Diesel', 'ENG003', 'CHS003', 45000, 'Black', 'Mike Wilson', '+1234567892', '789 Pine Rd, Village', 'active'),
('V004', 'BMW', 'X5', '2023-02-28', 'GHI789', 55000.00, 'Petrol', 'ENG004', 'CHS004', 8000, 'Silver', 'Lisa Brown', '+1234567893', '321 Elm St, Borough', 'active'),
('V005', 'Mercedes', 'C-Class', '2022-11-05', 'JKL012', 42000.00, 'Petrol', 'ENG005', 'CHS005', 18000, 'Red', 'David Lee', '+1234567894', '654 Maple Dr, County', 'maintenance');

-- Insert Sample Drivers
INSERT INTO drivers (id, name, phone, address, license_number, status) VALUES
('D001', 'Robert Johnson', '+1234567900', '111 Driver St, City', 'DL001', 'active'),
('D002', 'Maria Garcia', '+1234567901', '222 Driver Ave, Town', 'DL002', 'active'),
('D003', 'James Wilson', '+1234567902', '333 Driver Rd, Village', 'DL003', 'active'),
('D004', 'Emily Davis', '+1234567903', '444 Driver Blvd, Borough', 'DL004', 'active'),
('D005', 'Michael Chen', '+1234567904', '555 Driver Way, County', 'active');

-- Insert Sample Maintenance Records
INSERT INTO maintenance (id, vehicle_id, description, date, cost, status) VALUES
('M001', 'V001', 'Oil change and filter replacement', '2024-01-15', 45.00, 'completed'),
('M002', 'V002', 'Brake pad replacement', '2024-02-10', 120.00, 'completed'),
('M003', 'V003', 'Tire rotation and alignment', '2024-03-05', 80.00, 'completed'),
('M004', 'V004', 'Air filter replacement', '2024-03-20', 25.00, 'completed'),
('M005', 'V005', 'Engine diagnostic and tune-up', '2024-04-01', 200.00, 'scheduled'),
('M006', 'V001', 'Transmission fluid change', '2024-04-15', 150.00, 'scheduled'),
('M007', 'V002', 'Battery replacement', '2024-04-20', 180.00, 'scheduled'),
('M008', 'V003', 'Coolant system flush', '2024-05-01', 95.00, 'scheduled');

-- Insert Sample Insurance Records
INSERT INTO insurance (id, vehicle_id, policy_number, insurer, policy_type, start_date, end_date, payment, issue_date, premium_amount, has_insurance) VALUES
('I001', 'V001', 'POL001', 'State Farm', 'Comprehensive', '2024-01-01', '2025-01-01', 1200.00, '2024-01-01', 1200.00, 1),
('I002', 'V002', 'POL002', 'Allstate', 'Liability', '2024-01-01', '2025-01-01', 800.00, '2024-01-01', 800.00, 1),
('I003', 'V003', 'POL003', 'Geico', 'Comprehensive', '2024-01-01', '2025-01-01', 1500.00, '2024-01-01', 1500.00, 1),
('I004', 'V004', 'POL004', 'Progressive', 'Full Coverage', '2024-01-01', '2025-01-01', 2000.00, '2024-01-01', 2000.00, 1),
('I005', 'V005', 'POL005', 'Farmers', 'Comprehensive', '2024-01-01', '2025-01-01', 1800.00, '2024-01-01', 1800.00, 1);

-- Insert Sample Claims Records
INSERT INTO claims (id, vehicle_id, claim_date, claim_amount, reason, status) VALUES
('C001', 'V001', '2024-02-15', 2500.00, 'Minor collision damage', 'approved'),
('C002', 'V003', '2024-03-10', 5000.00, 'Hail damage repair', 'pending'),
('C003', 'V004', '2024-03-25', 1200.00, 'Windshield replacement', 'approved'),
('C004', 'V002', '2024-04-05', 800.00, 'Side mirror damage', 'pending');

-- Insert Sample Vehicle Locations
INSERT INTO vehicle_locations (id, vehicle_id, latitude, longitude, address) VALUES
('L001', 'V001', 40.7128, -74.0060, 'New York, NY'),
('L002', 'V002', 34.0522, -118.2437, 'Los Angeles, CA'),
('L003', 'V003', 41.8781, -87.6298, 'Chicago, IL'),
('L004', 'V004', 29.7604, -95.3698, 'Houston, TX'),
('L005', 'V005', 39.9526, -75.1652, 'Philadelphia, PA');

-- Update some vehicles to have more realistic data
UPDATE vehicles SET 
    kilometers = 25000,
    last_updated = GETDATE()
WHERE id = 'V001';

UPDATE vehicles SET 
    kilometers = 35000,
    last_updated = GETDATE()
WHERE id = 'V002';

UPDATE vehicles SET 
    kilometers = 55000,
    last_updated = GETDATE()
WHERE id = 'V003';

-- Add some maintenance history
INSERT INTO maintenance (id, vehicle_id, description, date, cost, status) VALUES
('M009', 'V001', 'Regular service - 25,000 km', '2024-01-10', 75.00, 'completed'),
('M010', 'V002', 'Brake inspection', '2024-02-05', 50.00, 'completed'),
('M011', 'V003', 'Fuel filter replacement', '2024-02-20', 65.00, 'completed'),
('M012', 'V004', 'Spark plug replacement', '2024-03-15', 90.00, 'completed');

-- Add some driver assignments (you can create a driver_vehicle table if needed)
-- For now, we'll just note that drivers are available for assignment

-- Sample queries to verify data
SELECT 'Vehicles' as table_name, COUNT(*) as count FROM vehicles
UNION ALL
SELECT 'Drivers' as table_name, COUNT(*) as count FROM drivers
UNION ALL
SELECT 'Maintenance' as table_name, COUNT(*) as count FROM maintenance
UNION ALL
SELECT 'Insurance' as table_name, COUNT(*) as count FROM insurance
UNION ALL
SELECT 'Claims' as table_name, COUNT(*) as count FROM claims
UNION ALL
SELECT 'Locations' as table_name, COUNT(*) as count FROM vehicle_locations; 