import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import router from './routes/vehicleRoutes';

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.get('/', (_req, res) => {
  res.send('Vehicle Maintenance Backend Running');
});

app.use('/api/vehicles', router);

mongoose.connect('mongodb://localhost:5000/vehicle-maintenance')
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err);
  });