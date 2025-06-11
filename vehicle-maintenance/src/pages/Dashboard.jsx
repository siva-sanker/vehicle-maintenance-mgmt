import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

const Dashboard = () => {
  const [vehicles, setVehicles] = useState([]);
  const [totalVehicles, setTotalVehicles] = useState(0);
  const [activeClaims, setActiveClaims] = useState(0);
  const [insurancePolicies, setInsurancePolicies] = useState(0);
  const [documentCount, setDocumentCount] = useState(0);
  const [totalClaimAmount, setTotalClaimAmount] = useState(0);
  const [fuelTypeData, setFuelTypeData] = useState({});
  const [monthlyData, setMonthlyData] = useState({});
  const [claimStatusData, setClaimStatusData] = useState({
    pending: 0,
    approved: 0,
    rejected: 0
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetch('http://localhost:4000/vehicles')
      .then((res) => res.json())
      .then((data) => {
        setVehicles(data);
        setTotalVehicles(data.length);

        // Calculate insurance policies
        const insuranceCount = data.filter(v => v.insurance && typeof v.insurance === 'object').length;
        setInsurancePolicies(insuranceCount);

        // Calculate active claims, total claim amount, and claim statuses
        let claimsCount = 0;
        let totalClaims = 0;
        let pendingClaims = 0;
        let approvedClaims = 0;
        let rejectedClaims = 0;

        data.forEach(vehicle => {
          if (vehicle.claims && Array.isArray(vehicle.claims)) {
            claimsCount += vehicle.claims.length;
            vehicle.claims.forEach(claim => {
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
                  pendingClaims++; // Default to pending if status is not specified
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
        const fuelTypes = {};
        data.forEach(vehicle => {
          const fuelType = vehicle.fuelType || 'Unknown';
          fuelTypes[fuelType] = (fuelTypes[fuelType] || 0) + 1;
        });
        setFuelTypeData(fuelTypes);

        // Calculate monthly purchase data
        const monthlyPurchases = {};
        data.forEach(vehicle => {
          if (vehicle.purchaseDate) {
            const month = new Date(vehicle.purchaseDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
            monthlyPurchases[month] = (monthlyPurchases[month] || 0) + 1;
          }
        });
        setMonthlyData(monthlyPurchases);

        setDocumentCount(230); // Mock data
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
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
        position: 'bottom',
        labels: {
          usePointStyle: true,
          padding: 20,
          font: {
            size: 12
          }
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
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <div className="header-content">
          <h1 className="dashboard-title">
            <Car className="dashboard-icon" />
            Vehicle Maintenance Management Dashboard
          </h1>
          <p className="dashboard-subtitle">Monitor your fleet performance and analytics</p>
        </div>
        <div className="header-actions">
          <button className="btn-primary" onClick={() => navigate('/register-vehicle')}>
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
            <h3 className="stat-number">{totalVehicles}</h3>
            <p className="stat-label">Total Vehicles</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon claims">
            <AlertTriangle size={24} />
          </div>
          <div className="stat-content">
            <h3 className="stat-number">{activeClaims}</h3>
            <p className="stat-label">Active Claims</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon insurance">
            <Shield size={24} />
          </div>
          <div className="stat-content">
            <h3 className="stat-number">{insurancePolicies}</h3>
            <p className="stat-label">Insurance Policies</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon documents">
            <FileText size={24} />
          </div>
          <div className="stat-content">
            <h3 className="stat-number">{documentCount}</h3>
            <p className="stat-label">Documents</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon amount">
            <DollarSign size={24} />
          </div>
          <div className="stat-content">
            <h3 className="stat-number">₹{totalClaimAmount.toLocaleString()}</h3>
            <p className="stat-label">Total Claim Amount</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon trend">
            <TrendingUp size={24} />
          </div>
          <div className="stat-content">
            <h3 className="stat-number">{((insurancePolicies / totalVehicles) * 100).toFixed(1)}%</h3>
            <p className="stat-label">Insurance Coverage</p>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="charts-grid">
        <div className="chart-card">
          <h3 className="chart-title">Monthly Vehicle Purchases</h3>
          <div className="chart-container">
            <Line data={monthlyChartData} options={lineChartOptions} />
          </div>
        </div>

        <div className="chart-card">
          <h3 className="chart-title">Fuel Type Distribution</h3>
          <div className="chart-container">
            <Doughnut data={fuelTypeChartData} options={chartOptions} />
          </div>
        </div>

        <div className="chart-card">
          <h3 className="chart-title">Claims by Status</h3>
          <div className="chart-container">
            <Bar data={claimStatusChartData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <h3 className="section-title">Quick Actions</h3>
        <div className="actions-grid">
          <button className="action-card" onClick={() => navigate('/register-vehicle')}>
            <Car size={32} />
            <h4>Register Vehicle</h4>
            <p>Add a new vehicle to your fleet</p>
          </button>

          <button className="action-card" onClick={() => navigate('/vehicle-list')}>
            <Users size={32} />
            <h4>View All Vehicles</h4>
            <p>Manage your vehicle inventory</p>
          </button>

          <button className="action-card">
            <Calendar size={32} />
            <h4>Schedule Maintenance</h4>
            <p>Plan upcoming maintenance</p>
          </button>

          <button className="action-card">
            <FileText size={32} />
            <h4>Generate Reports</h4>
            <p>Create detailed analytics reports</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
