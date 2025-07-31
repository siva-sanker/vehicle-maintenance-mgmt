import { toast } from 'react-toastify';
import { vehicleAPI } from '../services/api';

export interface FormData {
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

export interface FormErrors {
    [key: string]: string;
}

export interface FormTouched {
    [key: string]: boolean;
}

// Validation functions
export const validateField = (name: string, value: string): string => {
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

// Validate entire form
export const validateForm = (formData: FormData): FormErrors => {
    const newErrors: FormErrors = {};
    Object.keys(formData).forEach(key => {
        const error = validateField(key, formData[key as keyof FormData]);
        if (error) {
            newErrors[key] = error;
        }
    });
    return newErrors;
};

// Check if form is valid
export const isFormValid = (errors: FormErrors): boolean => {
    return Object.keys(errors).length === 0;
};

// Get initial form data
export const getInitialFormData = (): FormData => ({
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

// Create a new vehicle
export const createVehicle = async (formData: FormData): Promise<any> => {
    try {
        // Transform camelCase form data to snake_case API format
        const vehicleData = {
            make: formData.make,
            model: formData.model,
            purchase_date: formData.purchaseDate,
            registration_number: formData.registrationNumber,
            purchase_price: parseFloat(formData.purchasePrice) || 0,
            fuel_type: formData.fuelType,
            engine_number: formData.engineNumber,
            chassis_number: formData.chassisNumber,
            kilometers: parseFloat(formData.kilometers) || 0,
            color: formData.color,
            owner: formData.owner,
            phone: formData.phone,
            address: formData.address,
            status: 'active',
            last_updated: new Date().toISOString(),
            created_at: new Date().toISOString()
        };

        // console.log('Sending vehicle data to API:', vehicleData);
        const response = await vehicleAPI.createVehicle(vehicleData);
        return response;
    } catch (error) {
        console.error('Error creating vehicle:', error);
        throw error;
    }
};

// Get field class name for styling
export const getFieldClassName = (
    fieldName: string,
    touched: FormTouched,
    errors: FormErrors,
    formData: FormData
): string => {
    const baseClass = 'form-input';
    if (touched[fieldName] && errors[fieldName]) {
        return `${baseClass} error`;
    }
    if (touched[fieldName] && !errors[fieldName] && formData[fieldName as keyof FormData]) {
        return `${baseClass} valid`;
    }
    return baseClass;
};

// Get all touched fields
export const getAllTouchedFields = (formData: FormData): FormTouched => {
    const allTouched: FormTouched = {};
    Object.keys(formData).forEach(key => {
        allTouched[key] = true;
    });
    return allTouched;
};

// Handle form field change
export const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
    formData: FormData,
    setFormData: React.Dispatch<React.SetStateAction<FormData>>,
    errors: FormErrors,
    setErrors: React.Dispatch<React.SetStateAction<FormErrors>>
): void => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    // Clear error when user starts typing
    if (errors[name]) {
        setErrors(prev => ({ ...prev, [name]: '' }));
    }
};

// Handle form field blur
export const handleFormBlur = (
    e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
    setTouched: React.Dispatch<React.SetStateAction<FormTouched>>,
    setErrors: React.Dispatch<React.SetStateAction<FormErrors>>
): void => {
    const { name, value } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));

    const error = validateField(name, value);
    setErrors(prev => ({ ...prev, [name]: error }));
};

// Handle form submission
export const handleFormSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
    formData: FormData,
    setTouched: React.Dispatch<React.SetStateAction<FormTouched>>,
    setErrors: React.Dispatch<React.SetStateAction<FormErrors>>,
    setFormData: React.Dispatch<React.SetStateAction<FormData>>,
    setSuccessMessage: React.Dispatch<React.SetStateAction<string>>
): Promise<boolean> => {
    e.preventDefault();

    // Mark all fields as touched
    const allTouched = getAllTouchedFields(formData);
    setTouched(allTouched);

    const errors = validateForm(formData);
    setErrors(errors);

    if (!isFormValid(errors)) {
        alert('Please fix the errors in the form before submitting.');
        return false;
    }

    try {
        const response = await createVehicle(formData);

        if (response) {
            // setSuccessMessage('Vehicle registered successfully!');
            toast.success('Vehicle registered successfully!');
            console.log('registration response:', response);
            
            setFormData(getInitialFormData());
            setErrors({});
            setTouched({});

            // Clear success message after 3 seconds
            setTimeout(() => {
                setSuccessMessage('');
            }, 3000);

            return true;
        } else {
            toast.error('Failed to register vehicle.');
            // alert('Failed to register vehicle.');
            return false;
        }
    } catch (error) {
        console.error('Error:', error);
        toast.error('An error occurred while submitting the form.');
        // alert('An error occurred while submitting the form.');
        return false;
    }
};

// Fuel type options for select input
export const getFuelTypeOptions = () => [
    { value: '', label: 'Select Fuel Type', disabled: true },
    { value: 'Petrol', label: 'Petrol' },
    { value: 'Diesel', label: 'Diesel' },
    { value: 'Electric', label: 'Electric' },
    { value: 'Hybrid', label: 'Hybrid' },
    { value: 'CNG', label: 'CNG' },
]; 