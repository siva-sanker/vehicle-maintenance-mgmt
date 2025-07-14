import express from 'express';
import cors from 'cors';
import router from './routes/vehicleRoutes';

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

app.get('/', (_req, res) => {
  res.send('Vehicle Maintenance Backend Running');
});

app.use('/api', router);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('hello from the other side');
  
});