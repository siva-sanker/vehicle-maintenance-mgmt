import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Footer from '../components/Footer';
import Header from '../components/Header';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Car,
  FileText,
  Shield,
  AlertTriangle,
  TrendingUp,
  DollarSign,
  Calendar,
  Users
} from 'lucide-react';
import { vehicleAPI, Vehicle } from '../services/api';
import '../styles/Dashboard.css';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

// Define interfaces for the data types
interface DashboardProps {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

interface ClaimStatusData {
  pending: number;
  approved: number;
  rejected: number;
}

interface FuelTypeData {
  [key: string]: number;
}

interface MonthlyData {
  [key: string]: number;
}

const Dashboard: React.FC<DashboardProps> = ({ sidebarCollapsed, toggleSidebar }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [totalVehicles, setTotalVehicles] = useState<number>(0);
  const [activeClaims, setActiveClaims] = useState<number>(0);
  const [insurancePolicies, setInsurancePolicies] = useState<number>(0);
  const [documentCount, setDocumentCount] = useState<number>(0);
  const [totalClaimAmount, setTotalClaimAmount] = useState<number>(0);
  const [fuelTypeData, setFuelTypeData] = useState<FuelTypeData>({});
  const [monthlyData, setMonthlyData] = useState<MonthlyData>({});
  const [claimStatusData, setClaimStatusData] = useState<ClaimStatusData>({
    pending: 0,
    approved: 0,
    rejected: 0
  });
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDashboardData = async (): Promise<void> => {
      try {
        const data = await vehicleAPI.getAllVehicles();
        setVehicles(data);
        setTotalVehicles(data.length);

        // Calculate insurance policies
        const insuranceCount = data.filter((v: Vehicle) => v.insurance && typeof v.insurance === 'object').length;
        setInsurancePolicies(insuranceCount);

        // Calculate active claims, total claim amount, and claim statuses
        let claimsCount = 0;
        let totalClaims = 0;
        let pendingClaims = 0;
        let approvedClaims = 0;
        let rejectedClaims = 0;

        data.forEach((vehicle: Vehicle) => {
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

        setActiveClaims(claimsCount);
        setTotalClaimAmount(totalClaims);
        setClaimStatusData({
          pending: pendingClaims,
          approved: approvedClaims,
          rejected: rejectedClaims
        });

        // Calculate fuel type distribution
        const fuelTypes: FuelTypeData = {};
        data.forEach((vehicle: Vehicle) => {
          const fuelType = vehicle.fuelType || 'Unknown';
          fuelTypes[fuelType] = (fuelTypes[fuelType] || 0) + 1;
        });
        setFuelTypeData(fuelTypes);

        // Calculate monthly purchase data
        const monthlyPurchases: MonthlyData = {};
        data.forEach((vehicle: Vehicle) => {
          if (vehicle.purchaseDate) {
            const month = new Date(vehicle.purchaseDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
            monthlyPurchases[month] = (monthlyPurchases[month] || 0) + 1;
          }
        });
        setMonthlyData(monthlyPurchases);

        setDocumentCount(230); // Mock data
        setLoading(false);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Chart configurations
  const fuelTypeChartData = {
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
  };

  const monthlyChartData = {
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
  };

  // Dynamic claim status chart data based on actual claim statuses
  const claimStatusChartData = {
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
  };

  const chartOptions = {
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
  };

  const lineChartOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          stepSize: 1
        }
      }
    }
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <Header sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading dashboard data...</p>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <>
      <Header sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
    <div className="dashboard-container">
      
      <div className="dashboard-content">
        <div className="dashboard-header">
          <div className="header-content">
            <h1 className="dashboard-title">
              Dashboard
            </h1>
            <p className="dashboard-subtitle">Vehicle Maintenance Management System Overview</p>
          </div>
          <div className="header-actions">
            <button onClick={() => navigate('/register-vehicle')} className="btn-primary">
              <Car size={16} />
              Add Vehicle
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon vehicles">
              <Car size={24} />
            </div>
            <div className="stat-content">
              <h3 className='stat-number'>{totalVehicles}</h3>
              <p>Total Vehicles</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon insurance">
              <Shield size={24} />
            </div>
            <div className="stat-content">
              <h3 className='stat-number'>{insurancePolicies}</h3>
              <p>Insurance Policies</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon claims">
              <FileText size={24} />
            </div>
            <div className="stat-content">
              <h3 className='stat-number'>{activeClaims}</h3>
              <p>Active Claims</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon amount">
              <DollarSign size={24} />
            </div>
            <div className="stat-content">
              <h3 className='stat-number'>₹{totalClaimAmount.toLocaleString()}</h3>
              <p>Total Claim Amount</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon documents">
              <AlertTriangle size={24} />
            </div>
            <div className="stat-content">
              <h3 className='stat-number'>{documentCount}</h3>
              <p>Documents</p>
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-icon amount">
              <TrendingUp size={24} />
            </div>
            <div className="stat-content">
            <h3 className='stat-number'>{((insurancePolicies / totalVehicles) * 100).toFixed(1)}%</h3>
              <p>Insurance Coverage</p>
            </div>
          </div>
        </div>

        {/* Charts Section */}
        <div className="charts-grid">
          <div className="chart-card">
            <h3>Fuel Type Distribution</h3>
            <div className="chart-container">
              <Doughnut data={fuelTypeChartData} options={chartOptions} />
            </div>
          </div>

          <div className="chart-card">
            <h3>Monthly Vehicle Purchases</h3>
            <div className="chart-container">
              <Line data={monthlyChartData} options={lineChartOptions} />
            </div>
          </div>

          <div className="chart-card">
            <h3>Claim Status Distribution</h3>
            <div className="chart-container">
              <Bar data={claimStatusChartData} options={chartOptions} />
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="quick-actions">
          <h3>Quick Actions</h3>
          <div className="action-buttons">
            <button onClick={() => navigate('/register-vehicle')} className="action-btn">
              <Car size={20} />
              Register Vehicle
            </button>
            <button onClick={() => navigate('/vehicle-list')} className="action-btn">
              <FileText size={20} />
              View Vehicles
            </button>
            <button onClick={() => navigate('/claims')} className="action-btn">
              <AlertTriangle size={20} />
              Manage Claims
            </button>
            <button onClick={() => navigate('/insurance')} className="action-btn">
              <Shield size={20} />
              Insurance
            </button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
    </>
  );
};

export default Dashboard; 