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
import {
  FileText,
  CheckCircle,
  // Car,
  // Search,
  // Plus,
  // AlertTriangle,
  // ChevronLeft,
  // ChevronRight
} from 'lucide-react';
import { 
  Vehicle, 
  // Claim, 
  FormData, 
  getAllClaims, 
  filterClaims, 
  submitClaim, 
  // updateClaimStatus, 
  fetchVehiclesData 
} from '../utils/claimsUtils';
import '../styles/claims.css';

const VehicleClaims: React.FC = () => {
  // const [claims, setClaims] = useState<Claim[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [successMessage, setSuccessMessage] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string>('');
  
  const [formData, setFormData] = useState<FormData>({
    vehicleId: '',
    claimDate: '',
    claimAmount: '',
    reason: '',
    status: 'Pending',
  });

  const [fromDate, setFromDate] = useState<string>('');
  const [toDate, setToDate] = useState<string>('');

  const fetchData = async (): Promise<void> => {
    try {
      const vehiclesData = await fetchVehiclesData();
      setVehicles(vehiclesData);
      // Note: Claims are stored within vehicles, so we don't need a separate claims fetch
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const vehicleIdFromURL = queryParams.get('vehicleId');

  useEffect(() => {
    if (vehicleIdFromURL) {
      setFormData((prev) => ({ ...prev, vehicleId: vehicleIdFromURL }));
    }
  }, [vehicleIdFromURL]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>): void => {
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

  // Get all claims from all vehicles
  const allClaims = getAllClaims(vehicles);

  // Filter claims based on search term and date range
  const filteredClaims = allClaims.filter(claim => {
    const matchesSearch = claim.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase());
    let matchesFrom = true;
    let matchesTo = true;
    if (fromDate) {
      matchesFrom = claim.claimDate >= fromDate;
    }
    if (toDate) {
      matchesTo = claim.claimDate <= toDate;
    }
    return matchesSearch && matchesFrom && matchesTo;
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    try {
      const result = await submitClaim(formData, vehicleIdFromURL);

      if (result.success) {
        // Show success message
        setSuccessMessage(result.message);

        // Clear success message after 3 seconds
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);

        // Reset form
        if (result.updatedFormData) {
          setFormData(result.updatedFormData);
        }

        // Refresh data to show updated claims in the table
        fetchData();
      } else {
        setErrorMessage(result.message);
        // Clear error message after 5 seconds
        setTimeout(() => {
          setErrorMessage('');
        }, 5000);
      }

    } catch (error) {
      console.error('Error adding claim:', error);
      setErrorMessage('Error submitting claim. Please try again.');
      // Clear error message after 5 seconds
      setTimeout(() => {
        setErrorMessage('');
      }, 5000);
    }
  };

  // const handleStatusChange = async (vehicleId: string, claimIndex: number, newStatus: string): Promise<void> => {
  //   try {
  //     const result = await updateClaimStatus(vehicleId, claimIndex, newStatus);

  //     if (result.success && result.updatedClaims) {
  //       // Update local state
  //       setVehicles(prevVehicles =>
  //         prevVehicles.map(v =>
  //           v.id === vehicleId
  //             ? { ...v, claims: result.updatedClaims }
  //             : v
  //         )
  //       );
  //     }

  //   } catch (error) {
  //     console.error('Error updating claim status:', error);
  //   }
  // };

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
                    name="vehicleId"
                    value={formData.vehicleId}
                    onChange={handleChange}
                    required
                    disabled={!!vehicleIdFromURL}
                    className='text-uppercase'
                    options={[
                      { value: '', label: 'Select Vehicle', disabled: true },
                      ...vehicles.map(vehicle => ({
                        value: vehicle.id,
                        label: `${vehicle.registrationNumber} - ${vehicle.make} ${vehicle.model}`
                      }))
                    ]}
                  />
                </div>

                <div className="form-group">
                  <FormDateInput label='Claim Date'
                    name="claimDate"
                    value={formData.claimDate}
                    onChange={handleChange}/>
                  {/* <DatePicker onChange={handleChange} value={formData.claimDate}/> */}
                </div>

                <div className="form-group">
                  <InputText type='number' label='Claim Amount' name="claimAmount"
                    value={formData.claimAmount}
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
              <div style={{ display: 'flex', gap: '15px' }}>
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
                        key: 'registrationNumber',
                        header: 'Vehicle',
                        renderCell: (value: string) => (
                          <span className="vehicle-cell text-uppercase">{value}</span>
                        )
                      },
                      { key: 'claimDate', header: 'Date', renderCell: (value) => formatDateDDMMYYYY(value) },
                      {
                        key: 'claimAmount',
                        header: 'Amount',
                        renderCell: (value: string) => (
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