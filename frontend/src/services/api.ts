/// <reference types="vite/client" />

// API Service for Vehicle Maintenance Management System

// Type definitions
interface Vehicle {
    id: string;
    make: string;
    model: string;
    purchase_date: string;
    registration_number: string;
    purchase_price: number;
    fuel_type: string;
    engine_number: string;
    chassis_number: string;
    kilometers: number;
    color: string;
    owner: string;
    phone: string;
    address: string;
    status: string; // 'active', 'maintenance', etc.
    last_updated: string;
    deleted_at?: string; // For soft delete functionality
    created_at: string;
}

interface Driver {
    id: string;
    name: string;
    phone: string;
    address: string;
    license_number: string;
    status: string;
    last_updated: string;
    deleted_at?: string; // For soft delete functionality
    created_at: string;
}

interface Maintenance {
    id: string;
    vehicle_id: string;
    description: string;
    date: string;
    cost: number;
    status: string;
    last_updated: string;
    created_at: string;
    deleted?: boolean; // For soft delete functionality
}

interface Insurance {
    id: string;
    vehicle_id: string;
    policy_number: string;
    insurer: string;
    policy_type: string;
    start_date: string;
    end_date: string;
    payment: number;
    issue_date: string;
    premium_amount: number;
    has_insurance: boolean;
    created_at: string;
}

interface Claim {
    id: string;
    vehicle_id: string;
    claim_date: string;
    claim_amount: number;
    reason: string;
}

// interface FuelLog {
//     id: string;
//     vehicleId: string;
//     fuelDate: string;
//     fuelType: string;
//     quantity: number;
//     cost: number;
//     odometerReading: number;
//     fuelStation: string;
//     location: string;
// }

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

interface DashboardStats {
    totalVehicles: number;
    vehiclesWithInsurance: number;
    vehiclesWithoutInsurance: number;
    totalMaintenanceCost: number;
    totalExpenses: number;
    totalFuelCost: number;
    totalCost: number;
    upcomingServicesCount: number;
    highPriorityServicesCount: number;
}

// Configuration for different environments
const getBaseURL = (): string => {
    // Check if we're in development or production
    if (import.meta.env.DEV) {
        // In development, use network IP for cross-system access
        return 'http://localhost:3001/api';
        // return import.meta.env.VITE_API_URL || 'https://7h0mm7mt-3044.asse.devtunnels.ms';
    } else {
        // In production, use the actual server URL
        // You can set this via environment variable
        return import.meta.env.VITE_API_URL || 'http://localhost:3001/api';
    }
};

const BASE_URL = getBaseURL();
// console.log(BASE_URL);


