import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PageContainer from '../components/PageContainer';
import ButtonWithGradient from '../components/ButtonWithGradient';
import SectionHeading from '../components/SectionHeading';
// import AddressInput from '../components/AddressInput';
import SelectInput from '../components/SelectInput';
import InputText from '../components/InputText';
import FormDateInput from '../components/Date';
import TextAreaInput from '../components/TextAreaInput';
import CancelButton from '../components/CancelButton';
// import {
//   Car,
//   Calendar,
//   Settings,
//   User,
//   // Plus
// } from 'lucide-react';
import {
  FormData,
  FormErrors,
  FormTouched,
  getInitialFormData,
  getFieldClassName,
  handleFormChange,
  handleFormBlur,
  handleFormSubmit,
  // getFuelTypeOptions
} from '../utils/registrationUtils';
import '../styles/registration.css';

const VehicleRegistration: React.FC = () => {
  const [formData, setFormData] = useState<FormData>(getInitialFormData());

  const [errors, setErrors] = useState<FormErrors>({});
  const [touched, setTouched] = useState<FormTouched>({});
  const [successMessage, setSuccessMessage] = useState<string>('');
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void => {
    handleFormChange(e, formData, setFormData, errors, setErrors);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void => {
    handleFormBlur(e, setTouched, setErrors);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    await handleFormSubmit(e, formData, setTouched, setErrors, setFormData, setSuccessMessage);
  };

  const getFieldClassNameLocal = (fieldName: string): string => {
    return getFieldClassName(fieldName, touched, errors, formData);
  };

  return (
    <>
      {/* <Header sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} showDate showTime showCalculator /> */}
      <PageContainer>
      <div className="dashboard-content">
        <SectionHeading title='Vehicle Registration' subtitle='Register a new vehicle in your fleet'/>

        <div className="registration-form-container">
          {/* {successMessage && (
            <div className="success-message">
              <div className="success-content">
                <span className="success-icon">✓</span>
                <span className="success-text">{successMessage}</span>
              </div>
            </div>
          )} */}
          <form onSubmit={handleSubmit} className="registration-form">
            <div className="form-section">
              <div className="section-header">
                {/* <Car size={20} className="section-icon" /> */}
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
                    className={getFieldClassNameLocal('make')}
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
                    className={getFieldClassNameLocal('model')}
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
                    className={getFieldClassNameLocal('registrationNumber')}
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
                    className={getFieldClassNameLocal('color')}
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <div className="section-header">
                {/* <Calendar size={20} className="section-icon" /> */}
                <h3>Purchase Details</h3>
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <FormDateInput label='Purchase Date' name='purchaseDate' value={formData.purchaseDate} onChange={handleChange} onBlur={handleBlur}
                  error={touched['purchaseDate'] ? errors['purchaseDate'] : ''} className={getFieldClassNameLocal('purchaseDate')}/>
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
                    className={getFieldClassNameLocal('purchasePrice')}
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
                    className={getFieldClassNameLocal('kilometers')}
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
                    className={getFieldClassNameLocal('fuelType')}
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <div className="section-header">
                {/* <Settings size={20} className="section-icon" /> */}
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
                    className={getFieldClassNameLocal('engineNumber')}
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
                    className={getFieldClassNameLocal('chassisNumber')}
                  />
                </div>
              </div>
            </div>

            <div className="form-section">
              <div className="section-header">
                {/* <User size={20} className="section-icon" /> */}
                <h3>Owner Information</h3>
              </div>
              <div className="form-grid">
                <div className="form-group ">
                  <InputText
                    label="Owner Name"
                    type="text"
                    name="owner"
                    placeholder="Owner Name"
                    value={formData.owner}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    error={touched['owner'] ? errors['owner'] : ''}
                    className={getFieldClassNameLocal('owner')}
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
                    className={getFieldClassNameLocal('phone')}
                  />
                </div>

                  <div className='form-group'>
                      <TextAreaInput value={formData.address} name='address' onChange={handleChange} onBlur={handleBlur} placeholder='Owner Address' label='Address'/>
                    {touched['address'] && errors['address'] && (
                      <div className="error-message">{errors['address']}</div>
                    )}
                  </div>

                  <div className="form-group"></div>
                  
                  <div className="form-group">
                    <CancelButton text='Cancel' type='button' onClick={() => navigate('/dashboard')}  />
                  </div>
                  <div className="form-group">
                    <ButtonWithGradient text='Register Vehicle' type='submit' className='btn' />
                  </div>

              </div>
            </div>
          </form>
        </div>
      {/* </div> */}
      </div>
      </PageContainer>
      {/* <Footer /> */}
    </>
  );
};

export default VehicleRegistration; 