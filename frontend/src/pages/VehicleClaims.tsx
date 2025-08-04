import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import PageContainer from '../components/PageContainer';
import ButtonWithGradient from '../components/ButtonWithGradient';
import SectionHeading from '../components/SectionHeading';
import Searchbar from '../components/Searchbar';
import InputText from '../components/InputText';
import SelectInput from '../components/SelectInput';
import FormDateInput from '../components/Date';
import TextAreaInput from '../components/TextAreaInput';
import Table from '../components/Table';
import { formatDateDDMMYYYY } from '../utils/vehicleUtils';
import { FileText, CheckCircle } from 'lucide-react';
import {
  Claim,
  FormData,
  getAllClaims,
  submitClaim,
  fetchVehiclesData,
} from '../utils/claimsUtils';
import { Vehicle } from '../services/api';
import '../styles/claims.css';

const VehicleClaims: React.FC = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [filteredClaims, setFilteredClaims] = useState<Claim[]>([]);

  const [formData, setFormData] = useState<FormData>({
    vehicle_id: '',
    claim_date: '',
    claim_amount: '',
    reason: '',
    status: 'Pending',
  });

  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const vehicleIdFromURL = queryParams.get('vehicleId');

  const fetchData = async (): Promise<void> => {
    try {
      const vehiclesData = await fetchVehiclesData();
      setVehicles(vehiclesData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (vehicleIdFromURL) {
      setFormData((prev) => ({ ...prev, vehicle_id: vehicleIdFromURL }));
    }
  }, [vehicleIdFromURL]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ): void => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(e.target.value);
  };

  const handleFromDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFromDate(e.target.value);
  };

  const handleToDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setToDate(e.target.value);
  };

  const fetchClaims = async () => {
    try {
        const allClaims = await getAllClaims();

        const filtered = allClaims.filter((claim) => {
          const matchesSearch =
            claim.registration_number &&
            claim.registration_number.toLowerCase().includes(searchTerm.toLowerCase());
            
            const claimDate = new Date(claim.claim_date);
            const matchesFrom = fromDate ? claimDate >= new Date(fromDate) : true;
          const matchesTo = toDate ? claimDate <= new Date(toDate) : true;
          
          return matchesSearch && matchesFrom && matchesTo;
        });
        
        const filteredWithIndex = filtered.map((claim, index) => ({
          ...claim,
          globalIndex: index + 1,
        }));
        
        setFilteredClaims(filteredWithIndex);
      } catch (err) {
        console.error('Error fetching claims:', err);
      }
    };
    
  useEffect(() => {
    fetchClaims();
  }, [searchTerm, fromDate, toDate]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (!formData.vehicle_id) {
      setErrorMessage('Please select a vehicle.');
      setTimeout(() => setErrorMessage(''), 4000);
      return;
    }

    try {
      const result = await submitClaim(formData);

      if (result.success) {
        setSuccessMessage(result.message);
        setTimeout(() => setSuccessMessage(''), 3000);

        if (result.updatedFormData) {
          setFormData(result.updatedFormData);
        }

        fetchData(); // Optional: refresh vehicle data
        fetchClaims(); // Refresh claims after submission
      } else {
        setErrorMessage(result.message);
        setTimeout(() => setErrorMessage(''), 5000);
      }
    } catch (error) {
      console.error('Error adding claim:', error);
      setErrorMessage('Error submitting claim. Please try again.');
      setTimeout(() => setErrorMessage(''), 5000);
    }
  };

  return (
    <>
      {/* <Header sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} showDate showTime showCalculator  /> */}
      {/* <div className="claims-container"> */}
      <PageContainer>
      <div className="dashboard-content">
        <SectionHeading title='Insurance Claims' subtitle='Manage and track vehicle insurance claims'/>  

        {/* Success Message */}
        {successMessage && (
          <div className="success-message">
            <CheckCircle size={20} />
            {successMessage}
          </div>
        )}

        {/* Error Message */}
        {errorMessage && (
          <div className="error-message">
            {/* <AlertTriangle size={20} /> */}
            {errorMessage}
          </div>
        )}

        <div className="claims-layout">
          <div className="claims-form-section">
            <div className="form-card">
              <div className="form-header">
                <h3>Submit New Claim</h3>
                <p>Add a new insurance claim for a vehicle</p>
              </div>

              <form onSubmit={handleSubmit} className="claim-form">
                <div className="form-group">
                  <SelectInput 
                    label='Vehicle' 
                    name="vehicle_id"
                    value={formData.vehicle_id}
                    onChange={handleChange}
                    required
                    disabled={!!vehicleIdFromURL}
                    className='text-uppercase'
                    options={[
                      { label: 'Select Vehicle', value: '', disabled: true },
                      ...vehicles.map(vehicle => ({
                        value: vehicle.id,
                        label: `${vehicle.registration_number} - ${vehicle.make} ${vehicle.model}`
                      }))
                    ]}
                  />
                </div>

                <div className="form-group">
                  <FormDateInput label='Claim Date'
                    name="claim_date"
                    value={formData.claim_date}
                    onChange={handleChange}/>
                  {/* <DatePicker onChange={handleChange} value={formData.claimDate}/> */}
                </div>

                <div className="form-group">
                  <InputText type='number' label='Claim Amount' name="claim_amount"
                    value={formData.claim_amount}
                    onChange={handleChange}
                    placeholder="Enter claim amount"
                    required/>
                </div>

                <div className="form-group">
                  <TextAreaInput label='Reason' name="reason"
                    value={formData.reason}
                    onChange={handleChange}
                    placeholder="Describe the reason for the claim"
                    />
                </div>

                {/* <div className="form-group">
                  <label hidden>Status</label>
                  <select
                    name="status"
                    value={formData.status}
                    onChange={handleChange}
                    hidden
                  >
                    <option value="Pending">Pending</option>
                  </select>
                </div> */}

                {/* <button type="submit" className="btn-primary">
                  <Plus size={16} />
                  Submit Claim
                </button> */}
                <ButtonWithGradient text='Submit Claim' type='submit' className='btn' />  

              </form>
            </div>
          </div>

          <div className="claims-history-section">
            <div className="history-card">
              <div className="history-header">
                <h3>Claim History</h3>
                <p>View and search through all claims</p>
              </div>

            <div className="search-container2" style={{ justifyContent: 'space-between'}}>
              <div style={{ display: 'flex', gap: '15px',width:'25%' }}>
                <Searchbar
                  type='search'
                  placeholder='Search registration number'
                  value={searchTerm}
                  onChange={handleSearchChange}
                />
              </div>

              <div style={{ display: 'flex', gap: '15px' }}>
                <FormDateInput label='From Date' name='fromDate' value={fromDate} onChange={handleFromDateChange} />
                <FormDateInput label='To Date' name='toDate' value={toDate} onChange={handleToDateChange} />
              </div>
            </div>

              <div className="claims-table-container">
                {filteredClaims.length === 0 ? (
                  <div className="empty-claims">
                    <FileText size={48} className="empty-icon" />
                    <h4>No claims found</h4>
                    <p>No claims match your search criteria</p>
                  </div>
                ) : (
                  <Table
                    columns={[
                      {
                        key: 'globalIndex',
                        header: '#',
                        renderCell: (_value: any, row: any) => (
                          <span className="index-cell">{row.globalIndex}</span>
                        )
                      },
                      {
                        key: 'registration_number',
                        header: 'Vehicle Registration No.',
                        renderCell: (value: string) => (
                          <span className="vehicle-cell text-uppercase">{value}</span>
                        )
                      },
                      { key: 'claim_date', header: 'Date', renderCell: (value) => formatDateDDMMYYYY(value) },
                      {
                        key: 'claim_amount',
                        header: 'Amount',
                        renderCell: (value: number) => (
                          <span className="amount-cell">₹{value}</span>
                        )
                      },
                      {
                        key: 'reason',
                        header: 'Reason',
                        renderCell: (value: string) => (
                          <span className="reason-cell">{value}</span>
                        )
                      }
                    ]}
                    data={filteredClaims}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      {/* </div> */}
      </div>
      </PageContainer>
      {/* <Footer /> */}
    </>
  );
};

export default VehicleClaims; 