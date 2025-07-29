import React, { useEffect, useState } from 'react';
import { Vehicle, Insurance, vehicleAPI, insuranceAPI } from '../services/api';
import Searchbar from '../components/Searchbar';
import SectionHeading from '../components/SectionHeading';
import PageContainer from '../components/PageContainer';
import Table from '../components/Table';
import '../styles/Insurance.css';
import FormDateInput from '../components/Date';
import { formatDateDDMMYYYY } from '../utils/vehicleUtils';

interface InsuranceWithVehicle extends Insurance {
  vehicle?: Vehicle;
}

const InsuranceManagement: React.FC = () => {
  const [insuranceRecords, setInsuranceRecords] = useState<InsuranceWithVehicle[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  // Filter insurance records based on search term and date range
  const filteredInsuranceRecords = insuranceRecords.filter(insurance => {
    const vehicle = insurance.vehicle;
    const matchesSearch = vehicle?.registration_number && 
      vehicle.registration_number.toLowerCase().includes(searchTerm.toLowerCase());
    
    let matchesFrom = true;
    let matchesTo = true;
    
    if (fromDate) {
      matchesFrom = insurance.start_date >= fromDate;
    }
    if (toDate) {
      matchesTo = insurance.end_date <= toDate;
    }
    
    return matchesSearch && matchesFrom && matchesTo;
  });

  // Get date status class for styling
  const getDateStatusClass = (endDate: string): string => {
    const today = new Date();
    const end = new Date(endDate);
    const daysUntilExpiry = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    if (daysUntilExpiry < 0) return 'expired';
    if (daysUntilExpiry <= 30) return 'expiring-soon';
    return 'active';
  };

  const handleFromDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFromDate(e.target.value);
  };

  const handleToDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setToDate(e.target.value);
  };

  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      setLoading(true);
      try {
        // Fetch all insurance records
        const insuranceData = await insuranceAPI.getAllInsurance();
        
        // Fetch all vehicles to match with insurance
        const vehiclesData = await vehicleAPI.getAllVehicles();
        
        // Combine insurance with vehicle data
        const insuranceWithVehicles = insuranceData.map(insurance => {
          const vehicle = vehiclesData.find(v => v.id === insurance.vehicle_id);
          return {
            ...insurance,
            vehicle
          };
        });
        
        setInsuranceRecords(insuranceWithVehicles);
      } catch (err) {
        console.error('Error fetching insurance data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Define table columns
  const columns = [
    { key: 'number', header: '#' },
    { key: 'make', header: 'Make' },
    { key: 'model', header: 'Model' },
    { 
      key: 'registrationNumber', 
      header: 'Reg. Number',
      renderCell: (value: string) => value?.toUpperCase() || 'N/A'
    },
    { key: 'policyNumber', header: 'Policy #' },
    { key: 'insurer', header: 'Insurer' },
    { key: 'policyType', header: 'Type' },
    { key: 'startDate', header: 'Start', renderCell: (value: string) => formatDateDDMMYYYY(value) },
    { 
      key: 'endDate', 
      header: 'End',
      renderCell: (value: string) => (
        <span className={getDateStatusClass(value)}>{formatDateDDMMYYYY(value)}</span>
      )
    },
    { key: 'premiumAmount', header: 'Premium' },
    { key: 'chassisNumber', header: 'Chassis',
      renderCell:(value:string)=>value?.toUpperCase() || 'N/A'
     },
    { key: 'engineNumber', header: 'Engine',
      renderCell:(value:string)=>value?.toUpperCase() || 'N/A'
     },
    { key: 'issueDate', header: 'Issue Date', renderCell: (value: string) => formatDateDDMMYYYY(value) },
    { key: 'payment', header: 'Payment' }
  ];

  return (
    <PageContainer>
      <div className="dashboard-content">
        <SectionHeading title='Insurance Management' subtitle='Manage vehicle insurance policies and details'/>
        <div className="header-actions2 d-flex justify-content-between">
          <div style={{display:'flex',gap:'15px'}}>
            <FormDateInput name='fromDate' label='From Date' value={fromDate} onChange={handleFromDateChange}/>
            <FormDateInput name='toDate' label='To Date' value={toDate} onChange={handleToDateChange}/>
          </div>
          <div className="search-wrapper">
            <Searchbar
            placeholder='Search registration number'
              type='search'
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="loading-state">
            <p>Loading insurance data...</p>
          </div>
        ) : filteredInsuranceRecords.length === 0 ? (
          <div className="empty-state">
            <h3>No insurance records found</h3>
            <p>No insurance policies match your search criteria</p>
          </div>
        ) : (
          <div className="table-container">
            <Table
              columns={columns}
              data={filteredInsuranceRecords.map((insurance, index) => ({
                number: index + 1,
                make: insurance.vehicle?.make || 'N/A',
                model: insurance.vehicle?.model || 'N/A',
                registrationNumber: insurance.vehicle?.registration_number || 'N/A',
                policyNumber: insurance.policy_number,
                insurer: insurance.insurer,
                policyType: insurance.policy_type,
                startDate: insurance.start_date,
                endDate: insurance.end_date,
                premiumAmount: `₹${insurance.premium_amount}`,
                chassisNumber: insurance.vehicle?.chassis_number || 'N/A',
                engineNumber: insurance.vehicle?.engine_number || 'N/A',
                issueDate: insurance.issue_date,
                payment: insurance.payment?.toString() || 'N/A',
              }))}
            />
          </div>
        )}
      </div>
    </PageContainer>
  );
};

export default InsuranceManagement; 