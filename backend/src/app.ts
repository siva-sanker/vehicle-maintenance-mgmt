import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import vehicleRoutes from './routes/vehicleRoutes';

const YAML=require('yamljs');
const app = express();
const swaggerDocument = YAML.load('./src/api/openapi.yaml');
app.use(cors());
app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/api', vehicleRoutes);

app.get('/api/health', (req, res) => {
    res.json({ status: 'Backend is running' });
});

export default app; 