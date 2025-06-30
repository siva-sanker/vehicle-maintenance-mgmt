import React, { useEffect, useState } from 'react';
// import {  Car, Calendar, DollarSign, Shield, CreditCard,} from 'lucide-react';
// import { FileText } from 'lucide-react';
import { vehicleAPI } from '../services/api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import Searchbar from '../components/Searchbar';
import SectionHeading from '../components/SectionHeading';
import PageContainer from '../components/PageContainer';
import Table from '../components/Table';
import '../styles/insurance.css';

interface InsuranceManagementProps {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

interface Vehicle {
  id: string;
  make: string;
  model: string;
  registrationNumber: string;
  chassisNumber?: string;
  engineNumber?: string;
  insurance?: {
    policyNumber?: string;
    insurer?: string;
    policytype?: string;
    startDate?: string;
    endDate?: string;
    premiumAmount?: string;
    issueDate?: string;
    payment?: string;
  };
}

interface InsuranceData {
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

const InsuranceManagement: React.FC<InsuranceManagementProps> = ({ sidebarCollapsed, toggleSidebar }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [insuranceData, setInsuranceData] = useState<InsuranceData>({
    policyNumber: '',
    insurer: '',
    expiryDate: '',
    policyType: '',
    startDate: '',
    endDate: '',
    premiumAmount: '',
    vehicleType: '',
    chassisNumber: '',
    engineNumber: '',
    policyIssueDate: '',
    paymentMode: ''
  });

  const filteredVehicles = vehicles.filter((v) =>
    v.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Transform vehicles data for the Table component
  const tableData = filteredVehicles.map((v, idx) => ({
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

  // Define table columns
  const columns = [
    { key: 'number', header: '#' },
    { key: 'make', header: 'Make' },
    { key: 'model', header: 'Model' },
    { key: 'registrationNumber', header: 'Reg. Number' },
    { key: 'policyNumber', header: 'Policy #' },
    { key: 'insurer', header: 'Insurer' },
    { key: 'policyType', header: 'Type' },
    { key: 'startDate', header: 'Start' },
    { 
      key: 'endDate', 
      header: 'End',
      renderCell: (value: string) => (
        <span className={getDateStatusClass(value)}>{value}</span>
      )
    },
    { key: 'premiumAmount', header: 'Premium' },
    { key: 'chassisNumber', header: 'Chassis' },
    { key: 'engineNumber', header: 'Engine' },
    { key: 'issueDate', header: 'Issue Date' },
    { key: 'payment', header: 'Payment' }
  ];

  useEffect(() => {
    const fetchVehicles = async (): Promise<void> => {
      try {
        const data = await vehicleAPI.getAllVehicles();
        setVehicles(data);
      } catch (err) {
        console.error(err);
      }
    };
    fetchVehicles();
  }, []);

  // Function to determine date status and return appropriate CSS class
  const getDateStatusClass = (endDate: string): string => {
    if (!endDate || endDate === '-') return 'date-cell';
    
    const today = new Date();
    const end = new Date(endDate);
    
    // Reset time to compare only dates
    today.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return 'date-cell date-expired'; // Past due - red
    } else if (diffDays <= 5) {
      return 'date-cell date-expiring-soon'; // Expiring within 5 days - orange
    } else {
      return 'date-cell date-valid'; // Valid - green
    }
  };

  return (
    <>
      {/* <Header sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} /> */}
      <Header sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} showDate showTime showCalculator />
      {/* <div className="insurance-container"> */}
      <PageContainer>
        <SectionHeading title='Insurance Management' subtitle='Manage vehicle insurance policies and details'/>
        {/* <div className="insurance-header">
          <div className="header-content">
            <h1 className="page-title">
              <FileText className="page-icon" />
              Insurance Management
            </h1>
            <p className="page-subtitle">Manage vehicle insurance policies and details</p>
          </div>
          </div> */}
        {/* <div className="insurance-content border border-black"> */}
          {/* <div className="content-header">
            <div className="section-header">
            <Shield size={20} className="section-icon" />
            <h3>Vehicle Insurance Details</h3>
            </div>
            </div> */}

            <div className="header-actions2 d-flex justify-content-end">
              <div className="search border border-grey d-flex justify-content-center align-items-center">
                <Searchbar
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          <div className="table-container">
            <Table columns={columns} data={tableData} />
          </div>

          {/* Date Status Legend */}
          <div className="date-legend">
            <span className="legend-title">End Date Status:</span>
            <div className="legend-items">
              <div className="legend-item">
                <span className="legend-color date-valid">Valid</span>
                {/* <span className="legend-text">More than 5 days remaining</span> */}
              </div>
              <div className="legend-item">
                <span className="legend-color date-expiring-soon">Expiring Soon</span>
                {/* <span className="legend-text">Within 5 days</span> */}
              </div>
              <div className="legend-item">
                <span className="legend-color date-expired">Expired</span>
                {/* <span className="legend-text">Past due date</span> */}
              </div>
            </div>
          </div>
        {/* </div> */}
      {/* </div> */}
      </PageContainer>
      <Footer />
    </>
  );
};

export default InsuranceManagement; 