import { vehicleAPI, driverAPI, maintenanceAPI, insuranceAPI, Vehicle, Driver, Maintenance } from '../services/api';
import { getAllClaims, Claim } from '../utils/claimsUtils';

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
    totalDrivers: number;
    totalMaintenanceCost: number;
    upcomingMaintenance: number;
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

// Fetch all drivers data
export const fetchDriversData = async (): Promise<Driver[]> => {
    try {
        const data = await driverAPI.getAllDrivers();
        return data;
    } catch (error) {
        console.error('Error fetching drivers data:', error);
        throw error;
    }
};

// Fetch all maintenance data
export const fetchMaintenanceData = async (): Promise<Maintenance[]> => {
    try {
        const data = await maintenanceAPI.getAllMaintenance();
        return data;
    } catch (error) {
        console.error('Error fetching maintenance data:', error);
        throw error;
    }
};

// Calculate insurance policies count from vehicles
export const calculateInsurancePolicies = async (vehicles: Vehicle[]): Promise<number> => {
    try {
        const data = await insuranceAPI.getAllInsurance();
        return data.length;
    } catch (error) {
        console.error('Error fetching vehicles data:', error);
        throw error;
    }
};

// Calculate claims data (placeholder - claims are in separate table)
export const calculateClaimsData = async (): Promise<{
  claimsCount: number;
  totalClaims: number;
  claimStatusData: ClaimStatusData;
}> => {
  try {
    const allClaims: Claim[] = await getAllClaims();

    const claimsCount = allClaims.length;
    const totalClaims = allClaims.reduce((sum, claim) => sum + Number(claim.claim_amount), 0);

    const claimStatusData: ClaimStatusData = {
      pending: 0,
      approved: 0,
      rejected: 0
    };

    allClaims.forEach(claim => {
      const status = claim.status?.toLowerCase();
      if (status === 'pending') claimStatusData.pending++;
      else if (status === 'approved') claimStatusData.approved++;
      else if (status === 'rejected') claimStatusData.rejected++;
    });

    return {
      claimsCount,
      totalClaims,
      claimStatusData
    };
  } catch (error) {
    console.error('Error calculating claims data:', error);

    // fallback in case of error
    return {
      claimsCount: 0,
      totalClaims: 0,
      claimStatusData: {
        pending: 0,
        approved: 0,
        rejected: 0
      }
    };
  }
};

// Calculate maintenance data
export const calculateMaintenanceData = (maintenance: Maintenance[]): {
    totalMaintenanceCost: number;
    upcomingMaintenance: number;
} => {
    let totalCost = 0;
    let upcomingCount = 0;

    maintenance.forEach((record: Maintenance) => {
        totalCost += record.cost || 0;

        // Count upcoming maintenance (scheduled status)
        if (record.status?.toLowerCase() === 'scheduled') {
            upcomingCount++;
        }
    });

    return {
        totalMaintenanceCost: totalCost,
        upcomingMaintenance: upcomingCount
    };
};

// Calculate fuel type distribution
export const calculateFuelTypeData = (vehicles: Vehicle[]): FuelTypeData => {
    const fuelTypes: FuelTypeData = {};
    vehicles.forEach((vehicle: Vehicle) => {
        const fuelType = vehicle.fuel_type || 'Unknown';
        fuelTypes[fuelType] = (fuelTypes[fuelType] || 0) + 1;
    });
    return fuelTypes;
};

// Calculate monthly purchase data
export const calculateMonthlyData = (vehicles: Vehicle[]): MonthlyData => {
    const monthlyPurchases: MonthlyData = {};

    vehicles.forEach((vehicle: Vehicle) => {
        if (vehicle.purchase_date) {
            try {
                const date = new Date(vehicle.purchase_date);
                if (!isNaN(date.getTime())) { // Check if date is valid
                    const month = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                    monthlyPurchases[month] = (monthlyPurchases[month] || 0) + 1;
                }
            } catch (error) {
                console.warn('Invalid purchase date for vehicle:', vehicle.id, vehicle.purchase_date);
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
        // Fetch data from all endpoints
        const [vehicles, drivers, maintenance] = await Promise.all([
            fetchVehiclesData(),
            fetchDriversData(),
            fetchMaintenanceData()
        ]);

        const totalVehicles = vehicles.length;
        const totalDrivers = drivers.length;
        const insurancePolicies = await calculateInsurancePolicies(vehicles);
        const { claimsCount, totalClaims, claimStatusData } = await calculateClaimsData();
        const { totalMaintenanceCost, upcomingMaintenance } = calculateMaintenanceData(maintenance);
        const fuelTypeData = calculateFuelTypeData(vehicles);
        const monthlyData = calculateMonthlyData(vehicles);
        const documentCount = 10; // Mock data for now

        return {
            totalVehicles,
            totalDrivers,
            activeClaims: claimsCount,
            insurancePolicies,
            documentCount,
            totalClaimAmount: totalClaims,
            totalMaintenanceCost,
            upcomingMaintenance,
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
    { title: 'Total Drivers', subtitle: stats.totalDrivers },
    { title: 'Total Insurances', subtitle: stats.insurancePolicies },
    { title: 'Total Claims', subtitle: stats.activeClaims },
    { title: 'Total Claim Amount', subtitle: `${stats.totalClaimAmount.toLocaleString()} /-` },
    { title: 'Total Maintenance Cost', subtitle: `${stats.totalMaintenanceCost.toLocaleString()} /-` },
    // { title: 'Upcoming Maintenance', subtitle: stats.upcomingMaintenance },
    { title: 'Document Count', subtitle: stats.documentCount },
    { title: 'Insurance Coverage', subtitle: calculateInsuranceCoverage(stats.insurancePolicies, stats.totalVehicles) }
]; 