// Generic API methods
const api = {
    // GET request
    async get<T>(endpoint: string): Promise<T> {
        try {
            // console.log(`Making GET request to: ${BASE_URL}${endpoint}`);
            const response = await fetch(`${BASE_URL}${endpoint}`);
            // console.log(`Response status: ${response.status}`);
            // console.log(`Response headers:`, response.headers);

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`HTTP error! status: ${response.status}, body: ${errorText}`);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            // console.log(`Successfully fetched data:`, data);
            return data;
        } catch (error) {
            console.error('API GET Error:', error);
            console.error('Error details:', {
                message: (error as Error).message,
                stack: (error as Error).stack,
                endpoint: endpoint,
                baseURL: BASE_URL
            });
            throw error;
        }
    },

    // POST request
    async post<T>(endpoint: string, data: any): Promise<T> {
        try {
            const response = await fetch(`${BASE_URL}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('API POST Error:', error);
            throw error;
        }
    },

    // PUT request
    async put<T>(endpoint: string, data: any): Promise<T> {
        try {
            const response = await fetch(`${BASE_URL}${endpoint}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('API PUT Error:', error);
            throw error;
        }
    },

    // PATCH request
    async patch<T>(endpoint: string, data: any): Promise<T> {
        try {
            const response = await fetch(`${BASE_URL}${endpoint}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('API PATCH Error:', error);
            throw error;
        }
    },

    // DELETE request
    async delete<T>(endpoint: string): Promise<T> {
        try {
            const response = await fetch(`${BASE_URL}${endpoint}`, {
                method: 'DELETE',
            });
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('API DELETE Error:', error);
            throw error;
        }
    },
};

// Vehicle API methods
export const vehicleAPI = {
    // Get all vehicles (excluding soft deleted)
    getAllVehicles: async (): Promise<Vehicle[]> => {
        const allVehicles = await api.get<Vehicle[]>('/vehicles');
        // Filter out soft deleted vehicles
        return allVehicles.filter(vehicle => !vehicle.deleted_at);
    },

    // Get vehicle by ID
    getVehicleById: (id: string): Promise<Vehicle> => api.get<Vehicle>(`/vehicles/${id}`),

    // Create new vehicle
    createVehicle: (vehicleData: Omit<Vehicle, 'id'>): Promise<Vehicle> => api.post<Vehicle>('/vehicles', vehicleData),

    // Update vehicle
    updateVehicle: (id: string, vehicleData: Partial<Vehicle>): Promise<Vehicle> => api.put<Vehicle>(`/vehicles/${id}`, vehicleData),

    // Partially update vehicle
    patchVehicle: (id: string, vehicleData: Partial<Vehicle>): Promise<Vehicle> => api.patch<Vehicle>(`/vehicles/${id}`, vehicleData),

    // Soft delete vehicle
    softDeleteVehicle: (id: string): Promise<Vehicle> => api.patch<Vehicle>(`/vehicles/${id}/soft-delete`, {}),

    // Restore soft deleted vehicle
    restoreVehicle: (id: string): Promise<Vehicle> => api.patch<Vehicle>(`/vehicles/${id}/restore`, {}),

    // Hard delete vehicle (for admin purposes)
    deleteVehicle: (id: string): Promise<void> => api.delete<void>(`/vehicles/${id}`),

    // Get vehicles by search term
    searchVehicles: (searchTerm: string): Promise<Vehicle[]> => api.get<Vehicle[]>(`/vehicles?q=${searchTerm}`),

    // Get vehicles with insurance (placeholder - insurance is separate table)
    getVehiclesWithInsurance: async (): Promise<Vehicle[]> => {
        try {
            const allVehicles = await api.get<Vehicle[]>('/vehicles');
            // For now, return all vehicles since insurance is in separate table
            return allVehicles.filter(vehicle => !vehicle.deleted_at);
        } catch (error) {
            console.error('Error getting vehicles with insurance:', error);
            throw error;
        }
    },

    // Get vehicles without insurance (placeholder - insurance is separate table)
    getVehiclesWithoutInsurance: async (): Promise<Vehicle[]> => {
        try {
            const allVehicles = await api.get<Vehicle[]>('/vehicles');
            // For now, return empty array since insurance is in separate table
            return [];
        } catch (error) {
            console.error('Error getting vehicles without insurance:', error);
            throw error;
        }
    },

    // Get all vehicles including soft deleted (for admin purposes)
    getAllVehiclesIncludingDeleted: (): Promise<Vehicle[]> => api.get<Vehicle[]>('/vehicles/all'),
};

// Maintenance API methods
export const maintenanceAPI = {
    // Get all maintenance records
    getAllMaintenance: (): Promise<Maintenance[]> => api.get<Maintenance[]>('/maintenance'),

    // Get maintenance by ID
    getMaintenanceById: (id: string): Promise<Maintenance> => api.get<Maintenance>(`/maintenance/${id}`),

    // Get maintenance by vehicle ID
    getMaintenanceByVehicle: (vehicleId: string): Promise<Maintenance[]> => api.get<Maintenance[]>(`/maintenance?vehicleId=${vehicleId}`),

    // Create new maintenance record
    createMaintenance: (maintenanceData: { vehicle_id: string; description: string; date: string; cost: number; status: string }): Promise<Maintenance> => api.post<Maintenance>('/maintenance', maintenanceData),

    // Update maintenance record
    updateMaintenance: (id: string, maintenanceData: Partial<Maintenance> | { deleted: boolean }): Promise<Maintenance> => api.patch<Maintenance>(`/maintenance/${id}`, maintenanceData),

    // Delete maintenance record
    deleteMaintenance: (id: string): Promise<void> => api.delete<void>(`/maintenance/${id}`),

    // Get completed maintenance
    getCompletedMaintenance: (): Promise<Maintenance[]> => api.get<Maintenance[]>('/maintenance?status=Completed'),

    // Get scheduled maintenance
    getScheduledMaintenance: (): Promise<Maintenance[]> => api.get<Maintenance[]>('/maintenance?status=Scheduled'),
};

// Insurance API methods
export const insuranceAPI = {
    // Get all insurance records
    getAllInsurance: (): Promise<Insurance[]> => api.get<Insurance[]>('/insurance'),

    // Get insurance by ID
    getInsuranceById: (id: string): Promise<Insurance> => api.get<Insurance>(`/insurance/${id}`),

    // Get insurance by vehicle ID
    getInsuranceByVehicle: (vehicleId: string): Promise<Insurance[]> => api.get<Insurance[]>(`/insurance/vehicle/${vehicleId}`),

    // Create new insurance record
    createInsurance: (insuranceData: Omit<Insurance, 'id' | 'created_at'>): Promise<Insurance> => api.post<Insurance>('/insurance', insuranceData),

    // Update insurance record
    updateInsurance: (id: string, insuranceData: Partial<Insurance>): Promise<Insurance> => api.put<Insurance>(`/insurance/${id}`, insuranceData),

    // Partially update insurance record
    patchInsurance: (id: string, insuranceData: Partial<Insurance>): Promise<Insurance> => api.patch<Insurance>(`/insurance/${id}`, insuranceData),

    // Delete insurance record
    deleteInsurance: (id: string): Promise<void> => api.delete<void>(`/insurance/${id}`),
};

// Fuel Logs API methods
// export const fuelLogsAPI = {
//     // Get all fuel logs
//     getAllFuelLogs: (): Promise<FuelLog[]> => api.get<FuelLog[]>('/fuelLogs'),

//     // Get fuel log by ID
//     getFuelLogById: (id: string): Promise<FuelLog> => api.get<FuelLog>(`/fuelLogs/${id}`),

//     // Get fuel logs by vehicle ID
//     getFuelLogsByVehicle: (vehicleId: string): Promise<FuelLog[]> => api.get<FuelLog[]>(`/fuelLogs?vehicleId=${vehicleId}`),

//     // Create new fuel log
//     createFuelLog: (fuelLogData: Omit<FuelLog, 'id'>): Promise<FuelLog> => api.post<FuelLog>('/fuelLogs', fuelLogData),

//     // Update fuel log
//     updateFuelLog: (id: string, fuelLogData: Partial<FuelLog>): Promise<FuelLog> => api.put<FuelLog>(`/fuelLogs/${id}`, fuelLogData),

//     // Delete fuel log
//     deleteFuelLog: (id: string): Promise<void> => api.delete<void>(`/fuelLogs/${id}`),
// };

// Expenses API methods
export const expensesAPI = {
    // Get all expenses
    getAllExpenses: (): Promise<Expense[]> => api.get<Expense[]>('/expenses'),

    // Get expense by ID
    getExpenseById: (id: string): Promise<Expense> => api.get<Expense>(`/expenses/${id}`),

    // Get expenses by vehicle ID
    getExpensesByVehicle: (vehicleId: string): Promise<Expense[]> => api.get<Expense[]>(`/expenses?vehicleId=${vehicleId}`),

    // Create new expense
    createExpense: (expenseData: Omit<Expense, 'id'>): Promise<Expense> => api.post<Expense>('/expenses', expenseData),

    // Update expense
    updateExpense: (id: string, expenseData: Partial<Expense>): Promise<Expense> => api.put<Expense>(`/expenses/${id}`, expenseData),

    // Delete expense
    deleteExpense: (id: string): Promise<void> => api.delete<void>(`/expenses/${id}`),

    // Get expenses by category
    getExpensesByCategory: (category: string): Promise<Expense[]> => api.get<Expense[]>(`/expenses?category=${category}`),
};

// Dashboard API methods
export const dashboardAPI = {
    // Get dashboard statistics
    getDashboardStats: (): Promise<DashboardStats> => api.get<DashboardStats>('/dashboard/stats'),

    // Get monthly expenses
    getMonthlyExpenses: (year: number, month: number): Promise<Expense[]> => api.get<Expense[]>(`/expenses?year=${year}&month=${month}`),
};

// Driver API methods
export const driverAPI = {
    // Get all drivers (excluding soft deleted)
    getAllDrivers: async (): Promise<Driver[]> => {
        const allDrivers = await api.get<Driver[]>('/drivers');
        // Filter out soft deleted drivers
        return allDrivers.filter(driver => !driver.deleted_at);
    },

    // Get driver by ID
    getDriverById: (id: string): Promise<Driver> => api.get<Driver>(`/drivers/${id}`),

    // Create new driver
    createDriver: (driverData: Omit<Driver, 'id'>): Promise<Driver> => api.post<Driver>('/drivers', driverData),

    // Update driver
    updateDriver: (id: string, driverData: Partial<Driver>): Promise<Driver> => api.put<Driver>(`/drivers/${id}`, driverData),

    // Soft delete driver
    softDeleteDriver: (id: string): Promise<Driver> => api.patch<Driver>(`/drivers/${id}`, { deletedAt: new Date().toISOString() }),

    // Restore soft deleted driver
    restoreDriver: (id: string): Promise<Driver> => api.patch<Driver>(`/drivers/${id}`, { deletedAt: null }),

    // Hard delete driver (for admin purposes)
    deleteDriver: (id: string): Promise<void> => api.delete<void>(`/drivers/${id}`),

    // Get all drivers including soft deleted (for admin purposes)
    getAllDriversIncludingDeleted: (): Promise<Driver[]> => api.get<Driver[]>('/drivers'),
};

export const claimsAPI = {
    // Get all claim records
    getAllClaims: (): Promise<Claim[]> => api.get<Claim[]>('/claims'),

    // Get claim by ID
    getClaimById: (id: string): Promise<Claim> => api.get<Claim>(`/claims/${id}`),

    // Get claims by insurance ID
    getClaimsByInsurance: (insuranceId: string): Promise<Claim[]> => api.get<Claim[]>(`/claims/insurance/${insuranceId}`),

    // Create new claim record
    createClaim: (claimData: Omit<Claim, 'id' | 'created_at'>): Promise<Claim> => api.post<Claim>('/claims', claimData),

    // Update claim record
    updateClaim: (id: string, claimData: Partial<Claim>): Promise<Claim> => api.put<Claim>(`/claims/${id}`, claimData),

    // Partially update claim record
    patchClaim: (id: string, claimData: Partial<Claim>): Promise<Claim> => api.patch<Claim>(`/claims/${id}`, claimData),

    // Delete claim record
    deleteClaim: (id: string): Promise<void> => api.delete<void>(`/claims/${id}`),
};


// Export types for use in other files
export type { Vehicle, Expense, DashboardStats, Driver, Maintenance, Insurance,Claim };