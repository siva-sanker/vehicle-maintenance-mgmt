import { vehicleAPI, insuranceAPI, Vehicle, Insurance, claimsAPI } from '../services/api';

export interface Claim {
  id: string;
  registration_number:string;
  vehicle_id: string;
  claim_date: string;
  claim_amount: number;
  reason: string;
  status: string;
  created_at?: string;
  globalIndex?: number; // Optional, added when displaying
}

export interface FormData {
  id?: string;
  vehicle_id: string;
  claim_date: string;
  claim_amount: number | string;
  reason: string;
  created_at?: string;
  status: string;
}

export const getAllClaims = async (): Promise<Claim[]> => {
  try {
    const data = await claimsAPI.getAllClaims();    
    return data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

export const getClaimsByVehicleId = async (vehicle_id: string): Promise<Claim[]> => {
  try {
    const data = await claimsAPI.getClaimsByVehicle(vehicle_id);
    return data;
  } catch (err) {
    console.error(err);
    throw err;
  }
};

// Submit a new claim
export const submitClaim = async (
  formData: FormData
): Promise<{ success: boolean; message: string; updatedFormData?: FormData }> => {
  const vehicleId = formData.vehicle_id;

  if (!vehicleId) {
    return {
      success: false,
      message: 'Vehicle ID is missing.',
    };
  }

  try {
    const vehicle = await vehicleAPI.getVehicleById(vehicleId);

    const insurance = await insuranceAPI.getInsuranceByVehicle(vehicleId);
    if (!insurance || insurance.length === 0) {
      return {
        success: false,
        message: 'This vehicle does not have insurance. Please add insurance before submitting a claim.',
      };
    }

    await claimsAPI.createClaim({
      vehicle_id: formData.vehicle_id,
      claim_date: formData.claim_date,
      claim_amount: Number(formData.claim_amount),
      reason: formData.reason,
      status: formData.status || 'Pending',
    });

    return {
      success: true,
      message: 'Claim submitted and stored successfully!',
      updatedFormData: {
        vehicle_id: formData.vehicle_id,
        claim_date: '',
        claim_amount: '',
        reason: '',
        status: 'Pending',
      },
    };
  } catch (error) {
    console.error('Error submitting claim:', error);
    return {
      success: false,
      message: 'Error submitting claim. Please try again.',
    };
  }
};


export const updateClaimStatus = async (
  vehicleId: string,
  claimIndex: number,
  newStatus: string
): Promise<{ success: boolean; updatedClaims?: any[] }> => {
  try {
    const vehicle = await vehicleAPI.getVehicleById(vehicleId);
    console.log('Claim status would be updated:', {
      vehicleId,
      claimIndex,
      newStatus,
    });

    return {
      success: true,
      updatedClaims: [],
    };
  } catch (error) {
    console.error('Error updating claim status:', error);
    return {
      success: false,
    };
  }
};

export const fetchVehiclesData = async (): Promise<Vehicle[]> => {
  try {
    const vehiclesData = await vehicleAPI.getAllVehicles();
    return vehiclesData;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
};

export const getStatusIcon = (status: string) => {
  switch (status.toLowerCase()) {
    case 'approved':
      return 'check-circle';
    case 'rejected':
      return 'x-circle';
    default:
      return 'alert-triangle';
  }
};

export const getStatusClass = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'approved':
      return 'status-approved';
    case 'rejected':
      return 'status-rejected';
    default:
      return 'status-pending';
  }
};
