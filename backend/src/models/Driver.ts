export interface Driver {
    id: string;
    name: string;
    phone: string;
    address?: string;
    licenseNumber?: string;
    status?: string;
    assignedVehicleIds?: string | string[];
    [key: string]: any;
}
