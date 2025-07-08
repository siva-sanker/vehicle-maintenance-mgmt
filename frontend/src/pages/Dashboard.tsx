import React, { useEffect, useState } from 'react';
import {  useLocation } from 'react-router-dom';
import Footer from '../components/Footer';
import Header from '../components/Header';
import Cards from '../components/Cards';
// import ButtonWithGradient from '../components/ButtonWithGradient';
import PageContainer from '../components/PageContainer';
import SectionHeading from '../components/SectionHeading';
import QuickActions from '../components/QuickActionCard';
import '../styles/Dashboard.css';
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
  // TrendingUp,
  // DollarSign,
  // RefreshCw,
} from 'lucide-react';
import {
  DashboardProps,
  // ClaimStatusData,
  // FuelTypeData,
  // MonthlyData,
  DashboardStats,
  fetchDashboardData,
  getFuelTypeChartData,
  getMonthlyChartData,
  getClaimStatusChartData,
  getChartOptions,
  getLineChartOptions,
  getStatsCardsData
} from '../utils/dashboardUtils';

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

          const actions = [
            { label: 'Register Vehicle', path: '/register-vehicle', icon: Car },
            { label: 'View Vehicles', path: '/vehicle-list', icon: FileText },
            { label: 'Manage Claims', path: '/claims', icon: AlertTriangle },
            { label: 'Insurance', path: '/insurance', icon: Shield },

          ];
const Dashboard: React.FC<DashboardProps> = ({ sidebarCollapsed=false, toggleSidebar }) => {
  const [dashboardStats, setDashboardStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  // const navigate = useNavigate();
  const location = useLocation();

  const loadDashboardData = async (): Promise<void> => {
    try {
      setLoading(true);
      const stats = await fetchDashboardData();
      setDashboardStats(stats);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, [location]);

  // Early return if no data
  if (!dashboardStats) {
    return null;
  }

  // Chart configurations
  const fuelTypeChartData = getFuelTypeChartData(dashboardStats.fuelTypeData);
  const monthlyChartData = getMonthlyChartData(dashboardStats.monthlyData);
  const claimStatusChartData = getClaimStatusChartData(dashboardStats.claimStatusData);
  const chartOptions = getChartOptions();
  const lineChartOptions = getLineChartOptions();

  if (loading) {
    return (
      <>
      {/* <div className="dashboard-container"> */}
      <Header sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} showDate showTime showCalculator />
      <PageContainer>
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading dashboard data...</p>
        </div>

      </PageContainer>
        <Footer />
      {/* </div> */}
      </>
    );
  }

  return (
    <>
      <Header sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} showDate showTime showCalculator/>

      <PageContainer>
    {/* <div className="dashboard-container"> */}
      <div className="dashboard-content">
        <SectionHeading title='Dashboard' subtitle='Vehicle Maintenance Management System Overview'/>
        {/* <Cards/> */}
        <div className="stats-grid">
          {getStatsCardsData(dashboardStats).map((card, index) => (
            <Cards key={index} title={card.title} subtitle={card.subtitle} />
          ))}
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

        <QuickActions actions={actions}/>

      </div>
    {/* </div> */}
    </PageContainer>
      <Footer />
  </>
  );
};

export default Dashboard; 