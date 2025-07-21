import { vehicleAPI, Vehicle } from '../services/api.ts';

export interface InsuranceData {
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

export interface Claim {
    claimDate: string;
    claimAmount: string;
    reason: string;
    status: string;
}

export interface ValidationErrors {
    [key: string]: string;
}

export interface UpdateFormData {
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

// Calculate vehicle age from purchase date
export const calculateVehicleAge = (purchaseDateString: string): number => {
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

// Filter vehicles based on search term
export const filterVehicles = (vehicles: Vehicle[], searchTerm: string): Vehicle[] => {
    return vehicles.filter(vehicle =>
        vehicle.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );
};

// Fetch all vehicles data
export const fetchVehiclesData = async (): Promise<Vehicle[]> => {
    try {
        const data = await vehicleAPI.getAllVehicles();
        return data;
    } catch (err) {
        console.error(err);
        throw err;
    }
};

// Validation functions for insurance form
export const validatePolicyNumber = (policyNumber: string): string => {
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

export const validateInsurer = (insurer: string): string => {
    if (!insurer.trim()) {
        return 'Insurer name is required';
    }
    if (insurer.trim().length < 2) {
        return 'Insurer name must be at least 2 characters long';
    }
    // if (!/^[A-Za-z\s]+$/.test(insurer.trim())) {
    //     return 'Insurer name can only contain letters and spaces';
    // }
    return '';
};

export const validatePolicyType = (policyType: string): string => {
    if (!policyType) {
        return 'Policy type is required';
    }
    return '';
};

export const validateDate = (date: string, fieldName: string): string => {
    if (!date) {
        return `${fieldName} is required`;
    }
    const selectedDate = new Date(date);
    // const today = new Date();
    // today.setHours(0, 0, 0, 0);

    // if (fieldName === 'Issue Date' && selectedDate) {
    //     return 'Issue date cannot be in the future';
    // }
    return '';
};

export const validateEndDate = (endDate: string, startDate: string): string => {
    if (!endDate) {
        return 'End date is required';
    }
    if (startDate && endDate <= startDate) {
        return 'End date must be after start date';
    }
    return '';
};

export const validatePremiumAmount = (amount: string): string => {
    if (!amount) {
        return 'Premium amount is required';
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
        return 'Premium amount must be a positive number';
    }
    // if (numAmount > 1000000) {
    //     return 'Premium amount cannot exceed ₹10,00,000';
    // }
    return '';
};

export const validatePaymentMode = (payment: string): string => {
    if (!payment) {
        return 'Payment mode is required';
    }
    return '';
};

// Validate entire insurance form
export const validateInsuranceForm = (insuranceData: InsuranceData): ValidationErrors => {
    const errors: ValidationErrors = {};

    errors.policyNumber = validatePolicyNumber(insuranceData.policyNumber);
    errors.insurer = validateInsurer(insuranceData.insurer);
    errors.policytype = validatePolicyType(insuranceData.policytype);
    errors.endDate = validateEndDate(insuranceData.endDate, insuranceData.startDate);
    errors.issueDate = validateDate(insuranceData.issueDate, 'Issue Date');
    errors.premiumAmount = validatePremiumAmount(insuranceData.premiumAmount);
    errors.payment = validatePaymentMode(insuranceData.payment);

    return errors;
};

// Check if insurance form is valid
export const isInsuranceFormValid = (errors: ValidationErrors): boolean => {
    return !Object.values(errors).some(error => error !== '');
};

// Add or update insurance for a vehicle
export const addOrUpdateInsurance = async (
    vehicleId: string,
    insuranceData: InsuranceData
): Promise<Vehicle | null> => {
    try {
        const updatedVehicle = await vehicleAPI.patchVehicle(vehicleId, {
            insurance: {
                ...insuranceData,
                hasInsurance: true
            }
        });
        return updatedVehicle;
    } catch (error) {
        console.error("Error updating insurance:", error);
        throw error;
    }
};

// Reset insurance form data
export const getResetInsuranceData = (): InsuranceData => ({
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

// Populate form with existing insurance data
export const populateFormWithExistingInsurance = (vehicle: Vehicle): InsuranceData => {
    if (vehicle.insurance) {
        return {
            policyNumber: vehicle.insurance.policyNumber || '',
            insurer: vehicle.insurance.insurer || '',
            policytype: vehicle.insurance.policytype || '',
            startDate: vehicle.insurance.startDate || '',
            endDate: vehicle.insurance.endDate || '',
            payment: vehicle.insurance.payment || '',
            issueDate: vehicle.insurance.issueDate || '',
            premiumAmount: vehicle.insurance.premiumAmount || '',
            hasInsurance: true,
        };
    }
    return getResetInsuranceData();
};

// Validation functions for update form
export const validateUpdateField = (name: string, value: string): string => {
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

// Validate entire update form
export const validateUpdateForm = (updateFormData: UpdateFormData): { [key: string]: string } => {
    const newErrors: { [key: string]: string } = {};
    Object.keys(updateFormData).forEach(key => {
        const error = validateUpdateField(key, updateFormData[key as keyof UpdateFormData]);
        if (error) {
            newErrors[key] = error;
        }
    });
    return newErrors;
};

// Check if update form is valid
export const isUpdateFormValid = (errors: { [key: string]: string }): boolean => {
    return Object.keys(errors).length === 0;
};

// Update vehicle details
export const updateVehicleDetails = async (
    vehicleId: string,
    updateFormData: UpdateFormData
): Promise<Vehicle | null> => {
    try {
        const updatedVehicle = await vehicleAPI.patchVehicle(vehicleId, updateFormData);
        return updatedVehicle;
    } catch (error) {
        console.error("Error updating vehicle:", error);
        throw error;
    }
};

// Get update form data from vehicle
export const getUpdateFormDataFromVehicle = (vehicle: Vehicle): UpdateFormData => ({
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

// Get field class name for update form styling
export const getUpdateFieldClassName = (
    fieldName: string,
    updateTouched: { [key: string]: boolean },
    updateErrors: { [key: string]: string },
    updateFormData: UpdateFormData
): string => {
    const baseClass = 'form-input';
    if (updateTouched[fieldName] && updateErrors[fieldName]) {
        return `${baseClass} error`;
    }
    if (updateTouched[fieldName] && !updateErrors[fieldName] && updateFormData[fieldName as keyof UpdateFormData]) {
        return `${baseClass} valid`;
    }
    return baseClass;
};

// Format a date string as dd-mm-yyyy
export const formatDateDDMMYYYY = (dateString: string): string => {
    if (!dateString || dateString === '-') return '-';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}-${month}-${year}`;
}; 