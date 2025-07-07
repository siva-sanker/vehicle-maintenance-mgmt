import React, { useEffect, useState } from 'react';
import { fetchVehicles, filterVehicles, getTableData, getDateStatusClass, InsuranceData, processExpiredInsurance } from '../utils/insuranceUtils';
import { Vehicle } from '../services/api';
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

const InsuranceManagement: React.FC<InsuranceManagementProps> = ({ sidebarCollapsed, toggleSidebar }) => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const filteredVehicles = filterVehicles(vehicles, searchTerm);
  const tableData = getTableData(filteredVehicles);

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
    const fetchData = async (): Promise<void> => {
      try {
        // Process expired insurance first
        const { updatedVehicles } = await processExpiredInsurance();
        setVehicles(updatedVehicles);
      } catch (err) {
        console.error(err);
        // Fallback to original fetch if processing fails
        try {
          const data = await fetchVehicles();
          setVehicles(data);
        } catch (fallbackErr) {
          console.error('Fallback fetch also failed:', fallbackErr);
        }
      }
    };
    fetchData();
  }, []);

  return (
    <>
      <Header sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} showDate showTime showCalculator />
      {/* <div className="insurance-container"> */}
      <PageContainer>
      <div className="dashboard-content">
        <SectionHeading title='Insurance Management' subtitle='Manage vehicle insurance policies and details'/>
            <div className="header-actions2 d-flex justify-content-end">
              <div className="search-wrapper">
                <Searchbar
                placeholder='Search registration number'
                  type='search'
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
      </div>
      {/* </div> */}
      </PageContainer>
      <Footer />
    </>
  );
};

export default InsuranceManagement; 