import { vehicleAPI, insuranceAPI, Vehicle, Insurance } from '../services/api';

// Get all claims from vehicles (placeholder since claims are stored separately)
export const getAllClaims = (vehicles: Vehicle[]): Claim[] => {
    // Since claims are stored separately, we'll return an empty array for now
    // In a real implementation, you would fetch claims from a separate claims API
    return [];
};

export interface Claim {
    claimDate: string;
    claimAmount: string;
    reason: string;
    status: string;
    vehicleId: string;
    registrationNumber: string;
    claimIndex: number;
    globalIndex?: number;
}

export interface FormData {
    vehicleId: string;
    claimDate: string;
    claimAmount: string;
    reason: string;
    status: string;
}



// Filter claims based on search term
export const filterClaims = (claims: Claim[], searchTerm: string): Claim[] => {
    return claims.filter(claim =>
        claim.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );
};

// Submit a new claim
export const submitClaim = async (
    formData: FormData,
    vehicleIdFromURL: string | null
): Promise<{ success: boolean; message: string; updatedFormData?: FormData }> => {
    const vehicleId = formData.vehicleId;

    try {
        // Get the current vehicle
        const vehicle = await vehicleAPI.getVehicleById(vehicleId);

        // Check if vehicle has insurance (using separate insurance table)
        const vehicleInsurance = await insuranceAPI.getInsuranceByVehicle(vehicleId);
        if (vehicleInsurance.length === 0) {
            return {
                success: false,
                message: 'This vehicle does not have insurance. Please add insurance before submitting a claim.'
            };
        }

        // Create new claim (placeholder - would use separate claims API)
        // For now, we'll just return success since claims are stored separately
        console.log('Claim would be created:', {
            vehicleId,
            claimDate: formData.claimDate,
            claimAmount: formData.claimAmount,
            reason: formData.reason,
            status: formData.status
        });

        // Return success with updated form data
        const updatedFormData = {
            vehicleId: vehicleIdFromURL || '',
            claimDate: '',
            claimAmount: '',
            reason: '',
            status: 'Pending',
        };

        return {
            success: true,
            message: 'Claim submitted successfully!',
            updatedFormData
        };

    } catch (error) {
        console.error('Error adding claim:', error);
        return {
            success: false,
            message: 'Error submitting claim. Please try again.'
        };
    }
};

// Update claim status
export const updateClaimStatus = async (
    vehicleId: string,
    claimIndex: number,
    newStatus: string
): Promise<{ success: boolean; updatedClaims?: any[] }> => {
    try {
        // Get the current vehicle
        const vehicle = await vehicleAPI.getVehicleById(vehicleId);

        // Update claim status (placeholder - would use separate claims API)
        // For now, we'll just return success since claims are stored separately
        console.log('Claim status would be updated:', {
            vehicleId,
            claimIndex,
            newStatus
        });

        return {
            success: true,
            updatedClaims: []
        };

    } catch (error) {
        console.error('Error updating claim status:', error);
        return {
            success: false
        };
    }
};

// Fetch all vehicles data
export const fetchVehiclesData = async (): Promise<Vehicle[]> => {
    try {
        const vehiclesData = await vehicleAPI.getAllVehicles();
        return vehiclesData;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
};

// Get status icon (commented out in original, but available for use)
export const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
        case 'approved':
            return 'check-circle'; // You can import and return actual icons if needed
        case 'rejected':
            return 'x-circle';
        default:
            return 'alert-triangle';
    }
};

// Get status CSS class
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