import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import {
  Car,
  // Calendar,
  FileText,
  // Fuel,
  Plus,
  Info,
  // ChevronLeft,
  // ChevronRight,
  // DollarSign,
} from 'lucide-react';
import { vehicleAPI, Vehicle } from '../services/api.ts';
import '../styles/Vehiclelist.css';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Searchbar from '../components/Searchbar';
import SectionHeading from '../components/SectionHeading.tsx';
import ButtonWithGradient from '../components/ButtonWithGradient';
import Table from '../components/Table';
import PageContainer from '../components/PageContainer.tsx';
// import { Shield } from 'lucide-react';

interface VehicleListProps {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

interface InsuranceData {
  policyNumber: string;
  insurer: string;
  policytype: string;
  startDate: string;
  endDate: string;
  payment: string;
  issueDate: string;
  premiumAmount: string;
  hasInsurance: boolean;
}

interface Claim {
  claimDate: string;
  claimAmount: string;
  reason: string;
  status: string;
}

interface ValidationErrors {
  [key: string]: string;
}

const VehicleList: React.FC<VehicleListProps> = ({ sidebarCollapsed, toggleSidebar }) => {
  const [claimsModalOpen, setClaimsModalOpen] = useState<boolean>(false);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loadingClaims, setLoadingClaims] = useState<boolean>(false);
  const [claimsError, setClaimsError] = useState<string>('');

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [showModal, setShowModal] = useState<boolean>(false);
  const [showDetailsModal, setShowDetailsModal] = useState<boolean>(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  // Search state
  const [searchTerm, setSearchTerm] = useState<string>('');

  const [insuranceData, setInsuranceData] = useState<InsuranceData>({
    policyNumber: '',
    insurer: '',
    policytype: '',
    startDate: '',
    endDate: '',
    payment: '',
    issueDate: '',
    premiumAmount: '',
    hasInsurance: false,
  });

  // Validation state
  const [validationErrors, setValidationErrors] = useState<ValidationErrors>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // 1. Add state for update modal and form data
  const [showUpdateModal, setShowUpdateModal] = useState<boolean>(false);
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

  const calculateVehicleAge = (purchaseDateString: string): number => {
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

  // Validation functions
  const validatePolicyNumber = (policyNumber: string): string => {
    if (!policyNumber.trim()) {
      return 'Policy number is required';
    }
    if (policyNumber.trim().length < 5) {
      return 'Policy number must be at least 5 characters long';
    }
    if (!/^[A-Z0-9/-]+$/.test(policyNumber.trim())) {
      return 'Policy number can only contain letters, numbers, hyphens, and forward slashes';
    }
    return '';
  };

  const validateInsurer = (insurer: string): string => {
    if (!insurer.trim()) {
      return 'Insurer name is required';
    }
    if (insurer.trim().length < 2) {
      return 'Insurer name must be at least 2 characters long';
    }
    if (!/^[A-Za-z\s]+$/.test(insurer.trim())) {
      return 'Insurer name can only contain letters and spaces';
    }
    return '';
  };

  const validatePolicyType = (policyType: string): string => {
    if (!policyType) {
      return 'Policy type is required';
    }
    return '';
  };

  const validateDate = (date: string, fieldName: string): string => {
    if (!date) {
      return `${fieldName} is required`;
    }
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // if (fieldName === 'Start Date' && selectedDate < today) {
    //   return 'Start date cannot be in the past';
    // }
    if (fieldName === 'Issue Date' && selectedDate > today) {
      return 'Issue date cannot be in the future';
    }
    return '';
  };

  const validateEndDate = (endDate: string, startDate: string): string => {
    if (!endDate) {
      return 'End date is required';
    }
    if (startDate && endDate <= startDate) {
      return 'End date must be after start date';
    }
    return '';
  };

  const validatePremiumAmount = (amount: string): string => {
    if (!amount) {
      return 'Premium amount is required';
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      return 'Premium amount must be a positive number';
    }
    if (numAmount > 1000000) {
      return 'Premium amount cannot exceed ₹10,00,000';
    }
    return '';
  };

  const validatePaymentMode = (payment: string): string => {
    if (!payment) {
      return 'Payment mode is required';
    }
    return '';
  };

  const validateInsuranceForm = (): boolean => {
    const errors: ValidationErrors = {};

    errors.policyNumber = validatePolicyNumber(insuranceData.policyNumber);
    errors.insurer = validateInsurer(insuranceData.insurer);
    errors.policytype = validatePolicyType(insuranceData.policytype);
    // errors.startDate = validateDate(insuranceData.startDate, 'Start Date');
    errors.endDate = validateEndDate(insuranceData.endDate, insuranceData.startDate);
    errors.issueDate = validateDate(insuranceData.issueDate, 'Issue Date');
    errors.premiumAmount = validatePremiumAmount(insuranceData.premiumAmount);
    errors.payment = validatePaymentMode(insuranceData.payment);

    setValidationErrors(errors);

    // Check if there are any errors
    return !Object.values(errors).some(error => error !== '');
  };

  // Filter vehicles based on search term
  const filteredVehicles = vehicles.filter(vehicle =>
    vehicle.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const navigate = useNavigate();
  // const goToClaims = (vehicleId: string) => {
  //   navigate(`/claims?vehicleId=${vehicleId}`);
  // };

  useEffect(() => {
    const fetchVehicles = async (): Promise<void> => {
      try {
        const data = await vehicleAPI.getAllVehicles();
        setVehicles(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchVehicles();
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

  const viewClaims = async (vehicleId: string): Promise<void> => {
    console.log('viewClaims called with vehicleId:', vehicleId);
    // Find the vehicle to check insurance
    const vehicle = vehicles.find(v => v.id === vehicleId);
    console.log('Found vehicle:', vehicle);

    // Check if vehicle has insurance
    if (!vehicle?.insurance) {
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

  const handleAddInsurance = async (): Promise<void> => {
    if (!selectedVehicle?.id) {
      console.error("Selected vehicle is missing an ID.");
      return;
    }

    // Validate form before submission
    if (!validateInsuranceForm()) {
      toast.error("Please fix the validation errors before submitting");
      return;
    }

    setIsSubmitting(true);
    try {
      const updatedVehicle = await vehicleAPI.patchVehicle(selectedVehicle.id, {
        insurance: {
          ...insuranceData,
          hasInsurance: true
        }
      });

      if (updatedVehicle) {
        const updatedVehicles = vehicles.map((v) =>
          v.id === updatedVehicle.id ? updatedVehicle : v
        );
        setVehicles(updatedVehicles);
        setShowModal(false);
        setValidationErrors({});
        setInsuranceData({
          policyNumber: '',
          insurer: '',
          policytype: '',
          startDate: '',
          endDate: '',
          payment: '',
          issueDate: '',
          premiumAmount: '',
          hasInsurance: false,
        });
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

  const resetForm = (): void => {
    setInsuranceData({
      policyNumber: '',
      insurer: '',
      policytype: '',
      startDate: '',
      endDate: '',
      payment: '',
      issueDate: '',
      premiumAmount: '',
      hasInsurance: false,
    });
    setValidationErrors({});
    setIsSubmitting(false);
  };

  const populateFormWithExistingInsurance = (vehicle: Vehicle): void => {
    if (vehicle.insurance) {
      setInsuranceData({
        policyNumber: vehicle.insurance.policyNumber || '',
        insurer: vehicle.insurance.insurer || '',
        policytype: vehicle.insurance.policytype || '',
        startDate: vehicle.insurance.startDate || '',
        endDate: vehicle.insurance.endDate || '',
        payment: vehicle.insurance.payment || '',
        issueDate: vehicle.insurance.issueDate || '',
        premiumAmount: vehicle.insurance.premiumAmount || '',
        hasInsurance: true,
      });
    }
  };

  const showVehicleDetails = (vehicle: Vehicle): void => {
    setSelectedVehicle(vehicle);
    setShowDetailsModal(true);
  };

  // 2. Function to open update modal and prefill data
  const openUpdateModal = (vehicle: Vehicle) => {
    setUpdateFormData({
      make: vehicle.make || '',
      model: vehicle.model || '',
      purchaseDate: vehicle.purchaseDate || '',
      registrationNumber: vehicle.registrationNumber || '',
      purchasePrice: vehicle.purchasePrice || '',
      fuelType: vehicle.fuelType || '',
      engineNumber: vehicle.engineNumber || '',
      chassisNumber: vehicle.chassisNumber || '',
      kilometers: vehicle.kilometers || '',
      color: vehicle.color || '',
      owner: vehicle.owner || '',
      phone: vehicle.phone || '',
      address: vehicle.address || ''
    });
    setUpdateErrors({});
    setUpdateTouched({});
    setShowUpdateModal(true);
  };

  // 3. Validation for update form (reuse registration logic)
  const validateUpdateField = (name: string, value: string): string => {
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
        return value.trim().length < 10 ? 'Address must be at least 10 characters' : '';
      case 'purchaseDate':
        const selectedDate = new Date(value);
        const today = new Date();
        return !value ? 'Purchase date is required' :
          selectedDate > today ? 'Purchase date cannot be in the future' : '';
      default:
        return '';
    }
  };
  const validateUpdateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};
    Object.keys(updateFormData).forEach(key => {
      const error = validateUpdateField(key, updateFormData[key as keyof typeof updateFormData]);
      if (error) {
        newErrors[key] = error;
      }
    });
    setUpdateErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 4. Handle update form change/blur
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
  const getUpdateFieldClassName = (fieldName: string): string => {
    const baseClass = 'form-input';
    if (updateTouched[fieldName] && updateErrors[fieldName]) {
      return `${baseClass} error`;
    }
    if (updateTouched[fieldName] && !updateErrors[fieldName] && updateFormData[fieldName as keyof typeof updateFormData]) {
      return `${baseClass} valid`;
    }
    return baseClass;
  };

  // 5. Handle update submit
  const handleUpdateVehicle = async (e: React.FormEvent) => {
    e.preventDefault();
    // Mark all as touched
    const allTouched: { [key: string]: boolean } = {};
    Object.keys(updateFormData).forEach(key => { allTouched[key] = true; });
    setUpdateTouched(allTouched);
    if (!validateUpdateForm()) {
      toast.error('Please fix the errors in the form before submitting.');
      return;
    }
    if (!selectedVehicle?.id) return;
    setIsUpdating(true);
    try {
      const updatedVehicle = await vehicleAPI.patchVehicle(selectedVehicle.id, updateFormData);
      if (updatedVehicle) {
        setVehicles(vehicles.map(v => v.id === updatedVehicle.id ? updatedVehicle : v));
        setShowUpdateModal(false);
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

  return (
    <>
      {/* <Header sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} /> */}
      <Header sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} showDate showTime showCalculator />
      {/* <div className="vehicle-list-container"> */}
      <PageContainer>
        <SectionHeading title='Vehicle List' subtitle='Manage and view all your registered vehicles'/>
        {/* <div className="vehicle-list-header">
          <div className="header-content">
            <h1 className="page-title">
              <Car className="page-icon" />
              Registered Vehicles
            </h1>
            <p className="page-subtitle">Manage and view all your registered vehicles</p>
          </div>
        </div> */}
          <div className="header-actions2 d-flex justify-content-end">
            <div className="search border border-grey d-flex justify-content-center align-items-center">
              <Searchbar
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>


        {vehicles.length === 0 ? (
          <div className="empty-state">
            <Car size={64} className="empty-icon" />
            <h3>No vehicles registered yet</h3>
            <p>Start by adding your first vehicle to the system</p>
            {/* <button className="btn-primary" onClick={() => navigate('/register-vehicle')}> */}
            <ButtonWithGradient text='Click here to register' onClick={()=>navigate('\register-vehicle')} />
              {/* <Plus size={16} /> */}
              {/* Register Vehicle */}
            {/* </button> */}
          </div>
        ) : (
          <div className="table-container">
            {/* <div className="section-header">
              <Shield size={20} className="section-icon" />
              <h3>Vehicle Insurance Details</h3>
            </div> */}
            {/* <div className="searchBar2">
            </div> */}
            <Table
              columns={[
                { key: 'make', header: 'Make' },
                { key: 'model', header: 'Model' },
                { key: 'registrationNumber', header: 'Reg. Number' },
                { key: 'purchaseDate', header: 'Purchase Date' },
                { key: 'color', header: 'Color' },
                { key: 'age', header: 'Age' },
                { key: 'fuelType', header: 'Fuel Type' },
                { key: 'purchasePrice', header: 'Price' },
                { key: 'actions', header: 'Actions' },
                { key: 'status', header: 'Status' },
              ]}
              data={filteredVehicles.map((vehicle, index) => ({
                ...vehicle,
                age: `${calculateVehicleAge(vehicle.purchaseDate)} years`,
                fuelType: (
                  <span className={`fuel-badge ${vehicle.fuelType.toLowerCase()}`}>
                    {vehicle.fuelType}
                  </span>
                ),
                purchasePrice: `${vehicle.purchasePrice} /-`,
                actions: (
                  <button
                    className="btn-details"
                    onClick={() => showVehicleDetails(vehicle)}
                  >
                    <Info size={16} />
                    More Details
                  </button>
                ),
                status: (
                  <select name="status" id="" className="status-selector">
                    <option value="" selected disabled>Set status</option>
                    <option value="">Active</option>
                    <option value="">Inactive</option>
                    <option value="">Maintenance</option>
                  </select>
                ),
              }))}
            />
          </div>
        )}

        {/* Vehicle Details Modal */}
        {showDetailsModal && selectedVehicle && (
  <div className="modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
    onClick={() => setShowDetailsModal(false)}>
    <div className="vehicle-details-modal" onClick={e => e.stopPropagation()}>
      <div className="modal-header">
        <span className="modal-title text-capitalize">
          Vehicle Details - {selectedVehicle.make} {selectedVehicle.model}
        </span>
        <button className="modal-close" onClick={() => setShowDetailsModal(false)}>×</button>
      </div>
      <div className="vehicle-details-card">
        <div className="vehicle-details-top">
          <div>
            <h3 className="vehicle-name text-capitalize">{selectedVehicle.make} {selectedVehicle.model}</h3>
            <div className="vehicle-reg text-uppercase">{selectedVehicle.registrationNumber}</div>
          </div>
          <span className="year-badge">{new Date(selectedVehicle.purchaseDate).getFullYear()}</span>
        </div>
        <div className="info-section">
            <h5 className='info-title'>Basic Details</h5>
          <div className="info-grid">
            <div>
              <span className="info-label">Color:</span>
              <span>{selectedVehicle.color}</span>
            </div>
            <div>
              <span className="info-label">Age:</span>
              <span>{calculateVehicleAge(selectedVehicle.purchaseDate)} years</span>
            </div>
            <div>
              <span className="info-label">Fuel Type:</span>
              <span className={`fuel-badge ${selectedVehicle.fuelType.toLowerCase()}`}>{selectedVehicle.fuelType}</span>
            </div>
          </div>
        </div>
        <div className="info-section">
            <h5 className='info-title'>More Details</h5>
          <div className="info-grid">
            <div>
              <span className="info-label">Engine No.:</span>
              <span>{selectedVehicle.engineNumber}</span>
            </div>
            <div>
              <span className="info-label">Chassis No.:</span>
              <span>{selectedVehicle.chassisNumber}</span>
            </div>
            <div>
              <span className="info-label">Price:</span>
              <span>₹{selectedVehicle.purchasePrice}</span>
            </div>
          </div>
        </div>
        <div className="info-section">
            <h5 className='info-title'>Owner Details</h5>
          <div className="info-grid">
            <div>
              <span className="info-label">Owner:</span>
              <span className="text-capitalize">{selectedVehicle.owner}</span>
            </div>
            <div>
              <span className="info-label">Phone:</span>
              <span>{selectedVehicle.phone}</span>
            </div>
            <div className="full-width">
              <span className="info-label">Address:</span>
              <span>{selectedVehicle.address}</span>
            </div>
          </div>
        </div>
        <div className="info-section">
            <h5 className='info-title'>Insurance Details</h5>
          <div className="info-grid">
            {selectedVehicle.insurance ? (
              <>
                <div>
                  <span className="info-label">Policy #:</span>
                  <span>{selectedVehicle.insurance.policyNumber}</span>
                </div>
                <div>
                  <span className="info-label">Insurer:</span>
                  <span>{selectedVehicle.insurance.insurer}</span>
                </div>
                <div>
                  <span className="info-label">Type:</span>
                  <span>{selectedVehicle.insurance.policytype}</span>
                </div>
                <div>
                  <span className="info-label">Premium:</span>
                  <span>₹{selectedVehicle.insurance.premiumAmount}</span>
                </div>
              </>
            ) : (
              <div className="no-insurance">No insurance information available</div>
            )}
          </div>
        </div>
        <div className="modal-footer">
          <div className="vehicle-details-actions" style={{ gap: '3rem' }}>
            <button
              className="btn-outline"
              style={{
                padding: '0.8rem 1.2rem',
                fontSize: '0.85rem',
                minHeight: '32px',
                minWidth: 'unset'
              }}
              onClick={() => {
                if (selectedVehicle.insurance) {
                  viewClaims(selectedVehicle.id);
                  setShowDetailsModal(false);
                } else {
                  toast.error("Vehicle has no insurance");
                }
              }}
            >
              View Claims
            </button>
            <button
              className="btn-outline"
              style={{
                padding: '0.3rem 0.7rem',
                fontSize: '0.85rem',
                minHeight: '32px',
                minWidth: 'unset'
              }}
              onClick={() => {
                setShowDetailsModal(false);
                if (selectedVehicle.insurance) {
                  populateFormWithExistingInsurance(selectedVehicle);
                } else {
                  resetForm();
                }
                setShowModal(true);
              }}
            >
              {selectedVehicle.insurance ? 'Update Insurance' : 'Add Insurance'}
            </button>
            <button
              className="btn-outline"
              style={{
                padding: '0.3rem 0.7rem',
                fontSize: '0.85rem',
                minHeight: '32px',
                minWidth: 'unset'
              }}
              onClick={() => {
                setShowDetailsModal(false);
                openUpdateModal(selectedVehicle);
              }}
            >
              Update Vehicle Details
            </button>
          </div>
        </div>
      </div>
      {/* <div className="modal-footer">
        <button className="btn-secondary" onClick={() => setShowDetailsModal(false)}>Close</button>
      </div> */}
    </div>
  </div>
)}

        {/* Insurance Modal */}
        {showModal && (
          <div className="modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={() => { setShowModal(false); resetForm(); }}>
            <div className="modal" style={{
              backgroundColor: 'white',
              padding: '20px',
              maxWidth: '600px',
              width: '90%',
              maxHeight: '70vh',
              overflowY: 'auto'
            }} onClick={e => e.stopPropagation()}>
              <div className="modal-header">
                <h3>{selectedVehicle?.insurance ? 'Update' : 'Add'} Insurance for {selectedVehicle?.make} {selectedVehicle?.model}</h3>
                <button className="modal-close" onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}>×</button>
              </div>
              <div className="modal-body">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Policy Number *</label>
                    <input
                      type="text"
                      value={insuranceData.policyNumber}
                      onChange={(e) => {
                        setInsuranceData({ ...insuranceData, policyNumber: e.target.value });
                        if (validationErrors.policyNumber) {
                          setValidationErrors({ ...validationErrors, policyNumber: '' });
                        }
                      }}
                      placeholder="Enter policy number"
                      className={validationErrors.policyNumber ? 'error' : ''}
                    />
                    {validationErrors.policyNumber && (
                      <span className="error-message">{validationErrors.policyNumber}</span>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Insurer *</label>
                    <input
                      type="text"
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
                    <label>Policy Type *</label>
                    <select
                      value={insuranceData.policytype}
                      onChange={(e) => {
                        setInsuranceData({ ...insuranceData, policytype: e.target.value });
                        if (validationErrors.policytype) {
                          setValidationErrors({ ...validationErrors, policytype: '' });
                        }
                      }}
                      className={validationErrors.policytype ? 'error' : ''}
                    >
                      <option value="" selected disabled>Select policy type</option>
                      <option value="Comprehensive">Comprehensive</option>
                      <option value="Third Party">Third Party</option>
                      <option value="Liability">Liability</option>
                    </select>
                    {validationErrors.policytype && (
                      <span className="error-message">{validationErrors.policytype}</span>
                    )}
                  </div>
                  <div className="form-group">
                    <label>Start Date *</label>
                    <input
                      type="date"
                      value={insuranceData.startDate}
                      onChange={(e) => {
                        setInsuranceData({ ...insuranceData, startDate: e.target.value });
                        if (validationErrors.startDate) {
                          setValidationErrors({ ...validationErrors, startDate: '' });
                        }
                      }}
                      className={validationErrors.startDate ? 'error' : ''}
                    />
                    {validationErrors.startDate && (
                      <span className="error-message">{validationErrors.startDate}</span>
                    )}
                  </div>
                  <div className="form-group">
                    <label>End Date *</label>
                    <input
                      type="date"
                      value={insuranceData.endDate}
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
                    <label>Issue Date *</label>
                    <input
                      type="date"
                      value={insuranceData.issueDate}
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
                    <label>Premium Amount *</label>
                    <input
                      type="number"
                      value={insuranceData.premiumAmount}
                      onChange={(e) => {
                        setInsuranceData({ ...insuranceData, premiumAmount: e.target.value });
                        if (validationErrors.premiumAmount) {
                          setValidationErrors({ ...validationErrors, premiumAmount: '' });
                        }
                      }}
                      placeholder="Enter premium amount"
                      min="0"
                      step="0.01"
                      className={validationErrors.premiumAmount ? 'error' : ''}
                    />
                    {validationErrors.premiumAmount && (
                      <span className="error-message">{validationErrors.premiumAmount}</span>
                    )}
                  </div>

                  <div className="form-group">
                    <label>Payment Mode *</label>
                    <select
                      value={insuranceData.payment}
                      onChange={(e) => {
                        setInsuranceData({ ...insuranceData, payment: e.target.value });
                        if (validationErrors.payment) {
                          setValidationErrors({ ...validationErrors, payment: '' });
                        }
                      }}
                      className={validationErrors.payment ? 'error' : ''}
                    >
                      <option value="" selected disabled>Select payment mode</option>
                      <option value="cash">Cash</option>
                      <option value="card">Card</option>
                      <option value="upi">UPI</option>
                      <option value="bank account">Bank Account</option>
                    </select>
                    {validationErrors.payment && (
                      <span className="error-message">{validationErrors.payment}</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="modal-footer3">
                <button className="btn-primary" style={{backgroundColor: 'red', color: 'white'}} onClick={() => {
                  setShowModal(false);
                  resetForm();
                }}>Cancel</button>
                <button
                  className="btn-primary"
                  onClick={handleAddInsurance}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Saving...' : (selectedVehicle?.insurance ? 'Update Insurance' : 'Add Insurance')}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Claims Modal */}
        {claimsModalOpen && (
          <div className="modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={() => setClaimsModalOpen(false)}>
            <div className="modal" style={{
              backgroundColor: 'white',
              padding: '20px',
              maxWidth: '500px',
              width: '90%',
              overflowY: 'auto'
            }} onClick={e => e.stopPropagation()}>
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

        {/* Update Vehicle Details Modal */}
        {showUpdateModal && (
          <div className="modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            onClick={() => setShowUpdateModal(false)}>
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
                <button className="modal-close" onClick={() => setShowUpdateModal(false)}>×</button>
              </div>
              <form onSubmit={handleUpdateVehicle} className="modal-body2">
                <div className="form-grid">
                  <div className="form-group">
                    <label>Make *</label>
                    <input name="make" value={updateFormData.make} onChange={handleUpdateChange} onBlur={handleUpdateBlur} className={getUpdateFieldClassName('make')} />
                    {updateTouched['make'] && updateErrors['make'] && <span className="error-message">{updateErrors['make']}</span>}
                  </div>
                  <div className="form-group">
                    <label>Model *</label>
                    <input name="model" value={updateFormData.model} onChange={handleUpdateChange} onBlur={handleUpdateBlur} className={getUpdateFieldClassName('model')} />
                    {updateTouched['model'] && updateErrors['model'] && <span className="error-message">{updateErrors['model']}</span>}
                  </div>
                  <div className="form-group">
                    <label>Registration Number *</label>
                    <input name="registrationNumber" value={updateFormData.registrationNumber} onChange={handleUpdateChange} onBlur={handleUpdateBlur} className={getUpdateFieldClassName('registrationNumber')} />
                    {updateTouched['registrationNumber'] && updateErrors['registrationNumber'] && <span className="error-message">{updateErrors['registrationNumber']}</span>}
                  </div>
                  <div className="form-group">
                    <label>Purchase Date *</label>
                    <input type="date" name="purchaseDate" value={updateFormData.purchaseDate} onChange={handleUpdateChange} onBlur={handleUpdateBlur} className={getUpdateFieldClassName('purchaseDate')} />
                    {updateTouched['purchaseDate'] && updateErrors['purchaseDate'] && <span className="error-message">{updateErrors['purchaseDate']}</span>}
                  </div>
                  <div className="form-group">
                    <label>Purchase Price *</label>
                    <input type="number" name="purchasePrice" value={updateFormData.purchasePrice} onChange={handleUpdateChange} onBlur={handleUpdateBlur} min={45000} className={getUpdateFieldClassName('purchasePrice')} />
                    {updateTouched['purchasePrice'] && updateErrors['purchasePrice'] && <span className="error-message">{updateErrors['purchasePrice']}</span>}
                  </div>
                  <div className="form-group">
                    <label>Kilometers *</label>
                    <input type="number" name="kilometers" value={updateFormData.kilometers} onChange={handleUpdateChange} onBlur={handleUpdateBlur} min={0} className={getUpdateFieldClassName('kilometers')} />
                    {updateTouched['kilometers'] && updateErrors['kilometers'] && <span className="error-message">{updateErrors['kilometers']}</span>}
                  </div>
                  <div className="form-group">
                    <label>Fuel Type *</label>
                    <select name="fuelType" value={updateFormData.fuelType} onChange={handleUpdateChange} onBlur={handleUpdateBlur} className={getUpdateFieldClassName('fuelType')}>
                      <option value="" disabled>Select fuel type</option>
                      <option value="Petrol">Petrol</option>
                      <option value="Diesel">Diesel</option>
                      <option value="Electric">Electric</option>
                      <option value="Hybrid">Hybrid</option>
                    </select>
                    {updateTouched['fuelType'] && updateErrors['fuelType'] && <span className="error-message">{updateErrors['fuelType']}</span>}
                  </div>
                  <div className="form-group">
                    <label>Engine Number *</label>
                    <input name="engineNumber" value={updateFormData.engineNumber} onChange={handleUpdateChange} onBlur={handleUpdateBlur} className={getUpdateFieldClassName('engineNumber')} />
                    {updateTouched['engineNumber'] && updateErrors['engineNumber'] && <span className="error-message">{updateErrors['engineNumber']}</span>}
                  </div>
                  <div className="form-group">
                    <label>Chassis Number *</label>
                    <input name="chassisNumber" value={updateFormData.chassisNumber} onChange={handleUpdateChange} onBlur={handleUpdateBlur} className={getUpdateFieldClassName('chassisNumber')} />
                    {updateTouched['chassisNumber'] && updateErrors['chassisNumber'] && <span className="error-message">{updateErrors['chassisNumber']}</span>}
                  </div>
                  <div className="form-group">
                    <label>Color *</label>
                    <input name="color" value={updateFormData.color} onChange={handleUpdateChange} onBlur={handleUpdateBlur} className={getUpdateFieldClassName('color')} />
                    {updateTouched['color'] && updateErrors['color'] && <span className="error-message">{updateErrors['color']}</span>}
                  </div>
                  <div className="form-group">
                    <label>Owner *</label>
                    <input name="owner" value={updateFormData.owner} onChange={handleUpdateChange} onBlur={handleUpdateBlur} className={getUpdateFieldClassName('owner')} />
                    {updateTouched['owner'] && updateErrors['owner'] && <span className="error-message">{updateErrors['owner']}</span>}
                  </div>
                  <div className="form-group">
                    <label>Phone *</label>
                    <input name="phone" value={updateFormData.phone} onChange={handleUpdateChange} onBlur={handleUpdateBlur} className={getUpdateFieldClassName('phone')} />
                    {updateTouched['phone'] && updateErrors['phone'] && <span className="error-message">{updateErrors['phone']}</span>}
                  </div>
                  <div className="form-group">
                    <label>Address *</label>
                    <textarea name="address" value={updateFormData.address} onChange={handleUpdateChange} onBlur={handleUpdateBlur} className={getUpdateFieldClassName('address')} />
                    {updateTouched['address'] && updateErrors['address'] && <span className="error-message">{updateErrors['address']}</span>}
                  </div>
                </div>
                <div className="modal-footer2">
                  <button className="btn-primary" style={{backgroundColor: 'red', color: 'white'}} type="button" onClick={() => setShowUpdateModal(false)}>Cancel</button>
                  <button className="btn-primary" type="submit" disabled={isUpdating}>{isUpdating ? 'Updating...' : 'Update Vehicle'}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        <ToastContainer />
      {/* </div> */}
      </PageContainer>
      <Footer />
    </>
  );
};

export default VehicleList; 