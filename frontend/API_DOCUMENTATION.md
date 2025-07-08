# Vehicle Maintenance Management System - Mock API Documentation

## Overview

This document describes the mock API implementation for the Vehicle Maintenance Management System. The API is built using JSON Server and provides comprehensive endpoints for managing vehicles, maintenance, fuel logs, expenses, and more.

## Getting Started

### 1. Start the Mock API Server

```bash
npm run server
```

This will start the JSON Server on `http://localhost:4000` and watch the `db.json` file for changes.

### 2. Available Endpoints

The API provides the following main endpoints:

- `/vehicles` - Vehicle management
- `/maintenance` - Maintenance records
- `/fuelLogs` - Fuel consumption logs
- `/expenses` - Expense tracking
- `/serviceHistory` - Service history records
- `/upcomingServices` - Scheduled services

## API Endpoints

### Vehicles (`/vehicles`)

#### GET `/vehicles`
Get all vehicles
```javascript
const vehicles = await vehicleAPI.getAllVehicles();
```

#### GET `/vehicles/:id`
Get a specific vehicle by ID
```javascript
const vehicle = await vehicleAPI.getVehicleById('a4e4');
```

#### POST `/vehicles`
Create a new vehicle
```javascript
const newVehicle = {
  make: "Toyota",
  model: "Camry",
  registrationNumber: "KL01AB1234",
  purchaseDate: "2023-01-15",
  purchasePrice: "2500000",
  fuelType: "Petrol",
  engineNumber: "toyota123xyz",
  chassisNumber: "toyota456abc",
  kilometers: "15000",
  color: "silver",
  owner: "John Doe",
  phone: "9876543210",
  address: "Kerala, India",
  insurance: {
    policyNumber: "POL123456",
    insurer: "ICICI Lombard",
    policytype: "Comprehensive",
    startDate: "2024-01-01",
    endDate: "2024-12-31",
    payment: "card",
    issueDate: "2023-12-15",
    premiumAmount: "15000",
    hasInsurance: true
  }
};

const createdVehicle = await vehicleAPI.createVehicle(newVehicle);
```

#### PUT `/vehicles/:id`
Update a vehicle completely
```javascript
const updatedVehicle = await vehicleAPI.updateVehicle('a4e4', vehicleData);
```

#### PATCH `/vehicles/:id`
Partially update a vehicle
```javascript
const patchedVehicle = await vehicleAPI.patchVehicle('a4e4', { kilometers: "70000" });
```

#### DELETE `/vehicles/:id`
Delete a vehicle
```javascript
await vehicleAPI.deleteVehicle('a4e4');
```

### Maintenance (`/maintenance`)

#### GET `/maintenance`
Get all maintenance records
```javascript
const maintenance = await maintenanceAPI.getAllMaintenance();
```

#### GET `/maintenance?vehicleId=:vehicleId`
Get maintenance records for a specific vehicle
```javascript
const vehicleMaintenance = await maintenanceAPI.getMaintenanceByVehicle('a4e4');
```

#### POST `/maintenance`
Create a new maintenance record
```javascript
const newMaintenance = {
  vehicleId: "a4e4",
  serviceDate: "2024-12-25",
  serviceType: "Regular Service",
  description: "Oil change, filter replacement, brake inspection",
  cost: 3500,
  nextServiceDate: "2025-06-25",
  serviceCenter: "Toyota Service Center",
  technician: "John Doe",
  status: "Completed",
  odometerReading: 65000
};

const createdMaintenance = await maintenanceAPI.createMaintenance(newMaintenance);
```

### Fuel Logs (`/fuelLogs`)

#### GET `/fuelLogs`
Get all fuel logs
```javascript
const fuelLogs = await fuelLogsAPI.getAllFuelLogs();
```

#### GET `/fuelLogs?vehicleId=:vehicleId`
Get fuel logs for a specific vehicle
```javascript
const vehicleFuelLogs = await fuelLogsAPI.getFuelLogsByVehicle('a4e4');
```

