import { Router } from 'express';
import {
    getInsurance,
    getInsuranceById,
    getInsuranceByVehicle,
    createInsurance,
    updateInsurance,
    patchInsurance,
    deleteInsurance
} from '../controllers/insuranceController';

const router = Router();

// Insurance routes
router.get('/insurance', getInsurance);
router.get('/insurance/:id', getInsuranceById);
router.get('/insurance/vehicle/:vehicleId', getInsuranceByVehicle);
router.post('/insurance', createInsurance);
router.put('/insurance/:id', updateInsurance);
router.patch('/insurance/:id', patchInsurance);
router.delete('/insurance/:id', deleteInsurance);

export default router; 