import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageContainer from '../components/PageContainer';
import ButtonWithGradient from '../components/ButtonWithGradient';
import SectionHeading from '../components/SectionHeading';
// import AddressInput from '../components/AddressInput';
import SelectInput from '../components/SelectInput';
import InputText from '../components/InputText';
import {
  Car,
  Calendar,
  Settings,
  User,
  Plus
} from 'lucide-react';
import { vehicleAPI } from '../services/api';
import '../styles/registration.css';

interface VehicleRegistrationProps {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

interface FormData {
  make: string;
  model: string;
  purchaseDate: string;
  registrationNumber: string;
  purchasePrice: string;
  fuelType: string;
  engineNumber: string;
  chassisNumber: string;
  kilometers: string;
  color: string;
  owner: string;
  phone: string;
  address: string;
}

interface FormErrors {
  [key: string]: string;
}

interface FormTouched {
  [key: string]: boolean;
}

const VehicleRegistration: React.FC<VehicleRegistrationProps> = ({ sidebarCollapsed, toggleSidebar }) => {
  const [formData, setFormData] = useState<FormData>({
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

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<FormTouched>({});
  const [successMessage, setSuccessMessage] = useState<string>('');
  const navigate = useNavigate();

  // Validation functions
  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'make':
        return value.trim().length < 2 ? 'Make must be at least 2 characters' : '';
      case 'model':
        return value.trim().length < 1 ? 'Model is required' : '';
      case 'registrationNumber':
        return value.trim().length < 5 ? 'Registration number must be at least 5 characters' : '';
      case 'purchasePrice':
        return !value || parseFloat(value) < 45000 ? 'Purchase price must be at least ₹45,000' : '';
      case 'kilometers':
        return !value || parseFloat(value) < 0 ? 'Kilometers must be a positive number' : '';
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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));

    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    Object.keys(formData).forEach(key => {
      const error = validateField(key, formData[key as keyof FormData]);
      if (error) {
        newErrors[key] = error;
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    // Mark all fields as touched
    const allTouched: FormTouched = {};
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
        setSuccessMessage('Vehicle registered successfully!');
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
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      } else {
        alert('Failed to register vehicle.');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('An error occurred while submitting the form.');
    }
  };

  const getFieldClassName = (fieldName: string): string => {
    const baseClass = 'form-input';
    if (touched[fieldName] && errors[fieldName]) {
      return `${baseClass} error`;
    }
    if (touched[fieldName] && !errors[fieldName] && formData[fieldName as keyof FormData]) {
      return `${baseClass} valid`;
    }
    return baseClass;
  };

  return (
    <>
      <Header sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} showDate showTime showCalculator />
      <PageContainer>
        <SectionHeading title='Vehicle Registration' subtitle='Register a new vehicle in your fleet'/>
      {/* <div className="registration-container"> */}
        {/* <div className="registration-header">
          <div className="header-content">
            <h1 className="page-title">
              <Car className="page-icon" />
              Vehicle Registration
            </h1>
            <p className="page-subtitle">Register a new vehicle in your fleet</p>
          </div>
          <div className="header-actions">
            <ButtonWithGradient
              text="View All Vehicles"
              onClick={() => navigate('/vehicle-list')}
            />
          </div>
        </div> */}

        <div className="registration-form-container">
          {successMessage && (
            <div className="success-message">
              <div className="success-content">
                <span className="success-icon">✓</span>
                <span className="success-text">{successMessage}</span>
              </div>
            </div>
          )}
          <form onSubmit={handleSubmit} className="registration-form">
            <div className="form-section">
              <div className="section-header">
                <Car size={20} className="section-icon" />
                <h3>Vehicle Information</h3>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <InputText
                    label="Make"
                    type="text"
                    name="make"
                    placeholder="Vehicle make / Brand"
                    value={formData.make}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched['make'] ? errors['make'] : ''}
                    className={getFieldClassName('make')}
                  />
                </div>
                
                <div className="form-group">
                  <InputText
                    label="Model"
                    type="text"
                    name="model"
                    placeholder="Vehicle model"
                    value={formData.model}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched['model'] ? errors['model'] : ''}
                    className={getFieldClassName('model')}
                  />
                </div>

