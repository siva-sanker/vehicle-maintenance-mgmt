import { vehicleAPI } from '../services/api';

export interface Vehicle {
    id: string;
    registrationNumber: string;
    make: string;
    model: string;
    insurance?: {
        hasInsurance: boolean;
        policyNumber?: string;
        insurer?: string;
    };
    claims?: Array<{
        claimDate: string;
        claimAmount: string;
        reason: string;
        status: string;
    }>;
}

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

// Get all claims from all vehicles
export const getAllClaims = (vehicles: Vehicle[]): Claim[] => {
    const allClaims: Claim[] = [];
    let globalIndex = 1;
    vehicles.forEach(vehicle => {
        if (vehicle.claims && vehicle.claims.length > 0) {
            vehicle.claims.forEach((claim, index) => {
                allClaims.push({
                    ...claim,
                    vehicleId: vehicle.id,
                    registrationNumber: vehicle.registrationNumber,
                    claimIndex: index,
                    globalIndex: globalIndex++
                });
            });
        }
    });
    return allClaims;
};

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

        // Check if vehicle has insurance
        if (!vehicle.insurance || !vehicle.insurance.hasInsurance) {
            return {
                success: false,
                message: 'This vehicle does not have insurance. Please add insurance before submitting a claim.'
            };
        }

        // Create new claim
        const newClaim = {
            claimDate: formData.claimDate,
            claimAmount: formData.claimAmount,
            reason: formData.reason,
            status: formData.status
        };

        // Ensure claims array exists
        const updatedClaims = vehicle.claims ? [...vehicle.claims, newClaim] : [newClaim];

        // Update vehicle with new claims array
        await vehicleAPI.patchVehicle(vehicleId, { claims: updatedClaims });

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

        // Update the specific claim status
        const updatedClaims = vehicle.claims ? [...vehicle.claims] : [];
        updatedClaims[claimIndex].status = newStatus;

        // Update vehicle with updated claims array
        await vehicleAPI.patchVehicle(vehicleId, { claims: updatedClaims });

        return {
            success: true,
            updatedClaims
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