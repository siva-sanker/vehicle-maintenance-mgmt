# Database Setup Guide

## 🗄️ **Database Configuration**

This backend uses **Microsoft SQL Server** as the database. Follow these steps to set up your database connection.

### **1. Prerequisites**

- **SQL Server** installed and running (SQL Server Express, Developer, or Standard)
- **SQL Server Management Studio (SSMS)** or **Azure Data Studio** for database management
- **Node.js** and **npm** installed

### **2. Database Setup**

#### **Option A: Using SQL Server Management Studio**

1. **Open SQL Server Management Studio**
2. **Connect to your SQL Server instance**
3. **Create a new database:**
   ```sql
   CREATE DATABASE vehicleMaintenance;
   ```

#### **Option B: Using Azure Data Studio**

1. **Open Azure Data Studio**
2. **Connect to your SQL Server instance**
3. **Create a new database:**
   ```sql
   CREATE DATABASE vehicleMaintenance;
   ```

### **3. Configuration**

#### **Step 1: Update Database Configuration**

Edit `src/config/env.ts` with your database credentials:

```typescript
export const config = {
  database: {
    user: 'your_username',           // SQL Server username
    password: 'your_password',       // SQL Server password
    server: 'localhost',             // SQL Server hostname
    database: 'vehicleMaintenance',  // Database name
    port: 1433,                     // SQL Server port (default: 1433)
    options: {
      encrypt: false,                // Set to true for Azure
      trustServerCertificate: true,  // For development
    }
  },
  // ... rest of config
};
```

#### **Step 2: Common Configuration Examples**

**Local SQL Server Express:**
```typescript
database: {
  user: 'sa',
  password: 'your_password',
  server: 'localhost',
  database: 'vehicleMaintenance',
  port: 1433,
  options: {
    encrypt: false,
    trustServerCertificate: true,
  }
}
```

**SQL Server with Windows Authentication:**
```typescript
database: {
  user: '',  // Leave empty for Windows Auth
  password: '',  // Leave empty for Windows Auth
  server: 'localhost',
  database: 'vehicleMaintenance',
  port: 1433,
  options: {
    encrypt: false,
    trustServerCertificate: true,
    integratedSecurity: true,  // Enable Windows Auth
  }
}
```

**Azure SQL Database:**
```typescript
database: {
  user: 'your_azure_username',
  password: 'your_azure_password',
  server: 'your-server.database.windows.net',
  database: 'vehicleMaintenance',
  port: 1433,
  options: {
    encrypt: true,  // Required for Azure
    trustServerCertificate: false,
  }
}
```

### **4. Environment Variables (Optional)**

You can also use environment variables by creating a `.env` file in the backend directory:

```env
# Database Configuration
DB_USER=your_username
DB_PASSWORD=your_password
DB_SERVER=localhost
DB_NAME=vehicleMaintenance
DB_PORT=1433

# Server Configuration
PORT=3001
NODE_ENV=development
```

### **5. Testing the Connection**

#### **Step 1: Install Dependencies**
```bash
cd backend
npm install
```

#### **Step 2: Start the Server**
```bash
npm start
```

You should see output like:
```
Attempting to connect to database...
Database config: {
  server: 'localhost',
  database: 'vehicleMaintenance',
  port: 1433,
  user: 'your_username'
}
Connected to MSSQL database successfully
Database tables created/verified successfully
Database initialized successfully
Server is running on port 3001
```

### **6. Troubleshooting**

#### **Common Issues:**

1. **Connection Refused**
   - Check if SQL Server is running
   - Verify the server name and port
   - Ensure firewall allows connections

2. **Authentication Failed**
   - Verify username and password
   - Check if the user has access to the database
   - For Windows Auth, ensure `integratedSecurity: true`

3. **Database Not Found**
   - Create the database first
   - Check the database name in configuration

4. **Permission Denied**
   - Ensure the user has CREATE TABLE permissions
   - Grant necessary permissions to the database user

#### **SQL Server Services:**

**Windows:**
```cmd
# Check if SQL Server is running
services.msc
# Look for "SQL Server (MSSQLSERVER)" or "SQL Server (SQLEXPRESS)"
```

**Start SQL Server:**
```cmd
net start MSSQLSERVER
# or
net start MSSQL$SQLEXPRESS
```

### **7. Database Schema**

The application automatically creates these tables:

- **vehicles** - Vehicle information
- **drivers** - Driver information  
- **maintenance** - Maintenance records
- **insurance** - Insurance policies
- **claims** - Insurance claims
- **vehicle_locations** - Vehicle GPS locations

### **8. API Endpoints**

Once connected, your API will be available at:
- **Health Check:** `GET http://localhost:3001/api/health`
- **Vehicles:** `GET http://localhost:3001/api/vehicles`
- **Drivers:** `GET http://localhost:3001/api/drivers`
- **Maintenance:** `GET http://localhost:3001/api/maintenance`

### **9. Frontend Connection**

The frontend is already configured to connect to the backend at `http://localhost:3001/api`. No additional configuration needed.

### **10. Development Tips**

- **Use SQL Server Management Studio** to view and manage your data
- **Enable SQL Server Browser service** for easier connection
- **Use Windows Authentication** for development (more secure)
- **Check SQL Server logs** if you encounter issues

### **11. Production Considerations**

- **Use environment variables** for sensitive data
- **Enable encryption** for production databases
- **Use connection pooling** for better performance
- **Implement proper backup strategies**
- **Set up monitoring and logging**

---

## 🚀 **Quick Start**

1. **Install SQL Server** (if not already installed)
2. **Create database:** `CREATE DATABASE vehicleMaintenance;`
3. **Update config:** Edit `src/config/env.ts` with your credentials
4. **Install dependencies:** `npm install`
5. **Start server:** `npm start`
6. **Test connection:** Visit `http://localhost:3001/api/health`

Your database is now connected and ready to use! 🎉 