                <div className="form-group">
                  <InputText
                    label="Registration Number"
                    type="text"
                    name="registrationNumber"
                    placeholder="Registration number"
                    value={formData.registrationNumber}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched['registrationNumber'] ? errors['registrationNumber'] : ''}
                    className={getFieldClassName('registrationNumber')}
                  />
                </div>

                <div className="form-group">
                  <InputText
                    label="Color"
                    type="text"
                    name="color"
                    placeholder="Vehicle Color"
                    value={formData.color}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched['color'] ? errors['color'] : ''}
                    className={getFieldClassName('color')}
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
                  <InputText
                    label="Purchase Date"
                    type="date"
                    name="purchaseDate"
                    value={formData.purchaseDate}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched['purchaseDate'] ? errors['purchaseDate'] : ''}
                    className={getFieldClassName('purchaseDate')}
                  />
                </div>

                <div className="form-group">
                  <InputText
                    label="Purchase Price"
                    type="number"
                    name="purchasePrice"
                    placeholder="Enter purchase price"
                    value={formData.purchasePrice}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched['purchasePrice'] ? errors['purchasePrice'] : ''}
                    className={getFieldClassName('purchasePrice')}
                  />
                </div>

                <div className="form-group">
                  <InputText
                    label="Kilometers Driven"
                    type="number"
                    name="kilometers"
                    placeholder="Kilometers driven"
                    value={formData.kilometers}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched['kilometers'] ? errors['kilometers'] : ''}
                    className={getFieldClassName('kilometers')}
                  />
                </div>

                <div className="form-group">
                  <SelectInput
                    label="Fuel Type"
                    name="fuelType"
                    value={formData.fuelType}
                    onChange={handleChange}
                    options={[
                      { value: '', label: 'Select Fuel Type', disabled: true },
                      { value: 'Petrol', label: 'Petrol' },
                      { value: 'Diesel', label: 'Diesel' },
                      { value: 'Electric', label: 'Electric' },
                      { value: 'Hybrid', label: 'Hybrid' },
                      { value: 'CNG', label: 'CNG' },
                    ]}
                    error={touched['fuelType'] ? errors['fuelType'] : ''}
                    className={getFieldClassName('fuelType')}
                  />
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
                  <InputText
                    label="Engine Number"
                    type="text"
                    name="engineNumber"
                    placeholder="Engine Number"
                    value={formData.engineNumber}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched['engineNumber'] ? errors['engineNumber'] : ''}
                    className={getFieldClassName('engineNumber')}
                  />
                </div>

                <div className="form-group">
                  <InputText
                    label="Chassis Number"
                    type="text"
                    name="chassisNumber"
                    placeholder="Chassis Number"
                    value={formData.chassisNumber}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched['chassisNumber'] ? errors['chassisNumber'] : ''}
                    className={getFieldClassName('chassisNumber')}
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
                  <InputText
                    label="Owner Name"
                    type="text"
                    name="owner"
                    placeholder="Owner Name"
                    value={formData.owner}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched['owner'] ? errors['owner'] : ''}
                    className={getFieldClassName('owner')}
                  />
                </div>

                <div className="form-group">
                  <InputText
                    label="Contact Number"
                    type="text"
                    name="phone"
                    placeholder="Owner Phone"
                    value={formData.phone}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched['phone'] ? errors['phone'] : ''}
                    className={getFieldClassName('phone')}
                  />
                </div>

                <div className="form-group full-width ">
                  {/* <div style={{ display: 'flex', alignItems: 'flex-end', gap: '1rem' }}> */}
                    <div className='form-group'>
                      <label>Address</label>
                      <div className="input-with-icon">
                        <textarea
                          name="address"
                          placeholder="Owner Address"
                          rows={2}
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
                      {/* <button
                        type="button"
                        className="btn-primary"
                        style={{ backgroundColor: '#e53935', borderColor: '#e53935' }}
                        onClick={() => navigate('/dashboard')}
                      >
                        Cancel
                      </button> */}
                      <ButtonWithGradient text='Cancel' type='button' className='btn' onClick={() => navigate('/dashboard')} />
                      {/* <button type="submit" className="btn-primary">
                        <Plus size={16} />
                        Register Vehicle
                      </button> */}
                      <ButtonWithGradient text='Register Vehicle' type='submit' className='btn' />
                    </div>
                  {/* </div> */}
                </div>
              </div>
            </div>
          </form>
        </div>
      {/* </div> */}
      </PageContainer>
      <Footer />
    </>
  );
};

export default VehicleRegistration; 