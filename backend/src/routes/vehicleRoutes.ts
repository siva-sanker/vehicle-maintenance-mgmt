import { Router } from 'express';
import {
    getVehicles,
    getAllVehicles,
    getVehicleById,
    createVehicle,
    updateVehicle,
    patchVehicle,
    deleteVehicle,
    searchVehicles,
    softDeleteVehicle,
    restoreVehicle
} from '../controllers/vehicleController';
import {
    getDrivers,
    getAllDrivers,
    getDriverById,
    createDriver,
    updateDriver,
    patchDriver,
    // deleteDriver,
    // softDeleteDriver,
    restoreDriver,
    assignVehicleToDriver,
    toggleAssignVehicleToDriver,
    getDriverAssignedVehicles
} from '../controllers/driverController';
import {
    getMaintenance,
    getMaintenanceById,
    getMaintenanceByVehicle,
    createMaintenance,
    updateMaintenance,
    patchMaintenance,
    deleteMaintenance,
    getCompletedMaintenance,
    getScheduledMaintenance,
    getDeletedMaintenance
} from '../controllers/maintenanceController';

import {
    getClaims,
    getClaimsByVehicleId,
    createClaim
} from '../controllers/claimsController';

import { getAssignedDrivers } from '../controllers/assignDriverController';

const router = Router();

// Vehicle routes
router.get('/vehicles', getVehicles);
router.get('/vehicles/all', getAllVehicles);
router.get('/vehicles/:id', getVehicleById);
router.post('/vehicles', createVehicle);
router.put('/vehicles/:id', updateVehicle);
router.patch('/vehicles/:id', patchVehicle);
router.delete('/vehicles/:id', deleteVehicle);
router.get('/vehicles/search', searchVehicles);
router.patch('/vehicles/:id/soft-delete', softDeleteVehicle);
router.patch('/vehicles/:id/restore', restoreVehicle);

// Driver routes
router.get('/drivers', getDrivers);
router.get('/alldrivers', getAllDrivers);
router.get('/drivers/:id', getDriverById);
router.post('/driver', createDriver);
router.put('/drivers/:id', updateDriver);
router.patch('/drivers/:id', patchDriver);
router.patch('/drivers/:id/restore', restoreDriver);
router.post('/drivers/:driverId/assign-vehicles', assignVehicleToDriver);
router.delete('/drivers/:driverId/unassign-vehicle/:vehicleId', toggleAssignVehicleToDriver);
router.get('/drivers/:driverId/assigned-vehicles', getDriverAssignedVehicles);
// router.delete('/drivers/:id', deleteDriver);
// router.patch('/drivers/:id/soft-delete', softDeleteDriver);

// Maintenance routes
router.get('/maintenance', getMaintenance);
router.get('/maintenance/:id', getMaintenanceById);
router.get('/maintenance/vehicle/:vehicleId', getMaintenanceByVehicle);
router.post('/maintenance', createMaintenance);
router.put('/maintenance/:id', updateMaintenance);
router.patch('/maintenance/:id', patchMaintenance);
router.delete('/maintenance/:id', deleteMaintenance);
router.get('/maintenance/completed', getCompletedMaintenance);
router.get('/maintenance/scheduled', getScheduledMaintenance);
router.get('/deletedmaintenance',getDeletedMaintenance);

router.get('/claims', getClaims);
router.get('/claims/vehicle/:vehicleId', getClaimsByVehicleId);
router.post('/claims', createClaim);

router.get('/assigned-drivers', getAssignedDrivers);

export default router; 