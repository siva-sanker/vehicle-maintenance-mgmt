import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import SideBar from './components/SideBar.tsx';
import TopNavBar from './components/TopNavBar.tsx';
import Dashboard from './pages/Dashboard.tsx';
import VehicleRegistration from './pages/VehicleRegistration.tsx';
import VehicleList from './pages/VehicleList.tsx';
import InsuranceManagement from './pages/InsuranceManagement.tsx';
import InsuranceList from './pages/InsuranceList.tsx';
import DocumentRepository from './pages/DocumentRepository.tsx';
import VehicleClaims from './pages/VehicleClaims.tsx';
import VehicleLocation from './pages/VehicleLocation.tsx';
import ApiExample from './components/ApiExample.tsx';
import Driver from './pages/Driver.tsx';
import VehicleMaintenance from './pages/VehicleMaintenance.tsx';
import Header from './components/Header.tsx';
import Footer from './components/Footer.tsx';

const App: React.FC = () => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(false);

  const toggleSidebar = (): void => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <Router>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw' }}>
        {/* Horizontal Top Nav Bar */}
        <TopNavBar />

        {/* Main content with Sidebar + Page content */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          <SideBar collapsed={sidebarCollapsed} />
          <div style={{ flex: 1, padding: '10px', overflowY: 'auto' }}>
              <Header sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} showTime showDate showCalculator/> 
            <Routes>
              {/* <Route path="/" element={<Dashboard /> */}
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/register-vehicle" element={<VehicleRegistration />}/>
              <Route path="/vehicle-list" element={<VehicleList />}/>
              <Route path="/insurance" element={<InsuranceManagement />}/>
              <Route path="/insurance-history" element={<InsuranceList />}/>
              <Route path="/documents" element={<DocumentRepository />} />
              <Route path="/claims" element={<VehicleClaims />}/>
              <Route path="/location" element={<VehicleLocation />}/>
              <Route path="/api" element={<ApiExample />}/>
              <Route path="/driver" element={<Driver />}/>
              <Route path="/main" element={<VehicleMaintenance />}/>
            </Routes>
            <Footer/>
          </div>
        </div>

        {/* Toast Container for notifications */}
        <ToastContainer
          position="top-right"
          autoClose={5000}
          hideProgressBar={false}
          newestOnTop={false}
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
          theme="light"
        />
      </div>
    </Router>
  );
};

export default App; 