// backend/src/data/db.ts
// import 'dotenv/config';
// import sql from 'mssql';

// const config = {
//     user: process.env.DB_USER,
//     password: process.env.DB_PASSWORD,
//     server: process.env.DB_SERVER,
//     database: process.env.DB_NAME,
//     options: {
//         encrypt: process.env.DB_ENCRYPT === 'true',
//         trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true',
//     },
// };

// export const poolPromise = new sql.ConnectionPool(config)
//     .connect()
//     .then(pool => {
//         console.log('Connected to MSSQL');
//         return pool;
//     })
//     .catch(err => console.log('Database Connection Failed! Bad Config: ', err));
