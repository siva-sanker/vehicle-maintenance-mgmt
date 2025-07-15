/// <reference types="vite/client" />

// API Service for Vehicle Maintenance Management System

// Type definitions
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
    status?: string; // 'active', 'maintenance', etc.
    insurance?: {
        policyNumber: string;
        insurer: string;
        policytype: string;
        startDate: string;
        endDate: string;
        payment: string;
        issueDate: string;
        premiumAmount: string;
        hasInsurance: boolean;
    };
    claims?: Array<{
        claimDate: string;
        claimAmount: string;
        reason: string;
        status: string;
    }>;
    deletedAt?: string; // For soft delete functionality
}

interface Driver {
    id: string;
    name: string;
    licenseNumber: string;
    phone: string;
    address: string;
    isActive: boolean;
    assignedVehicleIds: string[];
    deletedAt?: string; // For soft delete functionality
}

interface Maintenance {
    id: string;
    vehicleId: string;
    serviceDate: string;
    serviceType: string;
    descriptionBefore: string;
    descriptionAfter: string;
    cost: number;
    status: string;
    odometerReadingBefore: number;
    odometerReadingAfter: number;
    deleted:boolean;
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
        return 'http://192.168.50.141:4000';
        // return import.meta.env.VITE_API_URL || 'https://7h0mm7mt-3044.asse.devtunnels.ms';
    } else {
        // In production, use the actual server URL
        // You can set this via environment variable
        return import.meta.env.VITE_API_URL || 'http://localhost:4000';
    }
};

const BASE_URL = getBaseURL();
console.log(BASE_URL);


// Generic API methods
const api = {
    // GET request
    async get<T>(endpoint: string): Promise<T> {
        try {
            console.log(`Making GET request to: ${BASE_URL}${endpoint}`);
            const response = await fetch(`${BASE_URL}${endpoint}`);
            console.log(`Response status: ${response.status}`);
            console.log(`Response headers:`, response.headers);

            if (!response.ok) {
                const errorText = await response.text();
                console.error(`HTTP error! status: ${response.status}, body: ${errorText}`);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log(`Successfully fetched data:`, data);
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
        return allVehicles.filter(vehicle => !vehicle.deletedAt);
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
    softDeleteVehicle: (id: string): Promise<Vehicle> => api.patch<Vehicle>(`/vehicles/${id}`, { deletedAt: new Date().toISOString() }),

    // Restore soft deleted vehicle
    restoreVehicle: (id: string): Promise<Vehicle> => api.patch<Vehicle>(`/vehicles/${id}`, { deletedAt: null }),

    // Hard delete vehicle (for admin purposes)
    deleteVehicle: (id: string): Promise<void> => api.delete<void>(`/vehicles/${id}`),

    // Get vehicles by search term
    searchVehicles: (searchTerm: string): Promise<Vehicle[]> => api.get<Vehicle[]>(`/vehicles?q=${searchTerm}`),

    // Get vehicles with insurance
    getVehiclesWithInsurance: async (): Promise<Vehicle[]> => {
        try {
            const allVehicles = await api.get<Vehicle[]>('/vehicles');
            // Filter vehicles that have an insurance object and are not deleted
            return allVehicles.filter(vehicle =>
                vehicle.insurance &&
                typeof vehicle.insurance === 'object' &&
                !vehicle.deletedAt
            );
        } catch (error) {
            console.error('Error getting vehicles with insurance:', error);
            throw error;
        }
    },

    // Get vehicles without insurance
    getVehiclesWithoutInsurance: async (): Promise<Vehicle[]> => {
        try {
            const allVehicles = await api.get<Vehicle[]>('/vehicles');
            // Filter vehicles that don't have an insurance object and are not deleted
            return allVehicles.filter(vehicle =>
                (!vehicle.insurance || typeof vehicle.insurance !== 'object') &&
                !vehicle.deletedAt
            );
        } catch (error) {
            console.error('Error getting vehicles without insurance:', error);
            throw error;
        }
    },

    // Get all vehicles including soft deleted (for admin purposes)
    getAllVehiclesIncludingDeleted: (): Promise<Vehicle[]> => api.get<Vehicle[]>('/vehicles'),
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
    createMaintenance: (maintenanceData: Omit<Maintenance, 'id'>): Promise<Maintenance> => api.post<Maintenance>('/maintenance', maintenanceData),

    // Update maintenance record
    updateMaintenance: (id: string, maintenanceData: Partial<Maintenance>): Promise<Maintenance> => api.patch<Maintenance>(`/maintenance/${id}`, maintenanceData),

    // Delete maintenance record
    deleteMaintenance: (id: string): Promise<void> => api.delete<void>(`/maintenance/${id}`),

    // Get completed maintenance
    getCompletedMaintenance: (): Promise<Maintenance[]> => api.get<Maintenance[]>('/maintenance?status=Completed'),

    // Get scheduled maintenance
    getScheduledMaintenance: (): Promise<Maintenance[]> => api.get<Maintenance[]>('/maintenance?status=Scheduled'),
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
        return allDrivers.filter(driver => !driver.deletedAt);
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

// Export types for use in other files
export type { Vehicle, Expense, DashboardStats, Driver, Maintenance };