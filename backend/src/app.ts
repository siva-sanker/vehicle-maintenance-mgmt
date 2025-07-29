import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import vehicleRoutes from './routes/vehicleRoutes';
import insuranceRoutes from './routes/insuranceRoutes';
import { initDatabase } from './config/database';

const YAML = require('yamljs');
const app = express();
const swaggerDocument = YAML.load('./src/api/openapi.yaml');

// Initialize database connection
initDatabase().then(() => {
    console.log('Database initialized successfully');
}).catch((error) => {
    console.error('Failed to initialize database:', error);
    process.exit(1);
});

app.use(cors());
app.use(express.json());

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
app.use('/api', vehicleRoutes);
app.use('/api', insuranceRoutes);

app.get('/api/health', (req, res) => {
    res.json({ status: 'Backend is running' });
});

export default app; 