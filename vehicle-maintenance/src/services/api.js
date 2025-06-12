// API Service for Vehicle Maintenance Management System

// Configuration for different environments
const getBaseURL = () => {
    // Check if we're in development or production
    if (import.meta.env.DEV) {
        // In development, use network IP for cross-system access
        return 'http://192.168.50.154:4000';
    } else {
        // In production, use the actual server URL
        // You can set this via environment variable
        return import.meta.env.VITE_API_URL || 'http://localhost:4000';
    }
};

const BASE_URL = getBaseURL();

// Generic API methods
const api = {
    // GET request
    async get(endpoint) {
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
                message: error.message,
                stack: error.stack,
                endpoint: endpoint,
                baseURL: BASE_URL
            });
            throw error;
        }
    },

    // POST request
    async post(endpoint, data) {
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
    async put(endpoint, data) {
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
    async patch(endpoint, data) {
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
    async delete(endpoint) {
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
    // Get all vehicles
    getAllVehicles: () => api.get('/vehicles'),

    // Get vehicle by ID
    getVehicleById: (id) => api.get(`/vehicles/${id}`),

    // Create new vehicle
    createVehicle: (vehicleData) => api.post('/vehicles', vehicleData),

    // Update vehicle
    updateVehicle: (id, vehicleData) => api.put(`/vehicles/${id}`, vehicleData),

    // Partially update vehicle
    patchVehicle: (id, vehicleData) => api.patch(`/vehicles/${id}`, vehicleData),

    // Delete vehicle
    deleteVehicle: (id) => api.delete(`/vehicles/${id}`),

    // Get vehicles by search term
    searchVehicles: (searchTerm) => api.get(`/vehicles?q=${searchTerm}`),

    // Get vehicles with insurance
    getVehiclesWithInsurance: async () => {
        try {
            const allVehicles = await api.get('/vehicles');
            // Filter vehicles that have an insurance object
            return allVehicles.filter(vehicle => vehicle.insurance && typeof vehicle.insurance === 'object');
        } catch (error) {
            console.error('Error getting vehicles with insurance:', error);
            throw error;
        }
    },

    // Get vehicles without insurance
    getVehiclesWithoutInsurance: async () => {
        try {
            const allVehicles = await api.get('/vehicles');
            // Filter vehicles that don't have an insurance object
            return allVehicles.filter(vehicle => !vehicle.insurance || typeof vehicle.insurance !== 'object');
        } catch (error) {
            console.error('Error getting vehicles without insurance:', error);
            throw error;
        }
    },
};

// Maintenance API methods
export const maintenanceAPI = {
    // Get all maintenance records
    getAllMaintenance: () => api.get('/maintenance'),

    // Get maintenance by ID
    getMaintenanceById: (id) => api.get(`/maintenance/${id}`),

    // Get maintenance by vehicle ID
    getMaintenanceByVehicle: (vehicleId) => api.get(`/maintenance?vehicleId=${vehicleId}`),

    // Create new maintenance record
    createMaintenance: (maintenanceData) => api.post('/maintenance', maintenanceData),

    // Update maintenance record
    updateMaintenance: (id, maintenanceData) => api.put(`/maintenance/${id}`, maintenanceData),

    // Delete maintenance record
    deleteMaintenance: (id) => api.delete(`/maintenance/${id}`),

    // Get completed maintenance
    getCompletedMaintenance: () => api.get('/maintenance?status=Completed'),

    // Get scheduled maintenance
    getScheduledMaintenance: () => api.get('/maintenance?status=Scheduled'),
};

// Fuel Logs API methods
export const fuelLogsAPI = {
    // Get all fuel logs
    getAllFuelLogs: () => api.get('/fuelLogs'),

    // Get fuel log by ID
    getFuelLogById: (id) => api.get(`/fuelLogs/${id}`),

    // Get fuel logs by vehicle ID
    getFuelLogsByVehicle: (vehicleId) => api.get(`/fuelLogs?vehicleId=${vehicleId}`),

    // Create new fuel log
    createFuelLog: (fuelLogData) => api.post('/fuelLogs', fuelLogData),

    // Update fuel log
    updateFuelLog: (id, fuelLogData) => api.put(`/fuelLogs/${id}`, fuelLogData),

    // Delete fuel log
    deleteFuelLog: (id) => api.delete(`/fuelLogs/${id}`),

    // Get fuel logs by date range
    getFuelLogsByDateRange: (startDate, endDate) =>
        api.get(`/fuelLogs?fuelDate_gte=${startDate}&fuelDate_lte=${endDate}`),
};

// Expenses API methods
export const expensesAPI = {
    // Get all expenses
    getAllExpenses: () => api.get('/expenses'),

    // Get expense by ID
    getExpenseById: (id) => api.get(`/expenses/${id}`),

    // Get expenses by vehicle ID
    getExpensesByVehicle: (vehicleId) => api.get(`/expenses?vehicleId=${vehicleId}`),

    // Create new expense
    createExpense: (expenseData) => api.post('/expenses', expenseData),

    // Update expense
    updateExpense: (id, expenseData) => api.put(`/expenses/${id}`, expenseData),

    // Delete expense
    deleteExpense: (id) => api.delete(`/expenses/${id}`),

    // Get expenses by category
    getExpensesByCategory: (category) => api.get(`/expenses?category=${category}`),

    // Get expenses by date range
    getExpensesByDateRange: (startDate, endDate) =>
        api.get(`/expenses?expenseDate_gte=${startDate}&expenseDate_lte=${endDate}`),
};

// Service History API methods
export const serviceHistoryAPI = {
    // Get all service history
    getAllServiceHistory: () => api.get('/serviceHistory'),

    // Get service history by ID
    getServiceHistoryById: (id) => api.get(`/serviceHistory/${id}`),

    // Get service history by vehicle ID
    getServiceHistoryByVehicle: (vehicleId) => api.get(`/serviceHistory?vehicleId=${vehicleId}`),

    // Create new service history record
    createServiceHistory: (serviceData) => api.post('/serviceHistory', serviceData),

    // Update service history
    updateServiceHistory: (id, serviceData) => api.put(`/serviceHistory/${id}`, serviceData),

    // Delete service history
    deleteServiceHistory: (id) => api.delete(`/serviceHistory/${id}`),

    // Get completed services
    getCompletedServices: () => api.get('/serviceHistory?status=Completed'),
};

// Upcoming Services API methods
export const upcomingServicesAPI = {
    // Get all upcoming services
    getAllUpcomingServices: () => api.get('/upcomingServices'),

    // Get upcoming service by ID
    getUpcomingServiceById: (id) => api.get(`/upcomingServices/${id}`),

    // Get upcoming services by vehicle ID
    getUpcomingServicesByVehicle: (vehicleId) => api.get(`/upcomingServices?vehicleId=${vehicleId}`),

    // Create new upcoming service
    createUpcomingService: (serviceData) => api.post('/upcomingServices', serviceData),

    // Update upcoming service
    updateUpcomingService: (id, serviceData) => api.put(`/upcomingServices/${id}`, serviceData),

    // Delete upcoming service
    deleteUpcomingService: (id) => api.delete(`/upcomingServices/${id}`),

    // Get high priority services
    getHighPriorityServices: () => api.get('/upcomingServices?priority=High'),

    // Get services by date range
    getServicesByDateRange: (startDate, endDate) =>
        api.get(`/upcomingServices?serviceDate_gte=${startDate}&serviceDate_lte=${endDate}`),
};

// Claims API methods (for insurance claims)
export const claimsAPI = {
    // Get all vehicles with claims
    getAllVehiclesWithClaims: () => api.get('/vehicles'),

    // Get claims for a specific vehicle
    getClaimsByVehicle: (vehicleId) => api.get(`/vehicles/${vehicleId}`),

    // Add claim to vehicle
    addClaimToVehicle: (vehicleId, claimData) => {
        return api.get(`/vehicles/${vehicleId}`)
            .then(vehicle => {
                const updatedClaims = vehicle.claims ? [...vehicle.claims, claimData] : [claimData];
                return api.patch(`/vehicles/${vehicleId}`, { claims: updatedClaims });
            });
    },

    // Update claim status
    updateClaimStatus: (vehicleId, claimIndex, newStatus) => {
        return api.get(`/vehicles/${vehicleId}`)
            .then(vehicle => {
                const updatedClaims = [...vehicle.claims];
                updatedClaims[claimIndex].status = newStatus;
                return api.patch(`/vehicles/${vehicleId}`, { claims: updatedClaims });
            });
    },
};

// Dashboard API methods for aggregated data
export const dashboardAPI = {
    // Get dashboard statistics
    getDashboardStats: async () => {
        try {
            const [vehicles, maintenance, expenses, fuelLogs] = await Promise.all([
                api.get('/vehicles'),
                api.get('/maintenance'),
                api.get('/expenses'),
                api.get('/fuelLogs'),
            ]);

            const totalVehicles = vehicles.length;
            const vehiclesWithInsurance = vehicles.filter(v => v.insurance?.hasInsurance).length;
            const totalMaintenanceCost = maintenance.reduce((sum, m) => sum + m.cost, 0);
            const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
            const totalFuelCost = fuelLogs.reduce((sum, f) => sum + f.cost, 0);
            const upcomingServices = await api.get('/upcomingServices');
            const highPriorityServices = upcomingServices.filter(s => s.priority === 'High').length;

            return {
                totalVehicles,
                vehiclesWithInsurance,
                vehiclesWithoutInsurance: totalVehicles - vehiclesWithInsurance,
                totalMaintenanceCost,
                totalExpenses,
                totalFuelCost,
                totalCost: totalMaintenanceCost + totalExpenses + totalFuelCost,
                upcomingServicesCount: upcomingServices.length,
                highPriorityServicesCount: highPriorityServices,
            };
        } catch (error) {
            console.error('Dashboard Stats Error:', error);
            throw error;
        }
    },

    // Get monthly expenses
    getMonthlyExpenses: async (year, month) => {
        try {
            const startDate = `${year}-${month.toString().padStart(2, '0')}-01`;
            const endDate = `${year}-${month.toString().padStart(2, '0')}-31`;

            const expenses = await api.get(`/expenses?expenseDate_gte=${startDate}&expenseDate_lte=${endDate}`);
            const fuelLogs = await api.get(`/fuelLogs?fuelDate_gte=${startDate}&fuelDate_lte=${endDate}`);

            const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
            const totalFuelCost = fuelLogs.reduce((sum, f) => sum + f.cost, 0);

            return {
                month: month,
                year: year,
                totalExpenses,
                totalFuelCost,
                totalCost: totalExpenses + totalFuelCost,
                expensesCount: expenses.length,
                fuelLogsCount: fuelLogs.length,
            };
        } catch (error) {
            console.error('Monthly Expenses Error:', error);
            throw error;
        }
    },
};

export default api; 