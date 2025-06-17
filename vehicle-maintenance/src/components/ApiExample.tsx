import React, { useState, useEffect } from 'react';
import {
    vehicleAPI,
    maintenanceAPI,
    fuelLogsAPI,
    expensesAPI,
    dashboardAPI
} from '../services/api';

// Define interfaces for the data types
interface Vehicle {
    id: string;
    make: string;
    model: string;
    registrationNumber: string;
    purchaseDate: string;
    purchasePrice: string;
    fuelType: string;
    engineNumber: string;
    chassisNumber: string;
    kilometers: string;
    color: string;
    owner: string;
    phone: string;
    address: string;
    insurance?: {
        policyNumber: string;
        insurer: string;
        policytype: string;
        startDate: string;
        endDate: string;
        payment: string;
        issueDate: string;
        premiumAmount: string;
    };
}

interface Maintenance {
    id: string;
    vehicleId: string;
    serviceDate: string;
    serviceType: string;
    description: string;
    cost: number;
    nextServiceDate: string;
    serviceCenter: string;
    technician: string;
    status: string;
    odometerReading: number;
}

interface DashboardStats {
    totalVehicles: number;
    totalMaintenance: number;
    totalExpenses: number;
    insuredVehicles: number;
}

interface FuelLog {
    id: string;
    vehicleId: string;
    fuelDate: string;
    fuelType: string;
    quantity: number;
    cost: number;
    odometerReading: number;
    fuelStation: string;
    location: string;
}

interface Expense {
    id: string;
    vehicleId: string;
    expenseDate: string;
    category: string;
    description: string;
    amount: number;
    paymentMethod: string;
    receiptNumber: string;
}

interface ApiExampleProps {
    sidebarCollapsed?: boolean;
    toggleSidebar?: () => void;
}

