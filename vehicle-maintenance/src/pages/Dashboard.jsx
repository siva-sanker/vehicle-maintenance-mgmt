import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/Dashboard.css'

const Dashboard = () => {
  const [totalVehicles, setTotalVehicles] = useState(0);
  const [activeClaims, setActiveClaims] = useState(0);
  const [insurancePolicies, setInsurancePolicies] = useState(0);
  const [documentCount, setDocumentCount] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    // Simulated data fetch
    const storedVehicles=JSON.parse(localStorage.getItem('vehicles') || '[]');
    setTotalVehicles(storedVehicles.length);
    
    let totalPolicies = 0;
    storedVehicles.forEach(vehicle => {
    if (vehicle.insurance && typeof vehicle.insurance==='object') {
      totalPolicies += 1;
    }
  });
    setInsurancePolicies(totalPolicies);
    setActiveClaims(8);
    setDocumentCount(230);
  }, []);

  return (
    <div className='main-container'>
    <div className="container-fluid my-3">
      <div className="heading mb-4 p-1 mt-2">
        <h2 className="dashboard">🚘 Dashboard</h2>
        {/* <p>view vehicle analytics</p> */}
      </div>

      {/* Stats Cards */}
      <div className="row g-4">
        <div className="col-xl-3 col-lg-4 col-md-6 col-sm-12">
          <div className="card text-bg-light shadow-sm h-100 py-4">
            <div className="card-body">
              <h5 className="card-title text-muted fs-3">Total Vehicles</h5>
              <p className="card-text fs-3 fw-bold text-primary">{totalVehicles}</p>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-lg-4 col-md-6 col-sm-12">
          <div className="card text-bg-light shadow-sm h-100 py-4">
            <div className="card-body">
              <h5 className="card-title text-muted fs-3">Active Claims</h5>
              <p className="card-text fs-3 fw-bold text-danger">{activeClaims}</p>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-lg-4 col-md-6 col-sm-12">
          <div className="card text-bg-light shadow-sm h-100 py-4">
            <div className="card-body">
              <h5 className="card-title text-muted fs-3">Total Insurance Policies</h5>
              <p className="card-text fs-3 fw-bold text-success">{insurancePolicies}</p>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-lg-4 col-md-6 col-sm-12">
          <div className="card text-bg-light shadow-sm h-100 py-4">
            <div className="card-body">
              <h5 className="card-title text-muted fs-3">Documents</h5>
              <p className="card-text fs-3 fw-bold text-info">{documentCount}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quickactions mt-5 p-3 mb-3 ">
        <h4 className='heading mb-4 p-2'>Quick Actions</h4>
        <div className="card p-4 bg-light mb-3">
          <p className="mb-3">Need to add a new vehicle?</p>
          <button className="button btn" onClick={() => navigate('/register-vehicle')}>
            Register Vehicle
          </button>
        </div>
      </div>
    </div>
    </div>
  );
};

export default Dashboard;
