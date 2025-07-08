import { Router } from 'express';
import Vehicle from '../models/Vehicle';

const router = Router();

router.get('/', async (_req, res) => {
  const vehicles = await Vehicle.find();
  res.json(vehicles);
});

// Add more CRUD routes as needed

export default router;