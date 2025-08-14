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
    assignedVehicleIds?: string[];
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
    deleted_at?: boolean; // For soft delete functionality
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

// Claims interface will be defined locally to avoid circular imports
interface Claim {
    id: string;
    registration_number: string;
    vehicle_id: string;
    claim_date: string;
    claim_amount: number;
    reason: string;
    status: string;
    created_at?: string;
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

// Helper function to transform backend vehicle data to frontend format
const transformVehicleData = (backendVehicle: any): Vehicle => {
    return {
        id: backendVehicle.v_id_pk?.toString() || '',
        make: backendVehicle.v_make || '',
        model: backendVehicle.v_model || '',
        purchase_date: backendVehicle.v_purchase_date || '',
        registration_number: backendVehicle.v_registration_number || '',
        purchase_price: backendVehicle.v_purchase_price || 0,
        fuel_type: backendVehicle.v_fuel_type || '',
        engine_number: backendVehicle.v_engine_number || '',
        chassis_number: backendVehicle.v_chassis_number || '',
        kilometers: backendVehicle.v_kilometers || 0,
        color: backendVehicle.v_color || '',
        owner: backendVehicle.v_owner || '',
        phone: backendVehicle.v_phone || '',
        address: backendVehicle.v_address || '',
        status: backendVehicle.v_status || 'active',
        last_updated: backendVehicle.v_modified_on || backendVehicle.v_created_at || '',
        deleted_at: backendVehicle.v_deleted_at || undefined,
        created_at: backendVehicle.v_created_at || ''
    };
};

// Helper function to transform frontend vehicle data to backend format
const transformToBackendVehicleData = (frontendVehicle: any): any => {
    const result: any = {};
    
    if (frontendVehicle.make !== undefined) result.make = frontendVehicle.make;
    if (frontendVehicle.model !== undefined) result.model = frontendVehicle.model;
    if (frontendVehicle.purchase_date !== undefined) result.purchase_date = frontendVehicle.purchase_date;
    if (frontendVehicle.registration_number !== undefined) result.registration_number = frontendVehicle.registration_number;
    if (frontendVehicle.purchase_price !== undefined) result.purchase_price = frontendVehicle.purchase_price;
    if (frontendVehicle.fuel_type !== undefined) result.fuel_type = frontendVehicle.fuel_type;
    if (frontendVehicle.engine_number !== undefined) result.engine_number = frontendVehicle.engine_number;
    if (frontendVehicle.chassis_number !== undefined) result.chassis_number = frontendVehicle.chassis_number;
    if (frontendVehicle.kilometers !== undefined) result.kilometers = frontendVehicle.kilometers;
    if (frontendVehicle.color !== undefined) result.color = frontendVehicle.color;
    if (frontendVehicle.owner !== undefined) result.owner = frontendVehicle.owner;
    if (frontendVehicle.phone !== undefined) result.phone = frontendVehicle.phone;
    if (frontendVehicle.address !== undefined) result.address = frontendVehicle.address;
    if (frontendVehicle.status !== undefined) result.status = frontendVehicle.status;
    
    return result;
};

// Vehicle API methods
export const vehicleAPI = {
    // Get all vehicles (excluding soft deleted)
    getAllVehicles: async (): Promise<Vehicle[]> => {
        const backendVehicles = await api.get<any[]>('/vehicles');
        // Transform and filter out soft deleted vehicles
        return backendVehicles
            .filter(vehicle => !vehicle.v_deleted_at)
            .map(transformVehicleData);
    },

    // Get vehicle by ID
    getVehicleById: async (id: string): Promise<Vehicle> => {
        const backendVehicle = await api.get<any>(`/vehicles/${id}`);
        return transformVehicleData(backendVehicle);
    },

    // Create new vehicle
    createVehicle: async (vehicleData: Omit<Vehicle, 'id'>): Promise<Vehicle> => {
        const backendData = transformToBackendVehicleData(vehicleData);
        const createdVehicle = await api.post<any>('/vehicles', backendData);
        return transformVehicleData(createdVehicle);
    },

    // Update vehicle
    updateVehicle: async (id: string, vehicleData: Partial<Vehicle>): Promise<Vehicle> => {
        const backendData = transformToBackendVehicleData(vehicleData);
        const updatedVehicle = await api.put<any>(`/vehicles/${id}`, backendData);
        return transformVehicleData(updatedVehicle);
    },

    // Partially update vehicle
    patchVehicle: async (id: string, vehicleData: Partial<Vehicle>): Promise<Vehicle> => {
        const backendData = transformToBackendVehicleData(vehicleData);
        const updatedVehicle = await api.patch<any>(`/vehicles/${id}`, backendData);
        return transformVehicleData(updatedVehicle);
    },

    // Soft delete vehicle
    softDeleteVehicle: async (id: string): Promise<Vehicle> => {
        const updatedVehicle = await api.patch<any>(`/vehicles/${id}/soft-delete`, {});
        return transformVehicleData(updatedVehicle);
    },

    // Restore soft deleted vehicle
    restoreVehicle: async (id: string): Promise<Vehicle> => {
        const restoredVehicle = await api.patch<any>(`/vehicles/${id}/restore`, {});
        return transformVehicleData(restoredVehicle);
    },

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
    getAllVehiclesIncludingDeleted: async (): Promise<Vehicle[]> => {
        const backendVehicles = await api.get<any[]>('/vehicles/all');
        return backendVehicles.map(transformVehicleData);
    },
};

// Helper function to transform backend maintenance data to frontend format
const transformMaintenanceData = (backendMaintenance: any): Maintenance => {
    return {
        id: backendMaintenance.vm_id_pk?.toString() || '',
        vehicle_id: backendMaintenance.vm_vehicle_id_fk?.toString() || '',
        description: backendMaintenance.vm_description || '',
        date: backendMaintenance.vm_date || '',
        cost: backendMaintenance.vm_cost || 0,
        status: backendMaintenance.vm_status || '',
        last_updated: backendMaintenance.vm_modified_on || backendMaintenance.vm_created_at || '',
        created_at: backendMaintenance.vm_created_at || '',
        deleted_at: backendMaintenance.vm_deleted_at != null && backendMaintenance.vm_deleted_at !== '' ? true : false
    };
};

// Helper function to transform frontend maintenance data to backend format
const transformToBackendMaintenanceData = (frontendMaintenance: any): any => {
    const result: any = {};
    
    if (frontendMaintenance.vehicle_id !== undefined) result.vehicle_id = frontendMaintenance.vehicle_id;
    if (frontendMaintenance.description !== undefined) result.description = frontendMaintenance.description;
    if (frontendMaintenance.date !== undefined) result.date = frontendMaintenance.date;
    if (frontendMaintenance.cost !== undefined) result.cost = frontendMaintenance.cost;
    if (frontendMaintenance.status !== undefined) result.status = frontendMaintenance.status;
    if (frontendMaintenance.deleted_at !== undefined) result.deleted_at = frontendMaintenance.deleted_at;
    
    return result;
};

// Maintenance API methods
export const maintenanceAPI = {
    // Get all maintenance records
    getAllMaintenance: async (): Promise<Maintenance[]> => {
        const backendMaintenance = await api.get<any[]>('/maintenance');
        return backendMaintenance.map(transformMaintenanceData);
    },

    // Get maintenance by ID
    getMaintenanceById: async (id: string): Promise<Maintenance> => {
        const backendMaintenance = await api.get<any>(`/maintenance/${id}`);
        return transformMaintenanceData(backendMaintenance);
    },

    // Get maintenance by vehicle ID
    getMaintenanceByVehicle: async (vehicleId: string): Promise<Maintenance[]> => {
        const backendMaintenance = await api.get<any[]>(`/maintenance?vehicleId=${vehicleId}`);
        return backendMaintenance.map(transformMaintenanceData);
    },

    // Create new maintenance record
    createMaintenance: async (maintenanceData: { vehicle_id: string; description: string; date: string; cost: number; status: string }): Promise<Maintenance> => {
        const backendData = transformToBackendMaintenanceData(maintenanceData);
        const createdMaintenance = await api.post<any>('/maintenance', backendData);
        return transformMaintenanceData(createdMaintenance);
    },

    // Update maintenance record
    updateMaintenance: async (id: string, maintenanceData: Partial<Maintenance> | { deleted_at: any }): Promise<Maintenance> => {
        const backendData = transformToBackendMaintenanceData(maintenanceData);
        const updatedMaintenance = await api.patch<any>(`/maintenance/${id}`, backendData);
        return transformMaintenanceData(updatedMaintenance);
    },

    // Delete maintenance record
    deleteMaintenance: (id: string): Promise<void> => api.delete<void>(`/maintenance/${id}`),

    // Get completed maintenance
    getCompletedMaintenance: async (): Promise<Maintenance[]> => {
        const backendMaintenance = await api.get<any[]>('/maintenance?status=Completed');
        return backendMaintenance.map(transformMaintenanceData);
    },

    // Get scheduled maintenance
    getScheduledMaintenance: async (): Promise<Maintenance[]> => {
        const backendMaintenance = await api.get<any[]>('/maintenance?status=Scheduled');
        return backendMaintenance.map(transformMaintenanceData);
    },

    // Get all maintenance records including deleted ones (for admin purposes)
    getAllMaintenanceIncludingDeleted: async (): Promise<Maintenance[]> => {
        try {
            // First try the /maintenance/all endpoint
            const backendMaintenance = await api.get<any[]>('/deletedmaintenance');
            return backendMaintenance.map(transformMaintenanceData);
        } catch (error) {
            // If the endpoint doesn't exist, fallback to regular endpoint
            // and let the frontend handle filtering
            console.log('Fallback to regular maintenance endpoint for deleted records');
            const backendMaintenance = await api.get<any[]>('/maintenance');
            return backendMaintenance.map(transformMaintenanceData);
        }
    },
};

// Helper function to transform backend insurance data to frontend format
const transformInsuranceData = (backendInsurance: any): Insurance => {
    return {
        id: backendInsurance.vi_id?.toString() || '',
        vehicle_id: backendInsurance.vi_vehicle_id?.toString() || '',
        policy_number: backendInsurance.vi_policy_number || '',
        insurer: backendInsurance.vi_insurer || '',
        policy_type: backendInsurance.vi_policy_type || '',
        start_date: backendInsurance.vi_start_date || '',
        end_date: backendInsurance.vi_end_date || '',
        payment: backendInsurance.vi_payment || 0,
        issue_date: backendInsurance.vi_issue_date || '',
        premium_amount: backendInsurance.vi_premium_amount || 0,
        has_insurance: backendInsurance.vi_has_insurance || false,
        created_at: backendInsurance.vi_created_at || ''
    };
};

// Helper function to transform frontend insurance data to backend format
const transformToBackendInsuranceData = (frontendInsurance: any): any => {
    const result: any = {};
    
    if (frontendInsurance.vehicle_id !== undefined) result.vehicle_id = frontendInsurance.vehicle_id;
    if (frontendInsurance.policy_number !== undefined) result.policy_number = frontendInsurance.policy_number;
    if (frontendInsurance.insurer !== undefined) result.insurer = frontendInsurance.insurer;
    if (frontendInsurance.policy_type !== undefined) result.policy_type = frontendInsurance.policy_type;
    if (frontendInsurance.start_date !== undefined) result.start_date = frontendInsurance.start_date;
    if (frontendInsurance.end_date !== undefined) result.end_date = frontendInsurance.end_date;
    if (frontendInsurance.payment !== undefined) result.payment = frontendInsurance.payment;
    if (frontendInsurance.issue_date !== undefined) result.issue_date = frontendInsurance.issue_date;
    if (frontendInsurance.premium_amount !== undefined) result.premium_amount = frontendInsurance.premium_amount;
    if (frontendInsurance.has_insurance !== undefined) result.has_insurance = frontendInsurance.has_insurance;
    
    return result;
};

// Insurance API methods
export const insuranceAPI = {
    // Get all insurance records
    getAllInsurance: async (): Promise<Insurance[]> => {
        const backendInsurance = await api.get<any[]>('/insurance');
        return backendInsurance.map(transformInsuranceData);
    },

    // Get insurance by ID
    getInsuranceById: async (id: string): Promise<Insurance> => {
        const backendInsurance = await api.get<any>(`/insurance/${id}`);
        return transformInsuranceData(backendInsurance);
    },

    // Get insurance by vehicle ID
    getInsuranceByVehicle: async (vehicleId: string): Promise<Insurance[]> => {
        const backendInsurance = await api.get<any[]>(`/insurance/vehicle/${vehicleId}`);
        return backendInsurance.map(transformInsuranceData);
    },

    // Create new insurance record
    createInsurance: async (insuranceData: Omit<Insurance, 'id' | 'created_at'>): Promise<Insurance> => {
        const backendData = transformToBackendInsuranceData(insuranceData);
        const createdInsurance = await api.post<any>('/insurance', backendData);
        return transformInsuranceData(createdInsurance);
    },

    // Update insurance record
    updateInsurance: async (id: string, insuranceData: Partial<Insurance>): Promise<Insurance> => {
        const backendData = transformToBackendInsuranceData(insuranceData);
        const updatedInsurance = await api.put<any>(`/insurance/${id}`, backendData);
        return transformInsuranceData(updatedInsurance);
    },

    // Partially update insurance record
    patchInsurance: async (id: string, insuranceData: Partial<Insurance>): Promise<Insurance> => {
        const backendData = transformToBackendInsuranceData(insuranceData);
        const updatedInsurance = await api.patch<any>(`/insurance/${id}`, backendData);
        return transformInsuranceData(updatedInsurance);
    },

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

    // Patch driver
    patchDriver: (id: string, driverData: Partial<Driver>): Promise<Driver> => api.patch<Driver>(`/drivers/${id}`, driverData),

    // Restore soft deleted driver
    restoreDriver: (id: string): Promise<Driver> => api.patch<Driver>(`/drivers/${id}/restore`, { deleted_at: null }),

    // Hard delete driver (for admin purposes)
    deleteDriver: (id: string): Promise<void> => api.delete<void>(`/drivers/${id}`),

    // Get all drivers including soft deleted (for admin purposes)
    getAllDriversIncludingDeleted: (): Promise<Driver[]> => api.get<Driver[]>('/drivers/all'),

    // Assign vehicle to driver
    assignVehicleToDriver: (driverId: string, vehicleId: string): Promise<any> => api.post<any>(`/drivers/${driverId}/assign-vehicle`, { vehicleId }),

    // Assign multiple vehicles to driver
    assignMultipleVehiclesToDriver: (driverId: string, vehicleIds: string[]): Promise<any> => api.post<any>(`/drivers/${driverId}/assign-vehicles`, { vehicleIds }),

    // Unassign vehicle from driver
    unassignVehicleFromDriver: (driverId: string, vehicleId: string): Promise<any> => api.delete<any>(`/drivers/${driverId}/unassign-vehicle/${vehicleId}`),

    // Get driver assigned vehicles
    getDriverAssignedVehicles: (driverId: string): Promise<any[]> => api.get<any[]>(`/drivers/${driverId}/assigned-vehicles`),
};

// Helper function to transform backend claims data to frontend format
const transformClaimsData = (backendClaim: any): Claim => {
    return {
        id: backendClaim.vc_id_pk?.toString() || '',
        registration_number: backendClaim.registration_number || '',
        vehicle_id: backendClaim.vc_vehicle_id_fk?.toString() || '',
        claim_date: backendClaim.vc_claim_date || '',
        claim_amount: backendClaim.vc_claim_amount || 0,
        reason: backendClaim.vc_reason || '',
        status: backendClaim.vc_status || '',
        created_at: backendClaim.vc_created_at || ''
    };
};

// Helper function to transform frontend claims data to backend format
const transformToBackendClaimsData = (frontendClaim: any): any => {
    const result: any = {};
    
    if (frontendClaim.vehicle_id !== undefined) result.vehicle_id = frontendClaim.vehicle_id;
    if (frontendClaim.claim_date !== undefined) result.claim_date = frontendClaim.claim_date;
    if (frontendClaim.claim_amount !== undefined) result.claim_amount = frontendClaim.claim_amount;
    if (frontendClaim.reason !== undefined) result.reason = frontendClaim.reason;
    if (frontendClaim.status !== undefined) result.status = frontendClaim.status;
    if (frontendClaim.registration_number !== undefined) result.registration_number = frontendClaim.registration_number;
    
    return result;
};

export const claimsAPI = {
    
  getAllClaims: async (): Promise<Claim[]> => {
    const backendClaims = await api.get<any[]>('/claims');
    return backendClaims.map(transformClaimsData);
  },

  getClaimById: async (id: string): Promise<Claim> => {
    const backendClaim = await api.get<any>(`/claims/${id}`);
    return transformClaimsData(backendClaim);
  },

  getClaimsByInsurance: async (insuranceId: string): Promise<Claim[]> => {
    const backendClaims = await api.get<any[]>(`/claims/insurance/${insuranceId}`);
    return backendClaims.map(transformClaimsData);
  },

  getClaimsByVehicle: async (vehicleId: string): Promise<Claim[]> => {
    const backendClaims = await api.get<any[]>(`/claims/vehicle/${vehicleId}`);
    return backendClaims.map(transformClaimsData);
  },

  createClaim: async (claimData: any): Promise<Claim> => {
    const backendData = transformToBackendClaimsData(claimData);
    const createdClaim = await api.post<any>('/claims', backendData);
    return transformClaimsData(createdClaim);
  },

  updateClaim: async (id: string, claimData: Partial<Claim>): Promise<Claim> => {
    const backendData = transformToBackendClaimsData(claimData);
    const updatedClaim = await api.put<any>(`/claims/${id}`, backendData);
    return transformClaimsData(updatedClaim);
  },

  patchClaim: async (id: string, claimData: Partial<Claim>): Promise<Claim> => {
    const backendData = transformToBackendClaimsData(claimData);
    const updatedClaim = await api.patch<any>(`/claims/${id}`, backendData);
    return transformClaimsData(updatedClaim);
  },

  deleteClaim: (id: string): Promise<void> => api.delete<void>(`/claims/${id}`),
};


// Export types for use in other files
export type { Vehicle, Expense, DashboardStats, Driver, Maintenance, Insurance,Claim };
export type DriverWithAssignedVehicles = Driver & { assignedVehicleIds?: string[]; };