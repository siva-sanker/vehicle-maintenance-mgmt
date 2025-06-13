// src/components/InsuranceClaims.js
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import {
  FileText,
  Search,
  Plus,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Car,
  Check,
  X
} from 'lucide-react';
import { vehicleAPI } from '../services/api';
import '../styles/claims.css';

const InsuranceClaims = ({ sidebarCollapsed, toggleSidebar }) => {
  const [claims, setClaims] = useState([]);
  const [vehicles, setVehicles] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [formData, setFormData] = useState({
    vehicleId: '',
    claimDate: '',
    claimAmount: '',
    reason: '',
    status: 'Pending',
  });

  const fetchData = async () => {
    try {
      const vehiclesData = await vehicleAPI.getAllVehicles();
      setVehicles(vehiclesData);
      // Note: Claims are stored within vehicles, so we don't need a separate claims fetch
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const vehicleIdFromURL = queryParams.get('vehicleId');

  useEffect(() => {
    if (vehicleIdFromURL) {
      setFormData((prev) => ({ ...prev, vehicleId: vehicleIdFromURL }));
    }
  }, [vehicleIdFromURL]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // Get all claims from all vehicles
  const getAllClaims = () => {
    const allClaims = [];
    vehicles.forEach(vehicle => {
      if (vehicle.claims && vehicle.claims.length > 0) {
        vehicle.claims.forEach((claim, index) => {
          allClaims.push({
            ...claim,
            vehicleId: vehicle.id,
            registrationNumber: vehicle.registrationNumber,
            claimIndex: index
          });
        });
      }
    });
    return allClaims;
  };

  // Filter claims based on search term
  const filteredClaims = getAllClaims().filter(claim =>
    claim.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e) => {
    e.preventDefault();

    const vehicleId = formData.vehicleId;

    try {
      // Get the current vehicle
      const vehicle = await vehicleAPI.getVehicleById(vehicleId);

      // Check if vehicle has insurance
      if (!vehicle.insurance || !vehicle.insurance.hasInsurance) {
        setErrorMessage('This vehicle does not have insurance. Please add insurance before submitting a claim.');
        // Clear error message after 5 seconds
        setTimeout(() => {
          setErrorMessage('');
        }, 5000);
        return;
      }

      // Create new claim
      const newClaim = {
        claimDate: formData.claimDate,
        claimAmount: formData.claimAmount,
        reason: formData.reason,
        status: formData.status
      };

      // Ensure claims array exists
      const updatedClaims = vehicle.claims ? [...vehicle.claims, newClaim] : [newClaim];

      // Update vehicle with new claims array
      await vehicleAPI.patchVehicle(vehicleId, { claims: updatedClaims });

      // Show success message
      setSuccessMessage('Claim submitted successfully!');

      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccessMessage('');
      }, 3000);

      // Reset form
      setFormData({
        vehicleId: vehicleIdFromURL || '',
        claimDate: '',
        claimAmount: '',
        reason: '',
        status: 'Pending',
      });

      // Refresh data to show updated claims in the table
      fetchData();

    } catch (error) {
      console.error('Error adding claim:', error);
      setErrorMessage('Error submitting claim. Please try again.');
      // Clear error message after 5 seconds
      setTimeout(() => {
        setErrorMessage('');
      }, 5000);
    }
  };

  const handleStatusChange = async (vehicleId, claimIndex, newStatus) => {
    try {
      // Get the current vehicle
      const vehicle = await vehicleAPI.getVehicleById(vehicleId);

      // Update the specific claim status
      const updatedClaims = [...vehicle.claims];
      updatedClaims[claimIndex].status = newStatus;

      // Update vehicle with updated claims array
      await vehicleAPI.patchVehicle(vehicleId, { claims: updatedClaims });

      // Update local state
      setVehicles(prevVehicles =>
        prevVehicles.map(v =>
          v.id === vehicleId
            ? { ...v, claims: updatedClaims }
            : v
        )
      );

    } catch (error) {
      console.error('Error updating claim status:', error);
    }
  };

  const getStatusIcon = (status) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return <CheckCircle size={16} className="status-icon approved" />;
      case 'rejected':
        return <XCircle size={16} className="status-icon rejected" />;
      default:
        return <AlertTriangle size={16} className="status-icon pending" />;
    }
  };

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'status-approved';
      case 'rejected':
        return 'status-rejected';
      default:
        return 'status-pending';
    }
  };

  return (
    <>
      <Header sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
      <div className="claims-container">
        <div className="claims-header">
          <div className="header-content">
            <h1 className="page-title">
              <FileText className="page-icon" />
              Insurance Claims
            </h1>
            <p className="page-subtitle">Manage and track vehicle insurance claims</p>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="success-message">
            <CheckCircle size={20} />
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="error-message">
            <AlertTriangle size={20} />
            {errorMessage}
          </div>
        )}

        <div className="claims-layout">
          <div className="claims-form-section">
            <div className="form-card">
              <div className="form-header">
                <h3>Submit New Claim</h3>
                <p>Add a new insurance claim for a vehicle</p>
              </div>

              <form onSubmit={handleSubmit} className="claim-form">
                <div className="form-group">
                  <label>Vehicle</label>
                  <select
                    name="vehicleId"
                    value={formData.vehicleId}
                    onChange={handleChange}
                    required
                    disabled={!!vehicleIdFromURL}
                    className='text-uppercase'
                  >
                    <option value="" disabled>Select Vehicle</option>
                    {vehicles.map(vehicle => (
                      <option key={vehicle.id} value={vehicle.id}>
                        {vehicle.registrationNumber} - {vehicle.make} {vehicle.model}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>

                    Claim Date
                  </label>
                  <input
                    type="date"
                    name="claimDate"
                    value={formData.claimDate}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>

                    Claim Amount
                  </label>
                  <input
                    type="number"
                    name="claimAmount"
                    value={formData.claimAmount}
                    onChange={handleChange}
                    placeholder="Enter claim amount"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>

                    Reason
                  </label>
                  <textarea
                    name="reason"
                    value={formData.reason}
                    onChange={handleChange}
                    placeholder="Describe the reason for the claim"
                    rows="3"
                    required
                  />
                </div>

                <div className="form-group">
                  <label hidden>

                    Status
                  </label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange} hidden
                  >
                    <option value="Pending">Pending</option>
                    {/* <option value="Approved">Approved</option>
                  <option value="Rejected">Rejected</option> */}
                  </select>
                </div>

                <button type="submit" className="btn-primary">
                  <Plus size={16} />
                  Submit Claim
                </button>
              </form>
            </div>
          </div>

          <div className="claims-history-section">
            <div className="history-card">
              <div className="history-header">
                <h3>Claim History</h3>
                <p>View and search through all claims</p>
              </div>

              <div className="search-container">
                <div className="search-input-wrapper">
                  <Search size={16} className="search-icon" />
                  <input
                    type="text"
                    placeholder="Search by vehicle registration number..."
                    value={searchTerm}
                    onChange={handleSearchChange}
                    className="search-input"
                  />
                </div>
              </div>

              <div className="claims-table-container">
                {filteredClaims.length === 0 ? (
                  <div className="empty-claims">
                    <FileText size={48} className="empty-icon" />
                    <h4>No claims found</h4>
                    <p>No claims match your search criteria</p>
                  </div>
                ) : (
                  <table className="claims-table">
                    <thead>
                      <tr>
                        <th>Vehicle</th>
                        <th>Date</th>
                        <th>Amount</th>
                        <th>Reason</th>
                        <th>Status</th>
                        {/* <th>Actions</th> */}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredClaims.map((claim, idx) => (
                        <tr key={idx}>
                          <td className="vehicle-cell text-uppercase">
                            <Car size={14} />
                            {claim.registrationNumber}
                          </td>
                          <td>{claim.claimDate}</td>
                          <td className="amount-cell">₹{claim.claimAmount}</td>
                          <td className="reason-cell">{claim.reason}</td>
                          <td>
                            <div className="status-actions">
                              <span className={`status-badge ${getStatusClass(claim.status)}`}>
                                {getStatusIcon(claim.status)}
                                {claim.status}
                              </span>
                              <div className="status-buttons">
                                <button
                                  className="status-btn approve-btn"
                                  onClick={() => handleStatusChange(claim.vehicleId, claim.claimIndex, 'Approved')}
                                  title="Approve Claim"
                                >
                                  <Check size={14} />
                                </button>
                                <button
                                  className="status-btn reject-btn"
                                  onClick={() => handleStatusChange(claim.vehicleId, claim.claimIndex, 'Rejected')}
                                  title="Reject Claim"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default InsuranceClaims;