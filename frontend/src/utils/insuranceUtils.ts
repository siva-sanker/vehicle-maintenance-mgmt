import { vehicleAPI, Vehicle } from '../services/api';

export interface InsuranceData {
    policyNumber: string;
    insurer: string;
    expiryDate: string;
    policyType: string;
    startDate: string;
    endDate: string;
    premiumAmount: string;
    vehicleType: string;
    chassisNumber: string;
    engineNumber: string;
    policyIssueDate: string;
    paymentMode: string;
}

export interface InsuranceHistory {
    id: string;
    vehicleId: string;
    vehicleMake: string;
    vehicleModel: string;
    registrationNumber: string;
    policyNumber: string;
    insurer: string;
    policyType: string;
    startDate: string;
    endDate: string;
    premiumAmount: string;
    issueDate: string;
    payment: string;
    status: string;
    createdAt: string;
}

export const fetchVehicles = async (): Promise<Vehicle[]> => {
    try {
        const data = await vehicleAPI.getAllVehicles();
        return data;
    } catch (err) {
        console.error(err);
        throw err;
    }
};

export const filterVehicles = (vehicles: Vehicle[], searchTerm: string): Vehicle[] => {
    return vehicles.filter((v) =>
        v.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase())
    );
};

export const getTableData = (vehicles: Vehicle[]): any[] => {
    return vehicles.map((v, idx) => ({
        id: v.id || idx.toString(),
        number: idx + 1,
        make: v.make,
        model: v.model,
        registrationNumber: v.registrationNumber,
        policyNumber: v.insurance?.policyNumber || '-',
        insurer: v.insurance?.insurer || '-',
        policyType: v.insurance?.policytype || '-',
        startDate: v.insurance?.startDate || '-',
        endDate: v.insurance?.endDate || '-',
        premiumAmount: v.insurance?.premiumAmount ? `₹${v.insurance.premiumAmount}` : '-',
        chassisNumber: v.chassisNumber || '-',
        engineNumber: v.engineNumber || '-',
        issueDate: v.insurance?.issueDate || '-',
        payment: v.insurance?.payment || '-'
    }));
};

export const getDateStatusClass = (endDate: string): string => {
    if (!endDate || endDate === '-') return 'date-cell';
    const today = new Date();
    const end = new Date(endDate);
    today.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 0) {
        return 'date-cell date-expired';
    } else if (diffDays <= 5) {
        return 'date-cell date-expiring-soon';
    } else {
        return 'date-cell date-valid';
    }
};

// Check if insurance is expired
export const isInsuranceExpired = (endDate: string): boolean => {
    if (!endDate || endDate === '-') return false;
    const today = new Date();
    const end = new Date(endDate);
    today.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    return end.getTime() < today.getTime();
};

// Process expired insurance and move to history
export const processExpiredInsurance = async (): Promise<{
    updatedVehicles: Vehicle[];
    insuranceHistory: InsuranceHistory[];
}> => {
    try {
        const vehicles = await vehicleAPI.getAllVehicles();
        const insuranceHistory: InsuranceHistory[] = [];
        const updatedVehicles: Vehicle[] = [];

        for (const vehicle of vehicles) {
            if (vehicle.insurance) {
                const isExpired = isInsuranceExpired(vehicle.insurance.endDate || '');

                if (isExpired) {
                    // Move expired insurance to history
                    insuranceHistory.push({
                        id: `${vehicle.id}-expired-${Date.now()}`,
                        vehicleId: vehicle.id,
                        vehicleMake: vehicle.make,
                        vehicleModel: vehicle.model,
                        registrationNumber: vehicle.registrationNumber,
                        policyNumber: vehicle.insurance.policyNumber || '-',
                        insurer: vehicle.insurance.insurer || '-',
                        policyType: vehicle.insurance.policytype || '-',
                        startDate: vehicle.insurance.startDate || '-',
                        endDate: vehicle.insurance.endDate || '-',
                        premiumAmount: vehicle.insurance.premiumAmount ? `₹${vehicle.insurance.premiumAmount}` : '-',
                        issueDate: vehicle.insurance.issueDate || '-',
                        payment: vehicle.insurance.payment || '-',
                        status: vehicle.insurance.endDate || '-',
                        createdAt: vehicle.insurance.issueDate || new Date().toISOString()
                    });

                    // Remove insurance from vehicle (set to undefined)
                    const updatedVehicle = { ...vehicle, insurance: undefined };
                    updatedVehicles.push(updatedVehicle);

                    // Update vehicle in database using PATCH to preserve existing data
                    await vehicleAPI.patchVehicle(vehicle.id, { insurance: undefined });
                } else {
                    updatedVehicles.push(vehicle);
                }
            } else {
                updatedVehicles.push(vehicle);
            }
        }

        return { updatedVehicles, insuranceHistory };
    } catch (error) {
        console.error('Error processing expired insurance:', error);
        throw error;
    }
};

