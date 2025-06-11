import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  Car,
  Calendar,
  User,
  Phone,
  MapPin,
  FileText,
  Fuel,
  Settings,
  DollarSign,
  Plus,
  Eye
} from 'lucide-react';
import '../styles/Vehiclelist.css';

const VehicleList = () => {
  const [claimsModalOpen, setClaimsModalOpen] = useState(false);
  const [claims, setClaims] = useState([]);
  const [loadingClaims, setLoadingClaims] = useState(false);
  const [claimsError, setClaimsError] = useState('');

  const [vehicles, setVehicles] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [insuranceData, setInsuranceData] = useState({
    policyNumber: '',
    insurer: '',
    policytype: '',
    startDate: '',
    endDate: '',
    payment:'',
    issueDate: '',
    premiumAmount: '',
  });

  const calculateVehicleAge = (purchaseDateString) => {
    const purchaseDate = new Date(purchaseDateString);
    const today = new Date();

    let age = today.getFullYear() - purchaseDate.getFullYear();
    const monthDiff = today.getMonth() - purchaseDate.getMonth();
    const dayDiff = today.getDate() - purchaseDate.getDate();

    if (monthDiff < 0 || (monthDiff === 0 && dayDiff < 0)) {
      age--;
    }

    return age;
  };

  const navigate = useNavigate();
  const goToClaims = (vehicleId) => {
    navigate(`/claims?vehicleId=${vehicleId}`);
  };

  useEffect(() => {
    fetch('http://localhost:4000/vehicles')
      .then((res) => res.json())
      .then((data) => setVehicles(data))
      .catch((err) => console.error(err));
  }, []);

  // Debug useEffect for modal states
  useEffect(() => {
    console.log('showModal changed to:', showModal);
  }, [showModal]);

  useEffect(() => {
    console.log('claimsModalOpen changed to:', claimsModalOpen);
  }, [claimsModalOpen]);

  useEffect(() => {
    console.log('selectedVehicle changed to:', selectedVehicle);
  }, [selectedVehicle]);

  const viewClaims = async (vehicleId) => {
    console.log('viewClaims called with vehicleId:', vehicleId);
    // Find the vehicle to check insurance
    const vehicle = vehicles.find(v => v.id === vehicleId);
    console.log('Found vehicle:', vehicle);

    // Check if vehicle has insurance
    if (!vehicle.insurance) {
      toast.error("Vehicle does not have insurance");
      return;
    }

    setLoadingClaims(true);
    setClaimsError('');
    try {
      // Set the vehicle as selectedVehicle
      setSelectedVehicle(vehicle);

      // Get claims from the vehicle object since they're stored there
      const vehicleClaims = vehicle?.claims || [];
      console.log('Vehicle claims:', vehicleClaims);
      setClaims(vehicleClaims);
    } catch (err) {
      console.error('Error loading claims:', err);
      setClaimsError('Failed to load claims');
      setClaims([]);
    } finally {
      setLoadingClaims(false);
      setClaimsModalOpen(true);
      console.log('claimsModalOpen set to true');
    }
  };

  const handleAddInsurance = async () => {
    if (!selectedVehicle?.id) {
      console.error("Selected vehicle is missing an ID.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:4000/vehicles/${selectedVehicle.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          insurance: insuranceData
        })
      });

      if (response.ok) {
        const updatedVehicle = await response.json();
        const updatedVehicles = vehicles.map((v) =>
          v.id === updatedVehicle.id ? updatedVehicle : v
        );
        setVehicles(updatedVehicles);
        setShowModal(false);
      } else {
        console.error("Failed to update insurance in db.json");
      }
    } catch (error) {
      console.error("Error updating insurance:", error);
    }
  };

  return (
    <div className="vehicle-list-container">
      <div className="vehicle-list-header">
        <div className="header-content">
          <h1 className="page-title">
            <Car className="page-icon" />
            Registered Vehicles
          </h1>
          <p className="page-subtitle">Manage and view all your registered vehicles</p>
        </div>
        <div className="header-actions">
          <button className="btn-primary" onClick={() => navigate('/register-vehicle')}>
            <Plus size={16} />
            Add Vehicle
          </button>
        </div>
      </div>

      {vehicles.length === 0 ? (
        <div className="empty-state">
          <Car size={64} className="empty-icon" />
          <h3>No vehicles registered yet</h3>
          <p>Start by adding your first vehicle to the system</p>
          <button className="btn-primary" onClick={() => navigate('/register-vehicle')}>
            <Plus size={16} />
            Register Vehicle
          </button>
        </div>
      ) : (
        <div className="vehicles-grid">
          {vehicles.map((vehicle, index) => (
            <div className="vehicle-card" key={index}>
              <div className="vehicle-card-header">
                <div className="vehicle-info">
                  <h3 className="vehicle-name text-capitalize">{vehicle.make} {vehicle.model}</h3>
                  <p className="vehicle-registration text-uppercase">{vehicle.registrationNumber}</p>
                </div>
                <span className="vehicle-year">
                  {new Date(vehicle.purchaseDate).getFullYear()}
                </span>
              </div>

              <div className="vehicle-card-body">
                <div className="info-section">
                  <div className="section-header">
                    <Calendar size={16} className="section-icon" />
                    <h6>Basic Info</h6>
                  </div>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="info-label">Color:</span>
                      <span className="info-value">{vehicle.color}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Age:</span>
                      <span className="info-value">{calculateVehicleAge(vehicle.purchaseDate)} years</span>
                    </div>
                  </div>
                </div>

                <div className="info-section">
                  <div className="section-header">
                    <Fuel size={16} className="section-icon" />
                    <h6>Fuel Type</h6>
                    <span className={`fuel-badge ${vehicle.fuelType.toLowerCase()}`}>
                      {vehicle.fuelType}
                    </span>
                  </div>
                </div>

                <div className="info-section">
                  <div className="section-header">
                    <Settings size={16} className="section-icon" />
                    <h6>Engine Info</h6>
                  </div>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="info-label">Engine No.:</span>
                      <span className="info-value">{vehicle.engineNumber}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Chassis No.:</span>
                      <span className="info-value">{vehicle.chassisNumber}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Price:</span>
                      <span className="info-value">₹{vehicle.purchasePrice}</span>
                    </div>
                  </div>
                </div>

                <div className="info-section">
                  <div className="section-header">
                    <User size={16} className="section-icon" />
                    <h6>Owner Info</h6>
                  </div>
                  <div className="info-grid">
                    <div className="info-item">
                      <span className="info-label">Owner:</span>
                      <span className="info-value">{vehicle.owner}</span>
                    </div>
                    <div className="info-item">
                      <span className="info-label">Phone:</span>
                      <span className="info-value">{vehicle.phone}</span>
                    </div>
                    <div className="info-item full-width">
                      <span className="info-label">Address:</span>
                      <span className="info-value">{vehicle.address}</span>
                    </div>
                  </div>
                </div>

                {vehicle.insurance ? (
                  <div className="info-section">
                    <div className="section-header">
                      <FileText size={16} className="section-icon" />
                      <h6>Insurance Info</h6>
                    </div>
                    <div className="info-grid">
                      <div className="info-item">
                        <span className="info-label">Policy #:</span>
                        <span className="info-value">{vehicle.insurance.policyNumber}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Insurer:</span>
                        <span className="info-value">{vehicle.insurance.insurer}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Type:</span>
                        <span className="info-value">{vehicle.insurance.policytype}</span>
                      </div>
                      <div className="info-item">
                        <span className="info-label">Premium:</span>
                        <span className="info-value">₹{vehicle.insurance.premiumAmount}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="info-section">
                    <div className="section-header">
                      <FileText size={16} className="section-icon" />
                      <h6>Insurance Info</h6>
                    </div>
                    <div className="no-insurance">
                      <p>No insurance information available</p>
                    </div>
                  </div>
                )}

                <div className="vehicle-actions">
                  <button
                    className="btn-action"
                    onClick={() => {
                      console.log('View Claims clicked for vehicle:', vehicle.id);
                      if (vehicle.insurance) {
                        viewClaims(vehicle.id);
                      } else {
                        toast.error("Vehicle has no insurance");
                      }
                    }}
                  >
                    <Eye size={16} />
                    View Claims
                  </button>
                  <button
                    className="btn-action"
                    onClick={() => {
                      console.log('Add/Update Insurance clicked for vehicle:', vehicle.id);
                      setSelectedVehicle(vehicle);
                      setShowModal(true);
                      console.log('showModal set to true, selectedVehicle:', vehicle);
                    }}
                  >
                    <FileText size={16} />
                    {vehicle.insurance ? 'Update Insurance' : 'Add Insurance'}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Insurance Modal */}
      {showModal && (
        <div className="modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {console.log('Rendering insurance modal, showModal:', showModal, 'selectedVehicle:', selectedVehicle)}
          <div className="modal" style={{
            backgroundColor: 'white',
            padding: '20px',
            border: '1px solid #e0e0e0',
            maxWidth: '600px',
            width: '90%',
            maxHeight: '70vh',
            overflowY: 'auto'
          }}>
            <div className="modal-header">
              <h3>Add Insurance for {selectedVehicle?.make} {selectedVehicle?.model}</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
            </div>
            <div className="modal-body">
              <div className="form-grid">
                <div className="form-group">
                  <label>Policy Number</label>
                  <input
                    type="text"
                    value={insuranceData.policyNumber}
                    onChange={(e) => setInsuranceData({ ...insuranceData, policyNumber: e.target.value })}
                    placeholder="Enter policy number"
                  />
                </div>
                <div className="form-group">
                  <label>Insurer</label>
                  <input
                    type="text"
                    value={insuranceData.insurer}
                    onChange={(e) => setInsuranceData({ ...insuranceData, insurer: e.target.value })}
                    placeholder="Enter insurer name" 
                  />
                </div>
                <div className="form-group">
                  <label>Policy Type</label>
                  <select
                    value={insuranceData.policytype}
                    onChange={(e) => setInsuranceData({ ...insuranceData, policytype: e.target.value })}
                  >
                    <option value="" selected disabled>Select policy type</option>
                    <option value="Comprehensive">Comprehensive</option>
                    <option value="Third Party">Third Party</option>
                    <option value="Liability">Liability</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Start Date</label>
                  <input
                    type="date"
                    value={insuranceData.startDate}
                    onChange={(e) => setInsuranceData({ ...insuranceData, startDate: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>End Date</label>
                  <input
                    type="date"
                    value={insuranceData.endDate}
                    onChange={(e) => setInsuranceData({ ...insuranceData, endDate: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Issue Date</label>
                  <input
                    type="date"
                    value={insuranceData.issueDate}
                    onChange={(e) => setInsuranceData({ ...insuranceData, issueDate: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label>Premium Amount</label>
                  <input
                    type="number"
                    value={insuranceData.premiumAmount}
                    onChange={(e) => setInsuranceData({ ...insuranceData, premiumAmount: e.target.value })}
                    placeholder="Enter premium amount"
                  />
                </div>

                <div className="form-group">
                  <label>Payment mode</label>
                  <select
                    value={insuranceData.payment}
                    onChange={(e) => setInsuranceData({ ...insuranceData, payment: e.target.value })}
                  >
                    <option value="" selected disabled>Select payment mode</option>
                    <option value="cash">Cash</option>
                    <option value="card">Card</option>
                    <option value="upi">UPI</option>
                    <option value="bank account">Bank Account</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn-primary" onClick={handleAddInsurance}>Add Insurance</button>
            </div>
          </div>
        </div>
      )}

      {/* Claims Modal */}
      {claimsModalOpen && (
        <div className="modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {console.log('Rendering claims modal, claimsModalOpen:', claimsModalOpen, 'selectedVehicle:', selectedVehicle)}
          <div className="modal" style={{
            backgroundColor: 'white',
            padding: '20px',
            border: '1px solid #e0e0e0',
            maxWidth: '500px',
            width: '90%',
            overflowY: 'auto'
          }}>
            <div className="modal-header">
              <h3>Claims History - {selectedVehicle?.make} {selectedVehicle?.model}</h3>
              <button className="modal-close" onClick={() => setClaimsModalOpen(false)}>×</button>
            </div>
            <div className="modal-body">
              {loadingClaims ? (
                <div className="loading">Loading claims...</div>
              ) : claimsError ? (
                <div className="error">{claimsError}</div>
              ) : claims.length === 0 ? (
                <div className="empty-state">
                  <FileText size={48} className="empty-icon" />
                  <h4>No claims found</h4>
                  <p>This vehicle has no claims history.</p>
                </div>
              ) : (
                <div className="claims-list">
                  {claims.map((claim, index) => (
                    <div key={index} className="claim-item">
                      <div className="claim-header">
                        <h4>Claim #{index + 1}</h4>
                        <span className={`claim-status ${claim.status.toLowerCase()}`}>
                          {claim.status}
                        </span>
                      </div>
                      <div className="claim-details">
                        <div className="claim-info">
                          <span className="info-label">Date:</span>
                          <span className="info-value">{claim.claimDate}</span>
                        </div>
                        <div className="claim-info">
                          <span className="info-label">Amount:</span>
                          <span className="info-value">₹{claim.claimAmount}</span>
                        </div>
                        <div className="claim-info">
                          <span className="info-label">Reason:</span>
                          <span className="info-value">{claim.reason}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn-secondary" onClick={() => setClaimsModalOpen(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

export default VehicleList;