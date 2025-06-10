import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import SideBar from './components/SideBar';
import TopNavBar from './components/TopNavBar';  // import TopNavBar
import Dashboard from './pages/Dashboard';
import VehicleRegistration from './pages/VehicleRegistration';
import VehicleList from './pages/VehicleList';
import InsuranceManagement from './pages/InsuranceManagement';
import DocumentRepository from './pages/DocumentRepository';

function App() {
  return (
    <Router>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw' }}>
        {/* Horizontal Top Nav Bar */}
        <TopNavBar />

        {/* Main content with Sidebar + Page content */}
        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          <SideBar />
          <div style={{ flex: 1, padding: '10px', overflowY: 'auto' }}>
            <Routes>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/register-vehicle" element={<VehicleRegistration />} />
              <Route path="/vehicle-list" element={<VehicleList />} />
              <Route path="/insurance" element={<InsuranceManagement />} />
              <Route path="/documents" element={<DocumentRepository />} />
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
}

export default App;