// Transform vehicles data to insurance history format
export const transformToInsuranceHistory = (vehicles: Vehicle[]): InsuranceHistory[] => {
    const history: InsuranceHistory[] = [];

    vehicles.forEach(vehicle => {
        if (vehicle.insurance) {
            const isExpired = isInsuranceExpired(vehicle.insurance.endDate || '');

            // Add current/expired insurance to history
            history.push({
                id: `${vehicle.id}-${isExpired ? 'expired' : 'current'}`,
                vehicleId: vehicle.id,
                vehicleMake: vehicle.make,
                vehicleModel: vehicle.model,
                registrationNumber: vehicle.registrationNumber,
                policyNumber: vehicle.insurance.policyNumber || '-',
                insurer: vehicle.insurance.insurer || '-',
                policyType: vehicle.insurance.policytype || '-',
                startDate: vehicle.insurance.startDate || '-',
                endDate: vehicle.insurance.endDate || '-',
                premiumAmount: vehicle.insurance.premiumAmount ? `₹${vehicle.insurance.premiumAmount}` : '-',
                issueDate: vehicle.insurance.issueDate || '-',
                payment: vehicle.insurance.payment || '-',
                status: vehicle.insurance.endDate || '-',
                createdAt: vehicle.insurance.issueDate || new Date().toISOString()
            });
        }

        // Mock historical data for demonstration
        // In a real application, this would come from a separate insurance history API
        const mockHistoryCount = Math.floor(Math.random() * 3) + 1; // 1-3 historical records

        for (let i = 1; i <= mockHistoryCount; i++) {
            const startDate = new Date();
            startDate.setFullYear(startDate.getFullYear() - i);
            const endDate = new Date(startDate);
            endDate.setFullYear(endDate.getFullYear() + 1);

            history.push({
                id: `${vehicle.id}-history-${i}`,
                vehicleId: vehicle.id,
                vehicleMake: vehicle.make,
                vehicleModel: vehicle.model,
                registrationNumber: vehicle.registrationNumber,
                policyNumber: `POL-${vehicle.registrationNumber.slice(-4)}-${new Date().getFullYear() - i}`,
                insurer: ['ICICI Lombard', 'Bajaj Allianz', 'HDFC ERGO', 'Tata AIG', 'Reliance General'][Math.floor(Math.random() * 5)],
                policyType: ['Comprehensive', 'Third Party', 'Third Party Fire & Theft'][Math.floor(Math.random() * 3)],
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
                premiumAmount: `₹${Math.floor(Math.random() * 50000) + 10000}`,
                issueDate: startDate.toISOString(),
                payment: ['Annual', 'Semi-Annual', 'Quarterly'][Math.floor(Math.random() * 3)],
                status: endDate.toISOString(),
                createdAt: startDate.toISOString()
            });
        }
    });

    // Sort by creation date (newest first)
    return history.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
}; 