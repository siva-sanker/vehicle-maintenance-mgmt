import React, { useEffect, useState } from 'react';
import { vehicleAPI, Vehicle } from '../services/api';
import { 
  // isInsuranceExpired, 
  processExpiredInsurance, 
  transformToInsuranceHistory,
  InsuranceHistory 
} from '../utils/insuranceUtils';
import Searchbar from '../components/Searchbar';
import SectionHeading from '../components/SectionHeading';
import PageContainer from '../components/PageContainer';
import Table from '../components/Table';
import SelectInput from '../components/SelectInput';
import RestoreButton from '../components/RestoreButton';
import Cards from '../components/Cards';
import '../styles/Insurance.css';


const InsuranceList: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [insuranceHistory, setInsuranceHistory] = useState<InsuranceHistory[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedVehicle, setSelectedVehicle] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  // Filter insurance history based on selected vehicle and search term
  const filteredInsuranceHistory = insuranceHistory.filter(insurance => {
    // Only show data if a vehicle is selected
    const vehicleFilter = selectedVehicle !== '' && insurance.vehicleId === selectedVehicle;
    
    // Then filter by search term
    const searchFilter = searchTerm === '' || 
      insurance.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      insurance.policyNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      insurance.insurer.toLowerCase().includes(searchTerm.toLowerCase());
    
    return vehicleFilter && searchFilter;
  });

  function capitalizeFirstLetter(str:any) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

  // Get date status class for styling
  const getDateStatusClass = (endDate: string): string => {
    if (!endDate || endDate === '-') return 'date-cell';
    const today = new Date();
    const end = new Date(endDate);
    today.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return 'date-cell date-expired';
    } else if (diffDays <= 30) {
      return 'date-cell date-expiring-soon';
    } else {
      return 'date-cell date-valid';
    }
  };

  // Get status text and class
  const getStatusInfo = (endDate: string): { text: string; class: string } => {
    if (!endDate || endDate === '-') return { text: 'Unknown', class: 'status-unknown' };
    
    const today = new Date();
    const end = new Date(endDate);
    today.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
    const diffTime = end.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return { text: 'Expired', class: 'status-expired' };
    } else if (diffDays <= 30) {
      return { text: 'Expiring Soon', class: 'status-expiring' };
    } else {
      return { text: 'Active', class: 'status-active' };
    }
  };

  // Format date for display
  const formatDate = (dateString: string): string => {
    if (!dateString || dateString === '-') return '-';
    return new Date(dateString).toLocaleDateString('en-IN');
  };

  // Define table columns
  const columns = [
    { key: 'number', header: '#' },
    { key: 'registrationNumber', header: 'Vehicle Reg. No.' },
    { key: 'vehicleMake', header: 'Make' },
    { key: 'vehicleModel', header: 'Model' },
    { key: 'policyNumber', header: 'Policy Number' },
    { key: 'insurer', header: 'Insurance Company' },
    { key: 'policyType', header: 'Policy Type' },
    { key: 'startDate', header: 'Start Date',renderCell: (value: string) => formatDate(value) },
    { 
      key: 'endDate', 
      header: 'End Date',
      renderCell: (value: string) => (
        <span className={getDateStatusClass(value)}>{formatDate(value)}</span>
      )
    },
    { key: 'premiumAmount', header: 'Premium Amount' },
    { key: 'issueDate', header: 'Issue Date',renderCell: (value: string) => formatDate(value) },
    { key: 'payment', header: 'Payment Mode' },
    { 
      key: 'status', 
      header: 'Status',
      renderCell: (value: string) => {
        const statusInfo = getStatusInfo(value);
        return <span className={`status-badge ${statusInfo.class}`}>{statusInfo.text}</span>;
      }
    }
  ];



  // Create vehicle options for dropdown
  const vehicleOptions = [
    { label: 'Select a vehicle to view insurance history', value: '',disabled:true },
    ...vehicles.map(vehicle => ({
      label: `${vehicle.registration_number.toUpperCase()} - ${capitalizeFirstLetter(vehicle.make)} ${capitalizeFirstLetter(vehicle.model)}`,
      value: vehicle.id
    }))
  ];

  // Add numbering to the data
  const tableData = filteredInsuranceHistory.map((insurance, index) => ({
    ...insurance,
    number: index + 1
  }));

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        setLoading(true);
        
        // Process expired insurance first
        const { updatedVehicles, insuranceHistory: expiredHistory } = await processExpiredInsurance();
        setVehicles(updatedVehicles);
        
        // Transform to insurance history format
        const historyData = await transformToInsuranceHistory();
        
        // Combine current history with expired insurance history
        const combinedHistory = [...expiredHistory, ...historyData];
        setInsuranceHistory(combinedHistory);
        
      } catch (error) {
        console.error('Error fetching insurance data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <>
        {/* <Header sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} showDate showTime showCalculator /> */}
        <PageContainer>
          <div className="dashboard-content">
            <SectionHeading title='Insurance History' subtitle='View past and current insurance records for all vehicles' />
            <div className="loading-container">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p>Loading insurance history...</p>
            </div>
          </div>
        </PageContainer>
        {/* <Footer /> */}
      </>
    );
  }

  return (
    <>
      {/* <Header sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} showDate showTime showCalculator /> */}
      <PageContainer>
        <div className="dashboard-content">
          <SectionHeading 
            title='Insurance History' 
            subtitle='View past and current insurance records for all vehicles'
          />
        <div className="insurance-summary">
          <Cards 
            title="Total Insurance Records" 
            subtitle={filteredInsuranceHistory.length} 
          />
          <Cards 
            title="Active Policies" 
            subtitle={
              filteredInsuranceHistory.filter(insurance => {
                const statusInfo = getStatusInfo(insurance.status);
                return statusInfo.text === 'Active';
              }).length
            } 
          />
          <Cards 
            title="Expiring Soon" 
            subtitle={
              filteredInsuranceHistory.filter(insurance => {
                const statusInfo = getStatusInfo(insurance.status);
                return statusInfo.text === 'Expiring Soon';
              }).length
            } 
          />
          <Cards 
            title="Expired Policies" 
            subtitle={
              filteredInsuranceHistory.filter(insurance => {
                const statusInfo = getStatusInfo(insurance.status);
                return statusInfo.text === 'Expired';
              }).length
            } 
          />
        </div>
          
          <div className="header-actions2 d-flex justify-content-between align-items-center">
            <div className="vehicle-selector">
              <SelectInput
                label="Select Vehicle"
                name="vehicleSelect"
                value={selectedVehicle}
                onChange={(e) => setSelectedVehicle(e.target.value)}
                options={vehicleOptions}
                className="vehicle-dropdown"
              />
            </div>
            <div className="filter-actions d-flex gap-2 align-items-end">
              {(selectedVehicle || searchTerm) && (
                <RestoreButton text='Clear Filter' onClick={() => {
                    setSelectedVehicle('');
                    setSearchTerm('');
                  }}/>
              )}
              {selectedVehicle && (
                <div>
                  <Searchbar
                    placeholder='Search by registration number, policy number, or insurer'
                    type='search'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              )}
            </div>
          </div>

          <div className="table-container">
            {selectedVehicle ? (
              <Table columns={columns} data={tableData} />
            ) : (
              <div className="no-data-state">
                <div className="no-data-content">
                  <div className="no-data-icon">
                    <i className="fas fa-car" style={{ fontSize: '3rem', color: '#dee2e6' }}></i>
                  </div>
                  <h4 style={{ color: '#6c757d', marginBottom: '0.5rem' }}>No Vehicle Selected</h4>
                  <p style={{ color: '#6c757d', margin: 0 }}>Please select a vehicle from the dropdown above to view its insurance history.</p>
                </div>
              </div>
            )}
          </div>

          {/* Status Legend and Summary Statistics - Only show when vehicle is selected */}
          {selectedVehicle && (
            <>
              {/* Status Legend */}
              <div className="date-legend">
                <span className="legend-title">Status Legend:</span>
                <div className="legend-items">
                  <div className="legend-item">
                    <span className="legend-color status-active">Active</span>
                    <span className="legend-text">More than 30 days remaining</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-color status-expiring">Expiring Soon</span>
                    <span className="legend-text">Within 30 days</span>
                  </div>
                  <div className="legend-item">
                    <span className="legend-color status-expired">Expired</span>
                    <span className="legend-text">Past due date</span>
                  </div>
                </div>
              </div>

              {/* Summary Statistics */}
            </>
          )}
        </div>
      </PageContainer>
      {/* <Footer /> */}
    </>
  );
};

export default InsuranceList;
