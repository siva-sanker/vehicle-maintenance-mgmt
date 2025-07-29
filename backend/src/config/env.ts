// Environment configuration for the backend
// You can override these values by setting environment variables

export const config = {
    // Database Configuration
    database: {
        user: process.env.DB_USER || 'sa',
        password: process.env.DB_PASSWORD || 'your_password',
        server: process.env.DB_SERVER || 'localhost',
        database: process.env.DB_NAME || 'vehicleMaintenance',
        port: parseInt(process.env.DB_PORT || '1433', 10),
        options: {
            encrypt: false,
            trustServerCertificate: true,
        }
    },

    // Server Configuration
    server: {
        port: parseInt(process.env.PORT || '3001', 10),
        nodeEnv: process.env.NODE_ENV || 'development'
    }
};

export default config; 