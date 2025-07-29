import React, { useState, useEffect } from 'react';
import { Vehicle } from '../services/api';
import { 
  InsuranceData, 
  ValidationErrors, 
  validateInsuranceForm, 
  isInsuranceFormValid, 
  addOrUpdateInsurance, 
  getResetInsuranceData, 
  populateFormWithExistingInsurance 
} from '../utils/vehicleUtils';
import { toast } from 'react-toastify';
import InputText from './InputText';
import SelectInput from './SelectInput';
import FormDateInput from './Date';
import ButtonWithGradient from './ButtonWithGradient';
import CancelButton from './CancelButton';

interface InsuranceModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle | null;
  onInsuranceUpdated: (updatedVehicle: Vehicle) => void;
}

const InsuranceModal: React.FC<InsuranceModalProps> = ({
  isOpen,
  onClose,
  vehicle,
  onInsuranceUpdated
}) => {
  const [insuranceData, setInsuranceData] = useState<InsuranceData>(getResetInsuranceData());
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (isOpen && vehicle) {
      const loadInsuranceData = async () => {
        try {
          const insuranceData = await populateFormWithExistingInsurance(vehicle);
          setInsuranceData(insuranceData);
        } catch (error) {
          console.error('Error loading insurance data:', error);
          setInsuranceData(getResetInsuranceData());
        }
      };
      
      loadInsuranceData();
      setValidationErrors({});
    }
  }, [isOpen, vehicle]);

  const resetForm = (): void => {
    setInsuranceData(getResetInsuranceData());
    setValidationErrors({});
    setIsSubmitting(false);
  };

  const handleAddInsurance = async (): Promise<void> => {
    if (!vehicle?.id) {
      console.error("Selected vehicle is missing an ID.");
      return;
    }

    // Validate form before submission
    const errors = validateInsuranceForm(insuranceData);
    setValidationErrors(errors);
    
    if (!isInsuranceFormValid(errors)) {
      toast.error("Please fix the validation errors before submitting");
      return;
    }

    setIsSubmitting(true);
    try {
      const updatedVehicle = await addOrUpdateInsurance(vehicle.id, insuranceData);

      if (updatedVehicle) {
        onInsuranceUpdated(updatedVehicle);
        onClose();
        setValidationErrors({});
        setInsuranceData(getResetInsuranceData());
        toast.success("Insurance information saved successfully!");
      } else {
        console.error("Failed to update insurance in db.json");
        toast.error("Failed to save insurance information");
      }
    } catch (error) {
      console.error("Error updating insurance:", error);
      toast.error("An error occurred while saving insurance information");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  if (!isOpen || !vehicle) return null;

  return (
    <div className="modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={handleClose}>
      <div className="modal" style={{
        backgroundColor: 'white',
        padding: '20px',
        maxWidth: '600px',
        width: '90%',
        maxHeight: '70vh',
        overflowY: 'auto'
      }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{insuranceData.hasInsurance ? 'Update' : 'Add'} Insurance for {vehicle?.make} {vehicle?.model}</h3>
          <button className="modal-close" onClick={handleClose}>×</button>
        </div>
        <div className="modal-body">
          <div className="form-grid">
            <div className="form-group">
              <InputText name='' label='Policy Number *' type="text"
                value={insuranceData.policyNumber}
                onChange={(e) => {
                  setInsuranceData({ ...insuranceData, policyNumber: e.target.value });
                  if (validationErrors.policyNumber) {
                    setValidationErrors({ ...validationErrors, policyNumber: '' });
                  }
                }}
                placeholder="Enter policy number"
                className={validationErrors.policyNumber ? 'error' : ''}/>
              {validationErrors.policyNumber && (
                <span className="error-message">{validationErrors.policyNumber}</span>
              )}
            </div>
            <div className="form-group">
              <InputText name='' label='Insurer *'type="text"
                value={insuranceData.insurer}
                onChange={(e) => {
                  setInsuranceData({ ...insuranceData, insurer: e.target.value });
                  if (validationErrors.insurer) {
                    setValidationErrors({ ...validationErrors, insurer: '' });
                  }
                }}
                placeholder="Enter insurer name"
                className={validationErrors.insurer ? 'error' : ''}
              />
              {validationErrors.insurer && (
                <span className="error-message">{validationErrors.insurer}</span>
              )}
            </div>
            <div className="form-group">
              <SelectInput label='Policy Type *' name='' value={insuranceData.policytype}
                onChange={(e) => {
                  setInsuranceData({ ...insuranceData, policytype: e.target.value });
                  if (validationErrors.policytype) {
                    setValidationErrors({ ...validationErrors, policytype: '' });
                  }
                }}
                className={validationErrors.policytype ? 'error' : ''}
                options={[
                  {value:'',label:'Select Policy type',disabled:true},
                  {value:'Comprehensive',label:'Comprehensive'},
                  {value:'Third Party',label:'Third Party'},
                  {value:'Liability',label:'Liability'},
                ]}/>
              {validationErrors.policytype && (
                <span className="error-message">{validationErrors.policytype}</span>
              )}
            </div>
            <div className="form-group">
              <FormDateInput label='Start Date *' name='' value={insuranceData.startDate}
                onChange={(e) => {
                  setInsuranceData({ ...insuranceData, startDate: e.target.value });
                  if (validationErrors.startDate) {
                    setValidationErrors({ ...validationErrors, startDate: '' });
                  }
                }}
                className={validationErrors.startDate ? 'error' : ''}/>
              {validationErrors.startDate && (
                <span className="error-message">{validationErrors.startDate}</span>
              )}
            </div>
            <div className="form-group">
              <FormDateInput label='End Date *' name='' value={insuranceData.endDate}
                onChange={(e) => {
                  setInsuranceData({ ...insuranceData, endDate: e.target.value });
                  if (validationErrors.endDate) {
                    setValidationErrors({ ...validationErrors, endDate: '' });
                  }
                }}
                className={validationErrors.endDate ? 'error' : ''}
              />
              {validationErrors.endDate && (
                <span className="error-message">{validationErrors.endDate}</span>
              )}
            </div>
            <div className="form-group">
              <FormDateInput label='Issue Date *' name='' value={insuranceData.issueDate}
                onChange={(e) => {
                  setInsuranceData({ ...insuranceData, issueDate: e.target.value });
                  if (validationErrors.issueDate) {
                    setValidationErrors({ ...validationErrors, issueDate: '' });
                  }
                }}
                className={validationErrors.issueDate ? 'error' : ''}
              />
              {validationErrors.issueDate && (
                <span className="error-message">{validationErrors.issueDate}</span>
              )}
            </div>
            <div className="form-group">
              <InputText type='number' name='amount' label='Premium Amount *' value={insuranceData.premiumAmount}
                onChange={(e) => {
                  setInsuranceData({ ...insuranceData, premiumAmount: e.target.value });
                  if (validationErrors.premiumAmount) {
                    setValidationErrors({ ...validationErrors, premiumAmount: '' });
                  }
                }}
                placeholder="Enter premium amount" className={validationErrors.premiumAmount ? 'error' : ''}/>
              {validationErrors.premiumAmount && (
                <span className="error-message">{validationErrors.premiumAmount}</span>
              )}
            </div>

            <div className="form-group">
              <SelectInput name='' label='Payment Mode *' value={insuranceData.payment}
                onChange={(e) => {
                  setInsuranceData({ ...insuranceData, payment: e.target.value });
                  if (validationErrors.payment) {
                    setValidationErrors({ ...validationErrors, payment: '' });
                  }
                }}
                className={validationErrors.payment ? 'error' : ''}
                options={[
                  {value:'',label:'Select payment mode',disabled:true},
                  {value:'cash',label:'Cash'},
                  {value:'card',label:'Card'},
                  {value:'upi',label:'UPI'},
                  {value:'bank account',label:'Bank Account'}
                ]}/>
              {validationErrors.payment && (
                <span className="error-message">{validationErrors.payment}</span>
              )}
            </div>
          </div>
        </div>
        <div className="modal-footer3">
          <CancelButton onClick={handleClose} text='Cancel'/>
          <ButtonWithGradient
           onClick={handleAddInsurance}>{isSubmitting ? 'Saving...' : (insuranceData.hasInsurance ? 'Update Insurance' : 'Add Insurance')}
          </ButtonWithGradient>
        </div>
      </div>
    </div>
  );
};

export default InsuranceModal; 