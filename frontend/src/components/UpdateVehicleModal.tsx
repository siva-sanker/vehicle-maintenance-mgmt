import React, { useState, useEffect } from 'react';
import { Vehicle } from '../services/api';
import { 
  validateUpdateForm, 
  isUpdateFormValid, 
  updateVehicleDetails, 
  getUpdateFormDataFromVehicle,
  getUpdateFieldClassName,
  validateUpdateField
} from '../utils/vehicleUtils';
import { toast } from 'react-toastify';
import InputText from './InputText';
import SelectInput from './SelectInput';
import FormDateInput from './Date';
import TextAreaInput from './TextAreaInput';
import ButtonWithGradient from './ButtonWithGradient';
import CancelButton from './CancelButton';

interface UpdateVehicleModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle | null;
  onVehicleUpdated: (updatedVehicle: Vehicle) => void;
}

const UpdateVehicleModal: React.FC<UpdateVehicleModalProps> = ({
  isOpen,
  onClose,
  vehicle,
  onVehicleUpdated
}) => {
  const [updateFormData, setUpdateFormData] = useState({
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
  const [updateErrors, setUpdateErrors] = useState<{ [key: string]: string }>({});
  const [updateTouched, setUpdateTouched] = useState<{ [key: string]: boolean }>({});
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && vehicle) {
      setUpdateFormData(getUpdateFormDataFromVehicle(vehicle));
      setUpdateErrors({});
      setUpdateTouched({});
    }
  }, [isOpen, vehicle]);

  const handleUpdateChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;
    setUpdateFormData(prev => ({ ...prev, [name]: value }));
    if (updateErrors[name]) {
      setUpdateErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleUpdateBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void => {
    const { name, value } = e.target;
    setUpdateTouched(prev => ({ ...prev, [name]: true }));
    const error = validateUpdateField(name, value);
    setUpdateErrors(prev => ({ ...prev, [name]: error }));
  };

  const getUpdateFieldClassNameLocal = (fieldName: string): string => {
    return getUpdateFieldClassName(fieldName, updateTouched, updateErrors, updateFormData);
  };

  const handleUpdateVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    // Mark all as touched
    const allTouched: { [key: string]: boolean } = {};
    Object.keys(updateFormData).forEach(key => { allTouched[key] = true; });
    setUpdateTouched(allTouched);
    
    const errors = validateUpdateForm(updateFormData);
    setUpdateErrors(errors);
    
    if (!isUpdateFormValid(errors)) {
      toast.error('Please fix the errors in the form before submitting.');
      return;
    }
    if (!vehicle?.id) return;
    setIsUpdating(true);
    try {
      const updatedVehicle = await updateVehicleDetails(vehicle.id, updateFormData);
      if (updatedVehicle) {
        onVehicleUpdated(updatedVehicle);
        onClose();
        toast.success('Vehicle details updated successfully!');
      } else {
        toast.error('Failed to update vehicle details.');
      }
    } catch (error) {
      toast.error('An error occurred while updating vehicle details.');
    } finally {
      setIsUpdating(false);
    }
  };

  if (!isOpen || !vehicle) return null;

  return (
    <div className="modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={onClose}>
      <div className="modal" style={{
        backgroundColor: 'white',
        padding: '20px',
        maxWidth: '600px',
        width: '90%',
        maxHeight: '80vh',
        overflowY: 'auto'
      }} onClick={e => e.stopPropagation()}>
        <div className="modal-header2">
          <h3>Update Vehicle Details</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <form onSubmit={handleUpdateVehicle} className="modal-body2">
          <div className="form-grid">

            <div className="form-group">
              <InputText label='Make *' name='make' value={updateFormData.make} onChange={handleUpdateChange} onBlur={handleUpdateBlur} className={getUpdateFieldClassNameLocal('make')}/>
              {updateTouched['make'] && updateErrors['make'] && <span className="error-message">{updateErrors['make']}</span>}
            </div>

            <div className="form-group">
              <InputText label='Model *' name='model' value={updateFormData.model} onChange={handleUpdateChange} onBlur={handleUpdateBlur} className={getUpdateFieldClassNameLocal('model')}/>
              {updateTouched['model'] && updateErrors['model'] && <span className="error-message">{updateErrors['model']}</span>}
            </div>

            <div className="form-group">
              <InputText label='Registration Number *' name="registrationNumber" value={updateFormData.registrationNumber} onChange={handleUpdateChange} onBlur={handleUpdateBlur} className={getUpdateFieldClassNameLocal('registrationNumber')}/>
              {updateTouched['registrationNumber'] && updateErrors['registrationNumber'] && <span className="error-message">{updateErrors['registrationNumber']}</span>}
            </div>

            <div className="form-group">
              <FormDateInput label='Purchase Date *'  name="purchaseDate" value={updateFormData.purchaseDate} onChange={handleUpdateChange} onBlur={handleUpdateBlur} className={getUpdateFieldClassNameLocal('purchaseDate')}/>
              {updateTouched['purchaseDate'] && updateErrors['purchaseDate'] && <span className="error-message">{updateErrors['purchaseDate']}</span>}
            </div>

            <div className="form-group">
              <InputText label='Purchase Price *' type='number' name="purchasePrice" value={updateFormData.purchasePrice} onChange={handleUpdateChange} onBlur={handleUpdateBlur} className={getUpdateFieldClassNameLocal('purchasePrice')} />
              {updateTouched['purchasePrice'] && updateErrors['purchasePrice'] && <span className="error-message">{updateErrors['purchasePrice']}</span>}
            </div>

            <div className="form-group">
              <InputText label='Kilometers *' type='number' name="kilometers" value={updateFormData.kilometers} onChange={handleUpdateChange} onBlur={handleUpdateBlur} className={getUpdateFieldClassNameLocal('kilometers')} />
              {updateTouched['kilometers'] && updateErrors['kilometers'] && <span className="error-message">{updateErrors['kilometers']}</span>}
            </div>

            <div className="form-group">
              <SelectInput label='Fuel Type *' name='fuelType' value={updateFormData.fuelType} onChange={handleUpdateChange} className={getUpdateFieldClassNameLocal('fuelType')}
              options={[{value:'',label:'Select Fuel Type', disabled:true},
                {value:'Petrol',label:'Petrol'},
                {value:'Diesel',label:'Diesel'},
                {value:'Electric',label:'Electric'},
                {value:'Hybrid',label:'Hybrid'},
                {value:'CNG',label:'CNG'},
              ]}/>
              {updateTouched['fuelType'] && updateErrors['fuelType'] && <span className="error-message">{updateErrors['fuelType']}</span>}
            </div>

            <div className="form-group">
              <InputText name="engineNumber" label='Engine Number *' value={updateFormData.engineNumber} onChange={handleUpdateChange} onBlur={handleUpdateBlur} className={getUpdateFieldClassNameLocal('engineNumber')} />
              {updateTouched['engineNumber'] && updateErrors['engineNumber'] && <span className="error-message">{updateErrors['engineNumber']}</span>}
            </div>

            <div className="form-group">
              <InputText label='Chassis Number *' name="chassisNumber" value={updateFormData.chassisNumber} onChange={handleUpdateChange} onBlur={handleUpdateBlur} className={getUpdateFieldClassNameLocal('chassisNumber')} />
              {updateTouched['chassisNumber'] && updateErrors['chassisNumber'] && <span className="error-message">{updateErrors['chassisNumber']}</span>}
            </div>

            <div className="form-group">
              <InputText label='Color *' name="color" value={updateFormData.color} onChange={handleUpdateChange} onBlur={handleUpdateBlur} className={getUpdateFieldClassNameLocal('color')} />
              {updateTouched['color'] && updateErrors['color'] && <span className="error-message">{updateErrors['color']}</span>}
            </div>

            <div className="form-group">
              <InputText label='Owner *' name="owner" value={updateFormData.owner} onChange={handleUpdateChange} onBlur={handleUpdateBlur} className={getUpdateFieldClassNameLocal('owner')} />
              {updateTouched['owner'] && updateErrors['owner'] && <span className="error-message">{updateErrors['owner']}</span>}
            </div>

            <div className="form-group">
              <InputText type='number' label='Phone *' name="phone" value={updateFormData.phone} onChange={handleUpdateChange} onBlur={handleUpdateBlur} className={getUpdateFieldClassNameLocal('phone')} />
              {updateTouched['phone'] && updateErrors['phone'] && <span className="error-message">{updateErrors['phone']}</span>}
            </div>

            <div className="form-group">
              <TextAreaInput label='Address *' name="address" value={updateFormData.address} onChange={handleUpdateChange} onBlur={handleUpdateBlur} className={getUpdateFieldClassNameLocal('address')} />
              {updateTouched['address'] && updateErrors['address'] && <span className="error-message">{updateErrors['address']}</span>}
            </div>

          </div>
          <div className="modal-footer2">
            <CancelButton type='button' onClick={onClose} text='Cancel'/>

            <ButtonWithGradient type='submit' className='btn' text='Update Vehicle' />
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateVehicleModal; 