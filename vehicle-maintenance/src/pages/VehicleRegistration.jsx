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
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { vehicleAPI } from '../services/api';
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

  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const navigate = useNavigate();

  // Validation functions
  const validateField = (name, value) => {
    switch (name) {
      case 'make':
        return value.trim().length < 2 ? 'Make must be at least 2 characters' : '';
      case 'model':
        return value.trim().length < 1 ? 'Model is required' : '';
      case 'registrationNumber':
        return value.trim().length < 5 ? 'Registration number must be at least 5 characters' : '';
      case 'purchasePrice':
        return !value || value < 45000 ? 'Purchase price must be at least ₹45,000' : '';
      case 'kilometers':
        return !value || value < 0 ? 'Kilometers must be a positive number' : '';
      case 'fuelType':
        return !value ? 'Please select a fuel type' : '';
      case 'engineNumber':
        return value.trim().length < 5 ? 'Engine number must be at least 5 characters' : '';
      case 'chassisNumber':
        return value.trim().length < 10 ? 'Chassis number must be at least 10 characters' : '';
      case 'color':
        return value.trim().length < 2 ? 'Color must be at least 2 characters' : '';
      case 'owner':
        return value.trim().length < 2 ? 'Owner name must be at least 2 characters' : '';
      case 'phone':
        const phoneRegex = /^[0-9]\d{9}$/;
        return !phoneRegex.test(value) ? 'Please enter a valid 10-digit phone number' : '';
      case 'address':
        return value.trim().length < 2 ? 'Address must be at least 10 characters' : '';
      case 'purchaseDate':
        const selectedDate = new Date(value);
        const today = new Date();
        return !value ? 'Purchase date is required' :
          selectedDate > today ? 'Purchase date cannot be in the future' : '';
      default:
        return '';
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));

    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const validateForm = () => {
    const newErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key]);
      if (error) {
        newErrors[key] = error;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Mark all fields as touched
    const allTouched = {};
    Object.keys(formData).forEach(key => {
      allTouched[key] = true;
    });
    setTouched(allTouched);

    if (!validateForm()) {
      alert('Please fix the errors in the form before submitting.');
      return;
    }

    try {
      const response = await vehicleAPI.createVehicle(formData);

      if (response) {
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
        setErrors({});
        setTouched({});
      } else {
        alert('Failed to register vehicle.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while submitting the form.');
    }
  };

  const getFieldClassName = (fieldName) => {
    const baseClass = 'form-input';
    if (touched[fieldName] && errors[fieldName]) {
      return `${baseClass} error`;
    }
    if (touched[fieldName] && !errors[fieldName] && formData[fieldName]) {
      return `${baseClass} valid`;
    }
    return baseClass;
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
                  onBlur={handleBlur}
                  className={getFieldClassName('make')}
                />
                {touched['make'] && errors['make'] && (
                  <div className="error-message">{errors['make']}</div>
                )}
              </div>

              <div className="form-group">
                <label>Model</label>
                <input
                  type="text"
                  name="model"
                  placeholder="Vehicle model"
                  value={formData.model}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={getFieldClassName('model')}
                />
                {touched['model'] && errors['model'] && (
                  <div className="error-message">{errors['model']}</div>
                )}
              </div>

              <div className="form-group">
                <label>Registration Number</label>
                <input
                  type="text"
                  name="registrationNumber"
                  placeholder="Registration number"
                  value={formData.registrationNumber}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={getFieldClassName('registrationNumber')}
                />
                {touched['registrationNumber'] && errors['registrationNumber'] && (
                  <div className="error-message">{errors['registrationNumber']}</div>
                )}
              </div>

              <div className="form-group">
                <label>Color</label>
                <input
                  type="text"
                  name="color"
                  placeholder="Vehicle Color"
                  value={formData.color}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={getFieldClassName('color')}
                />
                {touched['color'] && errors['color'] && (
                  <div className="error-message">{errors['color']}</div>
                )}
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
                  onBlur={handleBlur}
                  className={getFieldClassName('purchaseDate')}
                />
                {touched['purchaseDate'] && errors['purchaseDate'] && (
                  <div className="error-message">{errors['purchaseDate']}</div>
                )}
              </div>

              <div className="form-group">
                <label>Purchase Price</label>
                <input
                  type="number"
                  name="purchasePrice"
                  placeholder="Enter purchase price"
                  value={formData.purchasePrice}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  min={45000}
                  style={{ paddingLeft: '2.5rem' }}
                  className={getFieldClassName('purchasePrice')}
                />
                {touched['purchasePrice'] && errors['purchasePrice'] && (
                  <div className="error-message">{errors['purchasePrice']}</div>
                )}
              </div>

              <div className="form-group">
                <label>Kilometers Driven</label>
                <input
                  type="number"
                  name="kilometers"
                  placeholder="Kilometers driven"
                  value={formData.kilometers}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={getFieldClassName('kilometers')}
                />
                {touched['kilometers'] && errors['kilometers'] && (
                  <div className="error-message">{errors['kilometers']}</div>
                )}
              </div>

              <div className="form-group">
                <label>Fuel Type</label>
                <select
                  name="fuelType"
                  value={formData.fuelType}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={getFieldClassName('fuelType')}
                >
                  <option value="" disabled>Select fuel type</option>
                  <option value="Petrol">Petrol</option>
                  <option value="Diesel">Diesel</option>
                  <option value="Electric">Electric</option>
                  <option value="Hybrid">Hybrid</option>
                  <option value="CNG">CNG</option>
                </select>
                {touched['fuelType'] && errors['fuelType'] && (
                  <div className="error-message">{errors['fuelType']}</div>
                )}
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
                  onBlur={handleBlur}
                  className={getFieldClassName('engineNumber')}
                />
                {touched['engineNumber'] && errors['engineNumber'] && (
                  <div className="error-message">{errors['engineNumber']}</div>
                )}
              </div>

              <div className="form-group">
                <label>Chassis Number</label>
                <input
                  type="text"
                  name="chassisNumber"
                  placeholder="Chassis Number"
                  value={formData.chassisNumber}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={getFieldClassName('chassisNumber')}
                />
                {touched['chassisNumber'] && errors['chassisNumber'] && (
                  <div className="error-message">{errors['chassisNumber']}</div>
                )}
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
                  onBlur={handleBlur}
                  className={getFieldClassName('owner')}
                />
                {touched['owner'] && errors['owner'] && (
                  <div className="error-message">{errors['owner']}</div>
                )}
              </div>

              <div className="form-group">
                <label>Contact Number</label>
                <input
                  type="text"
                  name="phone"
                  placeholder="Owner Phone"
                  value={formData.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={getFieldClassName('phone')}
                />
                {touched['phone'] && errors['phone'] && (
                  <div className="error-message">{errors['phone']}</div>
                )}
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
                        onBlur={handleBlur}
                        className={getFieldClassName('address')}
                      ></textarea>
                    </div>
                    {touched['address'] && errors['address'] && (
                      <div className="error-message">{errors['address']}</div>
                    )}
                  </div>

                  <div className="form-actions">
                    <button type="button" className="btn-secondary" onClick={() => navigate('/dashboard')}>
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