#### POST `/fuelLogs`
Create a new fuel log
```javascript
const newFuelLog = {
  vehicleId: "a4e4",
  fuelDate: "2024-12-25",
  fuelType: "Diesel",
  quantity: 45,
  cost: 2250,
  odometerReading: 65500,
  fuelStation: "Indian Oil Station",
  location: "Trivandrum"
};

const createdFuelLog = await fuelLogsAPI.createFuelLog(newFuelLog);
```

### Expenses (`/expenses`)

#### GET `/expenses`
Get all expenses
```javascript
const expenses = await expensesAPI.getAllExpenses();
```

#### GET `/expenses?vehicleId=:vehicleId`
Get expenses for a specific vehicle
```javascript
const vehicleExpenses = await expensesAPI.getExpensesByVehicle('a4e4');
```

#### POST `/expenses`
Create a new expense
```javascript
const newExpense = {
  vehicleId: "a4e4",
  expenseDate: "2024-12-25",
  category: "Maintenance",
  description: "Regular service and oil change",
  amount: 3500,
  paymentMethod: "Card",
  receiptNumber: "RCP001239"
};

const createdExpense = await expensesAPI.createExpense(newExpense);
```

### Service History (`/serviceHistory`)

#### GET `/serviceHistory`
Get all service history records
```javascript
const serviceHistory = await serviceHistoryAPI.getAllServiceHistory();
```

#### GET `/serviceHistory?vehicleId=:vehicleId`
Get service history for a specific vehicle
```javascript
const vehicleServiceHistory = await serviceHistoryAPI.getServiceHistoryByVehicle('a4e4');
```

### Upcoming Services (`/upcomingServices`)

#### GET `/upcomingServices`
Get all upcoming services
```javascript
const upcomingServices = await upcomingServicesAPI.getAllUpcomingServices();
```

#### GET `/upcomingServices?priority=High`
Get high priority upcoming services
```javascript
const highPriorityServices = await upcomingServicesAPI.getHighPriorityServices();
```

## Advanced Queries

### Filtering

JSON Server supports various filtering options:

```javascript
// Get vehicles with insurance
const insuredVehicles = await vehicleAPI.getVehiclesWithInsurance();

// Get completed maintenance
const completedMaintenance = await maintenanceAPI.getCompletedMaintenance();

// Get expenses by category
const maintenanceExpenses = await expensesAPI.getExpensesByCategory('Maintenance');
```

### Date Range Queries

```javascript
// Get fuel logs for a date range
const fuelLogs = await fuelLogsAPI.getFuelLogsByDateRange('2024-12-01', '2024-12-31');

// Get expenses for a date range
const expenses = await expensesAPI.getExpensesByDateRange('2024-12-01', '2024-12-31');
```

### Search

```javascript
// Search vehicles by registration number, make, or model
const searchResults = await vehicleAPI.searchVehicles('toyota');
```

## Dashboard API

### Get Dashboard Statistics

```javascript
const dashboardStats = await dashboardAPI.getDashboardStats();
// Returns:
// {
//   totalVehicles: 7,
//   vehiclesWithInsurance: 6,
//   vehiclesWithoutInsurance: 1,
//   totalMaintenanceCost: 22500,
//   totalExpenses: 16700,
//   totalFuelCost: 12150,
//   totalCost: 51350,
//   upcomingServicesCount: 5,
//   highPriorityServicesCount: 2
// }
```

### Get Monthly Expenses

```javascript
const monthlyExpenses = await dashboardAPI.getMonthlyExpenses(2024, 12);
// Returns:
// {
//   month: 12,
//   year: 2024,
//   totalExpenses: 16700,
//   totalFuelCost: 12150,
//   totalCost: 28850,
//   expensesCount: 5,
//   fuelLogsCount: 5
// }
```

## Claims Management

### Add Claim to Vehicle

```javascript
const newClaim = {
  claimDate: "2024-12-25",
  claimAmount: "15000",
  reason: "Accident damage",
  status: "Pending"
};

await claimsAPI.addClaimToVehicle('a4e4', newClaim);
```

