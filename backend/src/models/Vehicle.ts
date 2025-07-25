export interface Vehicle {
    id: string;
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
    status: string;
    claims?: Claim[];
    currentLocation?: Location;
    lastUpdated?: string;
    deletedAt?: string | null;
    insurance?: Insurance;
}

export interface Claim {
    claimDate: string;
    claimAmount: string;
    reason: string;
    status: string;
}

export interface Location {
    latitude: number;
    longitude: number;
    timestamp: string;
    address: string;
}

export interface Insurance {
    policyNumber: string;
    insurer: string;
    policytype: string;
    startDate: string;
    endDate: string;
    payment: string;
    issueDate: string;
    premiumAmount: string;
    hasInsurance?: boolean;
} 