import { Vehicle, Insurance, vehicleAPI, insuranceAPI } from '../services/api';

export interface InsuranceHistory {             //in insurance list page
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
    return vehicles.filter(vehicle =>
        vehicle.registration_number && vehicle.registration_number.toLowerCase().includes(searchTerm.toLowerCase())
    );
};

export const getTableData = (vehicles: Vehicle[]): any[] => {
    return vehicles.map((vehicle, index) => ({
        number: index + 1,
        make: vehicle.make,
        model: vehicle.model,
        registrationNumber: vehicle.registration_number,
        policyNumber: 'Insurance data available separately',
        insurer: 'Insurance data available separately',
        policyType: 'Insurance data available separately',
        startDate: 'Insurance data available separately',
        endDate: 'Insurance data available separately',
        premiumAmount: 'Insurance data available separately',
        chassisNumber: vehicle.chassis_number,
        engineNumber: vehicle.engine_number,
        issueDate: 'Insurance data available separately',
        payment: 'Insurance data available separately'
    }));
};

export const getDateStatusClass = (endDate: string): string => {
    const today = new Date();
    const end = new Date(endDate);
    const daysUntilExpiry = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) return 'expired';
    if (daysUntilExpiry <= 30) return 'expiring-soon';
    return 'active';
};

export const isInsuranceExpired = (endDate: string): boolean => {
    if (!endDate) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const end = new Date(endDate);
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
        const insuranceData = await insuranceAPI.getAllInsurance();
        const insuranceHistory: InsuranceHistory[] = [];
        const updatedVehicles: Vehicle[] = [];

        for (const vehicle of vehicles) {
            // Find insurance for this vehicle
            const vehicleInsurance = insuranceData.find(ins => ins.vehicle_id === vehicle.id);

            if (vehicleInsurance) {
                const isExpired = isInsuranceExpired(vehicleInsurance.end_date);

                if (isExpired) {
                    // Move expired insurance to history
                    insuranceHistory.push({
                        id: `${vehicle.id}-expired-${Date.now()}`,
                        vehicleId: vehicle.id,
                        vehicleMake: vehicle.make,
                        vehicleModel: vehicle.model,
                        registrationNumber: vehicle.registration_number,
                        policyNumber: vehicleInsurance.policy_number || '-',
                        insurer: vehicleInsurance.insurer || '-',
                        policyType: vehicleInsurance.policy_type || '-',
                        startDate: vehicleInsurance.start_date || '-',
                        endDate: vehicleInsurance.end_date || '-',
                        premiumAmount: vehicleInsurance.premium_amount ? `₹${vehicleInsurance.premium_amount}` : '-',
                        issueDate: vehicleInsurance.issue_date || '-',
                        payment: vehicleInsurance.payment?.toString() || '-',
                        status: vehicleInsurance.end_date || '-',
                        createdAt: vehicleInsurance.issue_date || new Date().toISOString()
                    });

                    // Delete expired insurance from database
                    await insuranceAPI.deleteInsurance(vehicleInsurance.id);
                }
            }

            updatedVehicles.push(vehicle);
        }

        return { updatedVehicles, insuranceHistory };
    } catch (error) {
        console.error('Error processing expired insurance:', error);
        throw error;
    }
};

// Transform insurance data to insurance history format
export const transformToInsuranceHistory = async (): Promise<InsuranceHistory[]> => {
    try {
        const insuranceData = await insuranceAPI.getAllInsurance();
        const vehicles = await vehicleAPI.getAllVehicles();
        const history: InsuranceHistory[] = [];

        for (const insurance of insuranceData) {
            const vehicle = vehicles.find(v => v.id === insurance.vehicle_id);
            if (vehicle) {
                const isExpired = isInsuranceExpired(insurance.end_date);

                history.push({
                    id: `${insurance.id}-${isExpired ? 'expired' : 'current'}`,
                    vehicleId: insurance.vehicle_id,
                    vehicleMake: vehicle.make,
                    vehicleModel: vehicle.model,
                    registrationNumber: vehicle.registration_number,
                    policyNumber: insurance.policy_number || '-',
                    insurer: insurance.insurer || '-',
                    policyType: insurance.policy_type || '-',
                    startDate: insurance.start_date || '-',
                    endDate: insurance.end_date || '-',
                    premiumAmount: insurance.premium_amount ? `₹${insurance.premium_amount}` : '-',
                    issueDate: insurance.issue_date || '-',
                    payment: insurance.payment?.toString() || '-',
                    status: insurance.end_date || '-',
                    createdAt: insurance.issue_date || new Date().toISOString()
                });
            }
        }

        return history;
    } catch (error) {
        console.error('Error transforming insurance data:', error);
        return [];
    }
}; 