const ApiExample: React.FC<ApiExampleProps> = ({ sidebarCollapsed, toggleSidebar }) => {
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [maintenance, setMaintenance] = useState<Maintenance[]>([]);
    const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
    const [insuredVehicles, setInsuredVehicles] = useState<Vehicle[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Example: Fetch all vehicles
    const fetchVehicles = async (): Promise<void> => {
        try {
            setLoading(true);
            const data = await vehicleAPI.getAllVehicles();
            setVehicles(data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch vehicles');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Example: Fetch maintenance records
    const fetchMaintenance = async (): Promise<void> => {
        try {
            setLoading(true);
            const data = await maintenanceAPI.getAllMaintenance();
            setMaintenance(data);
            setError(null);
        } catch (err) {
            setError('Failed to fetch maintenance records');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Example: Fetch dashboard statistics
    const fetchDashboardStats = async (): Promise<void> => {
        try {
            setLoading(true);
            const stats = await dashboardAPI.getDashboardStats();
            setDashboardStats(stats);
            setError(null);
        } catch (err) {
            setError('Failed to fetch dashboard stats');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Example: Create a new vehicle
    const createNewVehicle = async (): Promise<void> => {
        const newVehicle: Omit<Vehicle, 'id'> = {
            make: "Honda",
            model: "City",
            registrationNumber: "KL01CD1234",
            purchaseDate: "2024-01-15",
            purchasePrice: "1200000",
            fuelType: "Petrol",
            engineNumber: "honda123xyz",
            chassisNumber: "honda456abc",
            kilometers: "5000",
            color: "white",
            owner: "Alice Johnson",
            phone: "9876543210",
            address: "Kerala, India",
            insurance: {
                policyNumber: "POL789012",
                insurer: "HDFC Ergo",
                policytype: "Comprehensive",
                startDate: "2024-01-01",
                endDate: "2024-12-31",
                payment: "card",
                issueDate: "2023-12-20",
                premiumAmount: "12000",
            }
        };

        try {
            setLoading(true);
            const createdVehicle = await vehicleAPI.createVehicle(newVehicle);
            console.log('Created vehicle:', createdVehicle);
            // Refresh vehicles list
            await fetchVehicles();
            setError(null);
        } catch (err) {
            setError('Failed to create vehicle');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Example: Add maintenance record
    const addMaintenanceRecord = async (): Promise<void> => {
        if (vehicles.length === 0) {
            setError('No vehicles available. Please fetch vehicles first.');
            return;
        }

        const newMaintenance: Omit<Maintenance, 'id'> = {
            vehicleId: vehicles[0].id,
            serviceDate: "2024-12-25",
            serviceType: "Regular Service",
            description: "Oil change, filter replacement, brake inspection",
            cost: 3500,
            nextServiceDate: "2025-06-25",
            serviceCenter: "Honda Service Center",
            technician: "John Doe",
            status: "Completed",
            odometerReading: 55000
        };

        try {
            setLoading(true);
            const createdMaintenance = await maintenanceAPI.createMaintenance(newMaintenance);
            console.log('Created maintenance:', createdMaintenance);
            // Refresh maintenance list
            await fetchMaintenance();
            setError(null);
        } catch (err) {
            setError('Failed to create maintenance record');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Example: Add fuel log
    const addFuelLog = async (): Promise<void> => {
        if (vehicles.length === 0) {
            setError('No vehicles available. Please fetch vehicles first.');
            return;
        }

        const newFuelLog: Omit<FuelLog, 'id'> = {
            vehicleId: vehicles[0].id,
            fuelDate: "2024-12-25",
            fuelType: "Petrol",
            quantity: 40,
            cost: 3200,
            odometerReading: 55000,
            fuelStation: "Indian Oil Station",
            location: "Trivandrum"
        };

        try {
            setLoading(true);
            const createdFuelLog = await fuelLogsAPI.createFuelLog(newFuelLog);
            console.log('Created fuel log:', createdFuelLog);
            setError(null);
        } catch (err) {
            setError('Failed to create fuel log');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Example: Add expense
    const addExpense = async (): Promise<void> => {
        if (vehicles.length === 0) {
            setError('No vehicles available. Please fetch vehicles first.');
            return;
        }

        const newExpense: Omit<Expense, 'id'> = {
            vehicleId: vehicles[0].id,
            expenseDate: "2024-12-25",
            category: "Maintenance",
            description: "Regular service and oil change",
            amount: 3500,
            paymentMethod: "Card",
            receiptNumber: "RCP001240"
        };

        try {
            setLoading(true);
            const createdExpense = await expensesAPI.createExpense(newExpense);
            console.log('Created expense:', createdExpense);
            setError(null);
        } catch (err) {
            setError('Failed to create expense');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Example: Update vehicle
    const updateVehicle = async (): Promise<void> => {
        if (vehicles.length === 0) {
            setError('No vehicles available. Please fetch vehicles first.');
            return;
        }

        try {
            setLoading(true);
            const updatedVehicle = await vehicleAPI.patchVehicle(vehicles[0].id, {
                kilometers: "60000"
            });
            console.log('Updated vehicle:', updatedVehicle);
            // Refresh vehicles list
            await fetchVehicles();
            setError(null);
        } catch (err) {
            setError('Failed to update vehicle');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Example: Get vehicles with insurance
    const getVehiclesWithInsurance = async (): Promise<void> => {
        try {
            setLoading(true);
            const insuredVehicles = await vehicleAPI.getVehiclesWithInsurance();
            console.log('Vehicles with insurance:', insuredVehicles);
            setInsuredVehicles(insuredVehicles);
            setError(null);
        } catch (err) {
            setError('Failed to fetch vehicles with insurance');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Example: Get monthly expenses
    const getMonthlyExpenses = async (): Promise<void> => {
        try {
            setLoading(true);
            const monthlyExpenses = await dashboardAPI.getMonthlyExpenses(2024, 12);
            console.log('Monthly expenses:', monthlyExpenses);
            setError(null);
        } catch (err) {
            setError('Failed to fetch monthly expenses');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Load initial data
        fetchVehicles();
        fetchMaintenance();
        fetchDashboardStats();
    }, []);

    return (
        <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
            <h1>API Usage Examples</h1>

            {error && (
                <div style={{
                    backgroundColor: '#f8d7da',
                    color: '#721c24',
                    padding: '10px',
                    marginBottom: '20px',
                    borderRadius: '4px'
                }}>
                    {error}
                </div>
            )}

            {loading && (
                <div style={{
                    backgroundColor: '#d1ecf1',
                    color: '#0c5460',
                    padding: '10px',
                    marginBottom: '20px',
                    borderRadius: '4px'
                }}>
                    Loading...
                </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                {/* Vehicle Operations */}
                <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
                    <h2>Vehicle Operations</h2>
                    <button onClick={fetchVehicles} style={{ margin: '5px', padding: '8px 16px' }}>
                        Fetch Vehicles
                    </button>
                    <button onClick={createNewVehicle} style={{ margin: '5px', padding: '8px 16px' }}>
                        Create Vehicle
                    </button>
                    <button onClick={updateVehicle} style={{ margin: '5px', padding: '8px 16px' }}>
                        Update Vehicle
                    </button>
                    <button onClick={getVehiclesWithInsurance} style={{ margin: '5px', padding: '8px 16px' }}>
                        Get Insured Vehicles
                    </button>

                    <h3>Vehicles ({vehicles.length})</h3>
                    <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                        {vehicles.map(vehicle => (
                            <div key={vehicle.id} style={{
                                border: '1px solid #eee',
                                padding: '10px',
                                margin: '5px 0',
                                borderRadius: '4px'
                            }}>
                                <strong>{vehicle.make} {vehicle.model}</strong><br />
                                Reg: {vehicle.registrationNumber}<br />
                                Owner: {vehicle.owner}<br />
                                Insurance: {vehicle.insurance?.hasInsurance ? 'Yes' : 'No'}
                            </div>
                        ))}
                    </div>

                    {insuredVehicles.length > 0 && (
                        <>
                            <h3>Vehicles with Insurance ({insuredVehicles.length})</h3>
                            <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                {insuredVehicles.map(vehicle => (
                                    <div key={vehicle.id} style={{
                                        border: '1px solid #4CAF50',
                                        backgroundColor: '#E8F5E8',
                                        padding: '10px',
                                        margin: '5px 0',
                                        borderRadius: '4px'
                                    }}>
                                        <strong>{vehicle.make} {vehicle.model}</strong><br />
                                        Reg: {vehicle.registrationNumber}<br />
                                        Owner: {vehicle.owner}<br />
                                        Insurance: {vehicle.insurance?.policyNumber || 'N/A'}<br />
                                        Insurer: {vehicle.insurance?.insurer || 'N/A'}
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* Maintenance Operations */}
                <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
                    <h2>Maintenance Operations</h2>
                    <button onClick={fetchMaintenance} style={{ margin: '5px', padding: '8px 16px' }}>
                        Fetch Maintenance
                    </button>
                    <button onClick={addMaintenanceRecord} style={{ margin: '5px', padding: '8px 16px' }}>
                        Add Maintenance
                    </button>

                    <h3>Maintenance Records ({maintenance.length})</h3>
                    <div style={{ maxHeight: '200px', overflowY: 'auto' }}>
                        {maintenance.map(record => (
                            <div key={record.id} style={{
                                border: '1px solid #eee',
                                padding: '10px',
                                margin: '5px 0',
                                borderRadius: '4px'
                            }}>
                                <strong>{record.serviceType}</strong><br />
                                Date: {record.serviceDate}<br />
                                Cost: ₹{record.cost}<br />
                                Status: {record.status}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Other Operations */}
                <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
                    <h2>Other Operations</h2>
                    <button onClick={addFuelLog} style={{ margin: '5px', padding: '8px 16px' }}>
                        Add Fuel Log
                    </button>
                    <button onClick={addExpense} style={{ margin: '5px', padding: '8px 16px' }}>
                        Add Expense
                    </button>
                    <button onClick={getMonthlyExpenses} style={{ margin: '5px', padding: '8px 16px' }}>
                        Get Monthly Expenses
                    </button>
                </div>

                {/* Dashboard Stats */}
                <div style={{ border: '1px solid #ddd', padding: '20px', borderRadius: '8px' }}>
                    <h2>Dashboard Statistics</h2>
                    <button onClick={fetchDashboardStats} style={{ margin: '5px', padding: '8px 16px' }}>
                        Refresh Stats
                    </button>

                    {dashboardStats && (
                        <div>
                            <h3>Current Stats</h3>
                            <div style={{ fontSize: '14px' }}>
                                <div>Total Vehicles: {dashboardStats.totalVehicles}</div>
                                <div>With Insurance: {dashboardStats.insuredVehicles}</div>
                                <div>Total Maintenance: {dashboardStats.totalMaintenance}</div>
                                <div>Total Expenses: ₹{dashboardStats.totalExpenses}</div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            <div style={{ marginTop: '20px', padding: '20px', backgroundColor: '#f8f9fa', borderRadius: '8px' }}>
                <h2>How to Use This Example</h2>
                <ol>
                    <li>Make sure your JSON Server is running: <code>npm run server</code></li>
                    <li>Click the buttons to test different API operations</li>
                    <li>Check the browser console for detailed responses</li>
                    <li>Observe how the data updates in real-time</li>
                    <li>Use this as a reference for implementing similar functionality in your components</li>
                </ol>

                <h3>Key Features Demonstrated:</h3>
                <ul>
                    <li>CRUD operations (Create, Read, Update, Delete)</li>
                    <li>Error handling and loading states</li>
                    <li>Real-time data updates</li>
                    <li>Filtering and searching</li>
                    <li>Aggregated data for dashboards</li>
                    <li>Relationship-based queries</li>
                </ul>
            </div>
        </div>
    );
};

export default ApiExample; 