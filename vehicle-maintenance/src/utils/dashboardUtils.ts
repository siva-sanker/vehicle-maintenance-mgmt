import { vehicleAPI, Vehicle } from '../services/api';

export interface DashboardProps {
    sidebarCollapsed: boolean;
    toggleSidebar: () => void;
}

export interface ClaimStatusData {
    pending: number;
    approved: number;
    rejected: number;
}

export interface FuelTypeData {
    [key: string]: number;
}

export interface MonthlyData {
    [key: string]: number;
}

export interface DashboardStats {
    totalVehicles: number;
    activeClaims: number;
    insurancePolicies: number;
    documentCount: number;
    totalClaimAmount: number;
    fuelTypeData: FuelTypeData;
    monthlyData: MonthlyData;
    claimStatusData: ClaimStatusData;
}

// Fetch all vehicles data
export const fetchVehiclesData = async (): Promise<Vehicle[]> => {
    try {
        const data = await vehicleAPI.getAllVehicles();
        return data;
    } catch (error) {
        console.error('Error fetching vehicles data:', error);
        throw error;
    }
};

// Calculate insurance policies count
export const calculateInsurancePolicies = (vehicles: Vehicle[]): number => {
    return vehicles.filter((v: Vehicle) => v.insurance && typeof v.insurance === 'object').length;
};

// Calculate claims data
export const calculateClaimsData = (vehicles: Vehicle[]): {
    claimsCount: number;
    totalClaims: number;
    claimStatusData: ClaimStatusData;
} => {
    let claimsCount = 0;
    let totalClaims = 0;
    let pendingClaims = 0;
    let approvedClaims = 0;
    let rejectedClaims = 0;

    vehicles.forEach((vehicle: Vehicle) => {
        if (vehicle.claims && Array.isArray(vehicle.claims)) {
            claimsCount += vehicle.claims.length;
            vehicle.claims.forEach((claim: any) => {
                totalClaims += parseFloat(claim.claimAmount) || 0;

                // Count claims by status
                switch (claim.status?.toLowerCase()) {
                    case 'pending':
                        pendingClaims++;
                        break;
                    case 'approved':
                        approvedClaims++;
                        break;
                    case 'rejected':
                        rejectedClaims++;
                        break;
                    default:
                        pendingClaims++;
                        break;
                }
            });
        }
    });

    return {
        claimsCount,
        totalClaims,
        claimStatusData: {
            pending: pendingClaims,
            approved: approvedClaims,
            rejected: rejectedClaims
        }
    };
};

// Calculate fuel type distribution
export const calculateFuelTypeData = (vehicles: Vehicle[]): FuelTypeData => {
    const fuelTypes: FuelTypeData = {};
    vehicles.forEach((vehicle: Vehicle) => {
        const fuelType = vehicle.fuelType || 'Unknown';
        fuelTypes[fuelType] = (fuelTypes[fuelType] || 0) + 1;
    });
    return fuelTypes;
};

// Calculate monthly purchase data
export const calculateMonthlyData = (vehicles: Vehicle[]): MonthlyData => {
    const monthlyPurchases: MonthlyData = {};

    vehicles.forEach((vehicle: Vehicle) => {
        if (vehicle.purchaseDate) {
            try {
                const date = new Date(vehicle.purchaseDate);
                if (!isNaN(date.getTime())) { // Check if date is valid
                    const month = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                    monthlyPurchases[month] = (monthlyPurchases[month] || 0) + 1;
                }
            } catch (error) {
                console.warn('Invalid purchase date for vehicle:', vehicle.id, vehicle.purchaseDate);
            }
        }
    });

    // Sort months chronologically
    const sortedMonthlyData: MonthlyData = {};
    Object.keys(monthlyPurchases)
        .sort((a, b) => {
            const dateA = new Date(a);
            const dateB = new Date(b);
            return dateA.getTime() - dateB.getTime();
        })
        .forEach(month => {
            sortedMonthlyData[month] = monthlyPurchases[month];
        });

    return sortedMonthlyData;
};

// Calculate insurance coverage percentage
export const calculateInsuranceCoverage = (insurancePolicies: number, totalVehicles: number): string => {
    if (totalVehicles === 0) return '0%';
    return ((insurancePolicies / totalVehicles) * 100).toFixed(1) + '%';
};

// Fetch all dashboard data
export const fetchDashboardData = async (): Promise<DashboardStats> => {
    try {
        const vehicles = await fetchVehiclesData();
        const totalVehicles = vehicles.length;
        const insurancePolicies = calculateInsurancePolicies(vehicles);
        const { claimsCount, totalClaims, claimStatusData } = calculateClaimsData(vehicles);
        const fuelTypeData = calculateFuelTypeData(vehicles);
        const monthlyData = calculateMonthlyData(vehicles);
        const documentCount = 10; // Mock data

        return {
            totalVehicles,
            activeClaims: claimsCount,
            insurancePolicies,
            documentCount,
            totalClaimAmount: totalClaims,
            fuelTypeData,
            monthlyData,
            claimStatusData
        };
    } catch (error) {
        console.error('Error fetching dashboard data:', error);
        throw error;
    }
};

// Chart configurations
export const getFuelTypeChartData = (fuelTypeData: FuelTypeData) => ({
    labels: Object.keys(fuelTypeData),
    datasets: [
        {
            data: Object.values(fuelTypeData),
            backgroundColor: [
                '#FF6384',
                '#36A2EB',
                '#FFCE56',
                '#4BC0C0',
                '#9966FF',
                '#FF9F40'
            ],
            borderWidth: 2,
            borderColor: '#fff'
        }
    ]
});

export const getMonthlyChartData = (monthlyData: MonthlyData) => ({
    labels: Object.keys(monthlyData),
    datasets: [
        {
            label: 'Vehicles Purchased',
            data: Object.values(monthlyData),
            borderColor: '#0d92ae',
            backgroundColor: 'rgba(13, 146, 174, 0.1)',
            tension: 0.4,
            fill: true,
            pointBackgroundColor: '#0d92ae',
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 6
        }
    ]
});

export const getClaimStatusChartData = (claimStatusData: ClaimStatusData) => ({
    labels: ['Pending', 'Approved', 'Rejected'],
    datasets: [
        {
            label: 'Claims by Status',
            data: [claimStatusData.pending, claimStatusData.approved, claimStatusData.rejected],
            backgroundColor: [
                '#FFA726', // Orange for pending
                '#66BB6A', // Green for approved
                '#EF5350'  // Red for rejected
            ],
            borderWidth: 1,
            borderColor: '#fff'
        }
    ]
});

// Chart options
export const getChartOptions = () => ({
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'bottom' as const,
            labels: {
                padding: 20,
                usePointStyle: true
            }
        }
    }
});

export const getLineChartOptions = () => ({
    ...getChartOptions(),
    scales: {
        y: {
            beginAtZero: true,
            ticks: {
                stepSize: 1
            }
        }
    }
});

// Get stats cards data
export const getStatsCardsData = (stats: DashboardStats) => [
    { title: 'Total Vehicles', subtitle: stats.totalVehicles },
    { title: 'Total Insurances', subtitle: stats.insurancePolicies },
    { title: 'Total Claims', subtitle: stats.activeClaims },
    { title: 'Total Claim Amount', subtitle: stats.totalClaimAmount.toLocaleString() },
    { title: 'Document Count', subtitle: stats.documentCount },
    { title: 'Insurance Coverage', subtitle: calculateInsuranceCoverage(stats.insurancePolicies, stats.totalVehicles) }
]; 