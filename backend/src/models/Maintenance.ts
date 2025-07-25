export interface Maintenance {
    id: string;
    vehicleId: string;
    description: string;
    date: string;
    cost: number;
    [key: string]: any;
} 