import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Car,
  Calendar,
  DollarSign,
  Fuel,
  Settings,
  User,
  Phone,
  MapPin,
  Plus,
  CheckCircle
} from 'lucide-react';
import '../styles/registration.css';

const VehicleRegistration = () => {
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    purchaseDate: '',
    registrationNumber: '',
    purchasePrice: '',
    fuelType: '',
    engineNumber: '',
    chassisNumber: '',
    kilometers: '',
    color: '',
    owner: '',
    phone: '',
    address: ''
  });

  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const requiredFields = [
      'make',
      'model',
      'purchaseDate',
      'registrationNumber',
      'purchasePrice',
      'fuelType',
      'engineNumber',
      'chassisNumber',
      'kilometers',
      'color',
      'owner',
      'phone',
      'address'
    ];

    const emptyField = requiredFields.find(field => !formData[field]);

    if (emptyField) {
      alert('Please fill in all fields.');
      return;
    }

    try {
      const response = await fetch('http://localhost:4000/vehicles', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        setSubmitted(true);
        setFormData({
          make: '',
          model: '',
          purchaseDate: '',
          registrationNumber: '',
          purchasePrice: '',
          fuelType: '',
          engineNumber: '',
          chassisNumber: '',
          kilometers: '',
          color: '',
          owner: '',
          phone: '',
          address: ''
        });
      } else {
        alert('Failed to register vehicle.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while submitting the form.');
    }
  };

  return (
    <div className="registration-container">
      <div className="registration-header">
        <div className="header-content">
          <h1 className="page-title">
            <Car className="page-icon" />
            Vehicle Registration
          </h1>
          <p className="page-subtitle">Register a new vehicle in your fleet</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={() => navigate('/vehicle-list')}>
            View All Vehicles
          </button>
        </div>
      </div>

      {submitted && (
        <div className="success-message">
          <CheckCircle size={24} />
          <div>
            <h3>Vehicle registered successfully!</h3>
            <p>Your vehicle has been added to the system.</p>
          </div>
        </div>
      )}

      <div className="registration-form-container">
        <form onSubmit={handleSubmit} className="registration-form">
          <div className="form-section">
            <div className="section-header">
              <Car size={20} className="section-icon" />
              <h3>Vehicle Information</h3>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label>Make</label>
                <input
                  type="text"
                  name="make"
                  placeholder="Vehicle make / Brand"
                  value={formData.make}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Model</label>
                <input
                  type="text"
                  name="model"
                  placeholder="Vehicle model"
                  value={formData.model}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Registration Number</label>
                <input
                  type="text"
                  name="registrationNumber"
                  placeholder="Registration number"
                  value={formData.registrationNumber}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Color</label>
                <input
                  type="text"
                  name="color"
                  placeholder="Vehicle Color"
                  value={formData.color}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="section-header">
              <Calendar size={20} className="section-icon" />
              <h3>Purchase Details</h3>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label>Purchase Date</label>
                <input
                  type="date"
                  name="purchaseDate"
                  value={formData.purchaseDate}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Purchase Price</label>
                <input
                  type="number"
                  name="purchasePrice"
                  placeholder="Enter purchase price"
                  value={formData.purchasePrice}
                  onChange={handleChange}
                  min={45000}
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>

              <div className="form-group">
                <label>Kilometers Driven</label>
                <input
                  type="number"
                  name="kilometers"
                  placeholder="Kilometers driven"
                  value={formData.kilometers}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Fuel Type</label>
                <select
                  name="fuelType"
                  value={formData.fuelType}
                  onChange={handleChange}
                >
                  <option value="" disabled>Select fuel type</option>
                  <option value="Petrol">Petrol</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Electric">Electric</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="CNG">CNG</option>
                </select>
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="section-header">
              <Settings size={20} className="section-icon" />
              <h3>Technical Details</h3>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label>Engine Number</label>
                <input
                  type="text"
                  name="engineNumber"
                  placeholder="Engine Number"
                  value={formData.engineNumber}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Chassis Number</label>
                <input
                  type="text"
                  name="chassisNumber"
                  placeholder="Chassis Number"
                  value={formData.chassisNumber}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <div className="form-section">
            <div className="section-header">
              <User size={20} className="section-icon" />
              <h3>Owner Information</h3>
            </div>
            <div className="form-grid">
              <div className="form-group">
                <label>Owner Name</label>
                <input
                  type="text"
                  name="owner"
                  placeholder="Owner Name"
                  value={formData.owner}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label>Contact Number</label>
                <input
                  type="text"
                  name="phone"
                  placeholder="Owner Phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group full-width">
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem' }}>
                  <div style={{ flex: 1 }}>
                    <label>Address</label>
                    <div className="input-with-icon">
                      <textarea
                        name="address"
                        placeholder="Owner Address"
                        rows="2"
                        value={formData.address}
                        onChange={handleChange}
                      ></textarea>
                    </div>
                  </div>
                  
                  <div className="form-actions">
                    <button type="button" className="btn-secondary" onClick={() => navigate('/vehicles')}>
                      Cancel
                    </button>
                    <button type="submit" className="btn-primary">
                      <Plus size={16} />
                      Register Vehicle
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VehicleRegistration;