### Update Claim Status

```javascript
await claimsAPI.updateClaimStatus('a4e4', 0, 'Approved');
```

## Error Handling

All API methods include proper error handling:

```javascript
try {
  const vehicles = await vehicleAPI.getAllVehicles();
  console.log('Vehicles:', vehicles);
} catch (error) {
  console.error('Error fetching vehicles:', error);
  // Handle error appropriately
}
```

## Data Structure

### Vehicle Object
```javascript
{
  id: "string",
  make: "string",
  model: "string",
  purchaseDate: "YYYY-MM-DD",
  registrationNumber: "string",
  purchasePrice: "string",
  fuelType: "string",
  engineNumber: "string",
  chassisNumber: "string",
  kilometers: "string",
  color: "string",
  owner: "string",
  phone: "string",
  address: "string",
  insurance: {
    policyNumber: "string",
    insurer: "string",
    policytype: "string",
    startDate: "YYYY-MM-DD",
    endDate: "YYYY-MM-DD",
    payment: "string",
    issueDate: "YYYY-MM-DD",
    premiumAmount: "string",
    hasInsurance: boolean
  },
  claims: [
    {
      claimDate: "YYYY-MM-DD",
      claimAmount: "string",
      reason: "string",
      status: "string"
    }
  ]
}
```

### Maintenance Object
```javascript
{
  id: "string",
  vehicleId: "string",
  serviceDate: "YYYY-MM-DD",
  serviceType: "string",
  description: "string",
  cost: number,
  nextServiceDate: "YYYY-MM-DD",
  serviceCenter: "string",
  technician: "string",
  status: "string",
  odometerReading: number
}
```

### Fuel Log Object
```javascript
{
  id: "string",
  vehicleId: "string",
  fuelDate: "YYYY-MM-DD",
  fuelType: "string",
  quantity: number,
  cost: number,
  odometerReading: number,
  fuelStation: "string",
  location: "string"
}
```

### Expense Object
```javascript
{
  id: "string",
  vehicleId: "string",
  expenseDate: "YYYY-MM-DD",
  category: "string",
  description: "string",
  amount: number,
  paymentMethod: "string",
  receiptNumber: "string"
}
```

## Usage Examples

### Complete CRUD Operations

```javascript
import { vehicleAPI, maintenanceAPI, fuelLogsAPI } from './services/api.js';

// Create a new vehicle
const newVehicle = await vehicleAPI.createVehicle(vehicleData);

// Add maintenance record
const maintenance = await maintenanceAPI.createMaintenance({
  vehicleId: newVehicle.id,
  serviceDate: "2024-12-25",
  serviceType: "Regular Service",
  cost: 3500
});

// Add fuel log
const fuelLog = await fuelLogsAPI.createFuelLog({
  vehicleId: newVehicle.id,
  fuelDate: "2024-12-25",
  fuelType: "Petrol",
  quantity: 40,
  cost: 3200
});

// Update vehicle kilometers
await vehicleAPI.patchVehicle(newVehicle.id, { kilometers: "20000" });

// Get all data for dashboard
const dashboardStats = await dashboardAPI.getDashboardStats();
```

## Notes

1. **Data Persistence**: All data is stored in `db.json` and persists between server restarts.
2. **Real-time Updates**: JSON Server automatically updates the database file when you make changes.
3. **CORS**: The server is configured to allow cross-origin requests from your React application.
4. **Validation**: Basic validation is handled by JSON Server, but you should implement additional validation in your application.
5. **Backup**: Consider backing up your `db.json` file regularly.

## Troubleshooting

### Common Issues

1. **Server not starting**: Make sure port 4000 is not in use by another application.
2. **CORS errors**: Ensure your React app is making requests to `http://localhost:4000`.
3. **Data not persisting**: Check that the `db.json` file is writable and not corrupted.

### Reset Database

To reset the database to its initial state, simply restart the server:

```bash
# Stop the server (Ctrl+C)
# Then restart
npm run server
```

The `db.json` file will be reloaded with the initial data. 