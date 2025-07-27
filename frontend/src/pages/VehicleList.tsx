import {
  Car,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import infoLogo from '../assets/info.png';
import ButtonWithGradient from '../components/ButtonWithGradient.tsx';
import ClaimsModal from '../components/ClaimsModal.tsx';
import DeleteButton from '../components/DeleteButton.tsx';
import InsuranceModal from '../components/InsuranceModal.tsx';
import PageContainer from '../components/PageContainer.tsx';
import RestoreButton from '../components/RestoreButton.tsx';
import ReusableModal from '../components/ReusableModal.tsx';
import Searchbar from '../components/Searchbar.tsx';
import SectionHeading from '../components/SectionHeading.tsx';
import Table from '../components/Table.tsx';
import UpdateVehicleModal from '../components/UpdateVehicleModal.tsx';
import VehicleRestoreModal from '../components/VehicleRestoreModal.tsx';
import { Vehicle, vehicleAPI } from '../services/api.ts';
import '../styles/Vehiclelist.css';
import { processExpiredInsurance } from '../utils/insuranceUtils.ts';
import {
  Claim,
  calculateVehicleAge,
  fetchVehiclesData,
  filterVehicles,
} from '../utils/vehicleUtils.ts';
// import { faL } from '@fortawesome/free-solid-svg-icons';
// import { Shield } from 'lucide-react';

const VehicleList: React.FC = () => {
  const [claimsModalOpen, setClaimsModalOpen] = useState<boolean>(false);
  const [claims, setClaims] = useState<Claim[]>([]);
  const [loadingClaims, setLoadingClaims] = useState<boolean>(false);
  const [claimsError, setClaimsError] = useState<string>('');

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [showInsuranceModal, setShowInsuranceModal] = useState<boolean>(false);
  const [showDetailsModal, setShowDetailsModal] = useState<boolean>(false);
  const [showUpdateModal, setShowUpdateModal] = useState<boolean>(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  // Search state
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Restore modal state
  const [showRestoreModal, setShowRestoreModal] = useState<boolean>(false);

  // Filter vehicles based on search term
  const filteredVehicles = filterVehicles(vehicles, searchTerm);

  const navigate = useNavigate();
  // const goToClaims = (vehicleId: string) => {
  //   navigate(`/claims?vehicleId=${vehicleId}`);
  // };

  useEffect(() => {
    const fetchVehicles = async (): Promise<void> => {
      try {
        // Process expired insurance first
        const { updatedVehicles } = await processExpiredInsurance();
        setVehicles(updatedVehicles);
      } catch (err) {
        console.error(err);
        // Fallback to original fetch if processing fails
        try {
          const data = await fetchVehiclesData();
          setVehicles(data);
        } catch (fallbackErr) {
          console.error('Fallback fetch also failed:', fallbackErr);
        }
      }
    };
    fetchVehicles();
  }, []);

  // Debug useEffect for modal states
  useEffect(() => {
    console.log('claimsModalOpen changed to:', claimsModalOpen);
  }, [claimsModalOpen]);

  useEffect(() => {
    console.log('selectedVehicle changed to:', selectedVehicle);
  }, [selectedVehicle]);

  const viewClaims = async (vehicleId: string): Promise<void> => {
    console.log('viewClaims called with vehicleId:', vehicleId);
    // Find the vehicle to check insurance
    const vehicle = vehicles.find(v => v.id === vehicleId);
    console.log('Found vehicle:', vehicle);

    // Check if vehicle has insurance
    if (!vehicle?.insurance) {
      toast.error("Vehicle does not have insurance");
      return;
    }

    setLoadingClaims(true);
    setClaimsError('');
    try {
      // Set the vehicle as selectedVehicle
      setSelectedVehicle(vehicle);

      // Get claims from the vehicle object since they're stored there
      const vehicleClaims = vehicle?.claims || [];
      console.log('Vehicle claims:', vehicleClaims);
      setClaims(vehicleClaims);
    } catch (err) {
      console.error('Error loading claims:', err);
      setClaimsError('Failed to load claims');
      setClaims([]);
    } finally {
      setLoadingClaims(false);
      setClaimsModalOpen(true);
      console.log('claimsModalOpen set to true');
    }
  };

  const handleInsuranceUpdated = (updatedVehicle: Vehicle): void => {
    const updatedVehicles = vehicles.map((v) =>
      v.id === updatedVehicle.id ? updatedVehicle : v
    );
    setVehicles(updatedVehicles);
  };

  const handleVehicleUpdated = (updatedVehicle: Vehicle): void => {
    const updatedVehicles = vehicles.map((v) =>
      v.id === updatedVehicle.id ? updatedVehicle : v
    );
    setVehicles(updatedVehicles);
  };

  const showVehicleDetails = (vehicle: Vehicle): void => {
    setSelectedVehicle(vehicle);
    setShowDetailsModal(true);
  };

  const openUpdateModal = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setShowUpdateModal(true);
  };

  const openInsuranceModal = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setShowInsuranceModal(true);
  };

  // Handle vehicle restored
  const handleVehicleRestored = async () => {
    const vehiclesData = await vehicleAPI.getAllVehicles();
    setVehicles(vehiclesData);
  };

  // Helper to render vehicle details
  const renderVehicleDetails = (vehicle: Vehicle) => (
    <div className="vehicle-details-card">
      <div className="vehicle-details-top">
        <div>
          <h3 className="vehicle-name text-capitalize">{vehicle.make} {vehicle.model}</h3>
          <div className="vehicle-reg text-uppercase">{vehicle.registrationNumber}</div>
        </div>
        <span className="year-badge">{new Date(vehicle.purchaseDate).getFullYear()}</span>
      </div>
      <div className="info-section">
        <h5 className='info-title'>Basic Details</h5>
        <div className="info-grid">
          <div>
            <span className="info-label">Color:</span>
            <span>{vehicle.color}</span>
          </div>
          <div>
            <span className="info-label">Age:</span>
            <span>{calculateVehicleAge(vehicle.purchaseDate)} years</span>
          </div>
          <div>
            <span className="info-label">Fuel Type:</span>
            <span className={`fuel-badge ${vehicle.fuelType.toLowerCase()}`}>{vehicle.fuelType}</span>
          </div>
        </div>
      </div>
      <div className="info-section">
        <h5 className='info-title'>More Details</h5>
        <div className="info-grid">
          <div>
            <span className="info-label">Engine No.:</span>
            <span>{vehicle.engineNumber.toUpperCase()}</span>
          </div>
          <div>
            <span className="info-label">Chassis No.:</span>
            <span>{vehicle.chassisNumber.toUpperCase()}</span>
          </div>
          <div>
            <span className="info-label">Price:</span>
            <span>₹{vehicle.purchasePrice}</span>
          </div>
        </div>
      </div>
      <div className="info-section">
        <h5 className='info-title'>Owner Details</h5>
        <div className="info-grid">
          <div>
            <span className="info-label">Owner:</span>
            <span className="text-capitalize">{vehicle.owner}</span>
          </div>
          <div>
            <span className="info-label">Phone:</span>
            <span>{vehicle.phone}</span>
          </div>
          <div className="full-width">
            <span className="info-label">Address:</span>
            <span>{vehicle.address}</span>
          </div>
        </div>
      </div>
      <div className="info-section">
        <h5 className='info-title'>Insurance Details</h5>
        <div className="info-grid">
          {vehicle.insurance ? (
            <>
              <div>
                <span className="info-label">Policy #:</span>
                <span>{vehicle.insurance.policyNumber}</span>
              </div>
              <div>
                <span className="info-label">Insurer:</span>
                <span>{vehicle.insurance.insurer}</span>
              </div>
              <div>
                <span className="info-label">Type:</span>
                <span>{vehicle.insurance.policytype}</span>
              </div>
              <div>
                <span className="info-label">Premium:</span>
                <span>₹{vehicle.insurance.premiumAmount}</span>
              </div>
            </>
          ) : (
            <div className="no-insurance">No insurance information available</div>
          )}
        </div>
      </div>
    </div>
  );

  const renderVehicleDetailsFooter = (vehicle: Vehicle) => (
    <div className="vehicle-details-actions">
      <ButtonWithGradient onClick={() => {
        if (vehicle.insurance) {
          viewClaims(vehicle.id);
          setShowDetailsModal(false);
        } else {
          toast.error("Vehicle has no insurance");
        }
      }} text='View Claims' />
      <ButtonWithGradient text={vehicle.insurance ? 'Update Insurance' : 'Add Insurance'} onClick={() => {
        setShowDetailsModal(false);
        openInsuranceModal(vehicle);
      }} />
      <ButtonWithGradient onClick={() => {
        setShowDetailsModal(false);
        openUpdateModal(vehicle);
      }} text='Update Vehicle Details' />
    </div>
  );

  return (
    <>
      {/* <Header sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} showDate showTime showCalculator /> */}
      {/* <div className="vehicle-list-container"> */}
      <PageContainer>
        <div className="dashboard-content">
          <SectionHeading title='Vehicle List' subtitle='Manage and view all your registered vehicles' />
          <div className="header-actions2 d-flex justify-content-between align-items-center">
            <div>
              <RestoreButton onClick={() => setShowRestoreModal(true)}
                text='Restore Deleted' />
            </div>
            <div className="search-wrapper">
              <Searchbar
                type='search'
                placeholder='Search registration number'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>


          {vehicles.length === 0 ? (
            <div className="empty-state">
              <Car size={64} className="empty-icon" />
              <h3>No vehicles registered yet</h3>
              <p>Start by adding your first vehicle to the system</p>
              <ButtonWithGradient text='Click here to register' onClick={() => navigate('/register-vehicle')} />
            </div>
          ) : (
            <div className="table-container">
              <Table
                columns={[
                  { key: 'number', header: '#' },
                  { key: 'make', header: 'Make' },
                  { key: 'model', header: 'Model' },
                  { key: 'registrationNumber', header: 'Reg. Number' },
                  { key: 'purchaseDate', header: 'Purchase Date' },
                  { key: 'color', header: 'Color' },
                  { key: 'age', header: 'Age' },
                  { key: 'fuelType', header: 'Fuel Type' },
                  { key: 'purchasePrice', header: 'Price' },
                  { key: 'actions', header: 'Actions' },
                  { key: 'status', header: 'Status' },
                ]}
                data={filteredVehicles.map((vehicle, index) => ({
                  number: index + 1,
                  ...vehicle,
                  registrationNumber: (vehicle.registrationNumber || '').toUpperCase(),
                  age: `${calculateVehicleAge(vehicle.purchaseDate)} years`,
                  fuelType: (
                    <span className={`fuel-badge ${vehicle.fuelType.toLowerCase()}`}>
                      {vehicle.fuelType}
                    </span>
                  ),
                  purchasePrice: `${vehicle.purchasePrice} /-`,
                  actions: (
                    <div className="d-flex gap-3">
                      <div className='d-flex align-items-center justify-content-center'>
                        <a onClick={() => showVehicleDetails(vehicle)}><img src={infoLogo} alt="infoLogo" /></a>
                      </div>
                      <DeleteButton
                        onClick={async () => {
                          if (!window.confirm('Are you sure you want to delete this vehicle? This action can be undone by an administrator.')) return;
                          try {
                            await vehicleAPI.softDeleteVehicle(vehicle.id);
                            setVehicles(vehicles.filter(v => v.id !== vehicle.id));
                            toast.success('Vehicle has been deleted successfully');
                          } catch (error) {
                            toast.error('Failed to delete vehicle.');
                          }
                        }}
                      />
                    </div>
                  ),
                  status: (
                    <select name="status" id="" className="status-selector">
                      <option value="" selected disabled>Set status</option>
                      <option value="">Active</option>
                      <option value="">Inactive</option>
                      <option value="">Maintenance</option>
                    </select>
                  ),
                }))}
              />
            </div>
          )}

          {/* Vehicle Details Modal (now using ReusableModal) */}
          <ReusableModal
            isOpen={showDetailsModal}
            onClose={() => setShowDetailsModal(false)}
            title={selectedVehicle ? `Vehicle Details - ${selectedVehicle.make} ${selectedVehicle.model}` : ''}
            onSubmit={() => setShowDetailsModal(false)}
            submitButtonText="Close"
            showCancelButton={false}
            maxWidth="600px"
            maxHeight="80vh"
            width="95%"
          >
            {selectedVehicle && (
              <>
                {renderVehicleDetails(selectedVehicle)}
                <div className="modal-footer">
                  {renderVehicleDetailsFooter(selectedVehicle)}
                </div>
              </>
            )}
          </ReusableModal>

          {/* Insurance Modal */}
          <InsuranceModal
            isOpen={showInsuranceModal}
            onClose={() => setShowInsuranceModal(false)}
            vehicle={selectedVehicle}
            onInsuranceUpdated={handleInsuranceUpdated}
          />

          {/* Claims Modal */}
          <ClaimsModal
            isOpen={claimsModalOpen}
            onClose={() => setClaimsModalOpen(false)}
            vehicle={selectedVehicle}
            claims={claims}
            loading={loadingClaims}
            error={claimsError}
          />

          {/* Update Vehicle Details Modal */}
          <UpdateVehicleModal
            isOpen={showUpdateModal}
            onClose={() => setShowUpdateModal(false)}
            vehicle={selectedVehicle}
            onVehicleUpdated={handleVehicleUpdated}
          />

          {/* Restore Deleted Vehicles Modal */}
          <VehicleRestoreModal
            isOpen={showRestoreModal}
            onClose={() => setShowRestoreModal(false)}
            onVehicleRestored={handleVehicleRestored}
          />

          <ToastContainer />
          {/* </div> */}
        </div>
      </PageContainer>
      {/* <Footer /> */}
    </>
  );
};

export default VehicleList; 