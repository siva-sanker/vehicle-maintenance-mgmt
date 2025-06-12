# Network Setup Guide for Vehicle Maintenance API

## 🌐 **Network Access Configuration**

### **1. Enable Network Access**

Your JSON Server is now configured to accept connections from any network interface. The `--host 0.0.0.0` flag allows external connections.

### **2. Find Your Network IP Address**

#### **Windows:**
```bash
ipconfig
```
Look for "IPv4 Address" under your active network adapter.

#### **Mac/Linux:**
```bash
ifconfig
# or
ip addr show
```

### **3. Configure Different Systems**

#### **Option A: Environment Variables**
Create a `.env` file in your project root:
```env
# For local development
VITE_API_URL=http://localhost:4000

# For network access (replace with your actual IP)
VITE_API_URL=http://192.168.1.100:4000

# For production
VITE_API_URL=https://your-server.com/api
```

#### **Option B: Direct Configuration**
Update `src/services/api.js` with your network IP:
```javascript
const BASE_URL = 'http://192.168.1.100:4000'; // Your network IP
```

## 🔧 **Step-by-Step Network Setup**

### **Step 1: Start the Server**
```bash
npm run server
```

### **Step 2: Find Your IP Address**
```bash
# Windows
ipconfig

# Mac/Linux
ifconfig
```

### **Step 3: Configure Client Applications**
Update the API base URL in all client applications to use your network IP:
```
http://YOUR_IP_ADDRESS:4000
```

### **Step 4: Test Network Access**
From any device on the same network:
```bash
curl http://YOUR_IP_ADDRESS:4000/vehicles
```

## 📊 **Data Persistence Across Systems**

### **✅ YES - Data Will Be Stored and Displayed**

When you add new data from any system on the network:

1. **Data Storage**: All data is stored in the `db.json` file on the server machine
2. **Real-time Updates**: JSON Server automatically updates the file
3. **Network Synchronization**: All connected clients see the updated data
4. **Persistent Storage**: Data survives server restarts

### **Example Scenario:**
```
System A (Server): 192.168.1.100
System B (Client): 192.168.1.101
System C (Client): 192.168.1.102

1. System B adds a new vehicle → Data saved to db.json on System A
2. System C immediately sees the new vehicle → Real-time sync
3. System A restarts → Data still available from db.json
```

## 🔒 **Security Considerations**

### **Firewall Configuration**
Make sure port 4000 is open on your server:
```bash
# Windows Firewall
netsh advfirewall firewall add rule name="JSON Server" dir=in action=allow protocol=TCP localport=4000

# Linux (ufw)
sudo ufw allow 4000

# macOS
# Configure in System Preferences > Security & Privacy > Firewall
```

### **Network Security**
- Only allow trusted devices on your network
- Consider using HTTPS for production
- Implement authentication if needed

## 🚀 **Usage Examples**

### **From Different Systems**

#### **System A (Server - 192.168.1.100):**
```bash
npm run server
```

#### **System B (Client):**
```javascript
// Update API base URL
const BASE_URL = 'http://192.168.1.100:4000';

// Add new vehicle
const newVehicle = await vehicleAPI.createVehicle(vehicleData);
```

#### **System C (Client):**
```javascript
// Same base URL
const BASE_URL = 'http://192.168.1.100:4000';

// Immediately sees the vehicle added by System B
const vehicles = await vehicleAPI.getAllVehicles();
```

## 🔄 **Real-time Data Flow**

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   System A      │    │   System B      │    │   System C      │
│   (Server)      │    │   (Client)      │    │   (Client)      │
│                 │    │                 │    │                 │
│ db.json         │◄───┤ Add Vehicle     │    │ View Vehicles   │
│ (Data Store)    │    │                 │    │                 │
│                 │    │                 │    │                 │
│ JSON Server     │───►│ Real-time       │───►│ Real-time       │
│ (Port 4000)     │    │ Updates         │    │ Updates         │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 🛠 **Troubleshooting**

### **Common Issues:**

1. **Connection Refused**
   - Check if server is running
   - Verify IP address is correct
   - Ensure port 4000 is open

2. **CORS Errors**
   - JSON Server handles CORS automatically
   - Check browser console for specific errors

3. **Data Not Syncing**
   - Verify all systems use the same base URL
   - Check network connectivity
   - Restart JSON Server if needed

### **Testing Commands:**
```bash
# Test server accessibility
curl http://YOUR_IP:4000/vehicles

# Test from different machine
ping YOUR_IP

# Check if port is open
telnet YOUR_IP 4000
```

## 📱 **Mobile/Tablet Access**

You can also access the API from mobile devices on the same network:

```javascript
// In your React Native or mobile web app
const BASE_URL = 'http://192.168.1.100:4000';
```

## 🎯 **Benefits of Network Setup**

1. **Multi-User Access**: Multiple people can use the system simultaneously
2. **Real-time Collaboration**: Changes appear instantly across all devices
3. **Centralized Data**: Single source of truth for all data
4. **Easy Deployment**: Simple to set up and maintain
5. **Scalable**: Can handle multiple concurrent users

## 🔄 **Data Synchronization**

- **Automatic**: JSON Server handles all synchronization
- **Real-time**: Changes appear immediately on all connected devices
- **Reliable**: Data is persisted to disk and survives restarts
- **Conflict-free**: Simple single-writer model prevents conflicts

This setup allows you to have a fully functional multi-user vehicle maintenance system accessible from any device on your network! 