import React, { useEffect, useState } from 'react';
import { driverAPI, vehicleAPI, Driver, Vehicle } from '../services/api';
import EditButton from '../components/EditButton';
import DeleteButton from '../components/DeleteButton';
import PageContainer from '../components/PageContainer';
import SectionHeading from '../components/SectionHeading';
import ButtonWithGradient from '../components/ButtonWithGradient';
import RestoreButton from '../components/RestoreButton';
import InputText from '../components/InputText';
import TextAreaInput from '../components/TextAreaInput';
import CancelButton from '../components/CancelButton';
import Searchbar from '../components/Searchbar';
import Table from '../components/Table';
import DriverRestoreModal from '../components/DriverRestoreModal';
import { Plus } from 'lucide-react';
import '../styles/Driver.css';

const DriverPage: React.FC = () => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editDriver, setEditDriver] = useState<Driver | null>(null);
  const [form, setForm] = useState({
    name: '',
    license_number: '',
    phone: '',
    address: '',
    status: 'active',
    assignedVehicleIds: [] as string[],
  });
  const [error, setError] = useState('');

  // Search state
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Restore modal state
  const [showRestoreModal, setShowRestoreModal] = useState(false);

  // Fetch drivers and vehicles
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [driversData, vehiclesData] = await Promise.all([
          driverAPI.getAllDrivers(),
          vehicleAPI.getAllVehicles(),
        ]);
        setDrivers(driversData);
        setVehicles(vehiclesData);
      } catch (err) {
        setError('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // Filter drivers based on search term
  const filteredDrivers = drivers.filter(driver =>
    driver.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.license_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.phone.includes(searchTerm)
  );

  // Transform drivers data for the Table component
  const tableData = filteredDrivers.map((driver, index) => {
    // Get assigned vehicles for this driver
    const assignedVehicleNames = driver.assignedVehicleIds && driver.assignedVehicleIds.length > 0
      ? driver.assignedVehicleIds.map(vehicleId => {
          const vehicle = vehicles.find(v => v.id === vehicleId);
          return vehicle ? vehicle.registration_number : 'Unknown';
        }).join(', ')
      : 'No vehicles assigned';
    
    return {
      ...driver,
      globalIndex: index + 1,
      assignedVehicles: assignedVehicleNames,
      status: driver.status === 'active' ? 'Active' : 'Inactive',
      actions: driver.id // We'll use this for the renderCell function
    };
  });

  // Handle form input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      // For status checkbox, set 'active' or 'inactive' string values
      if (name === 'status') {
        setForm({ ...form, [name]: checked ? 'active' : 'inactive' });
      } else {
        setForm({ ...form, [name]: checked });
      }
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  // Handle vehicle assignment
  const handleVehicleSelect = (vehicleId: string) => {
    const currentAssigned = form.assignedVehicleIds || [];
    if (currentAssigned.includes(vehicleId)) {
      // Remove vehicle from assignment
      setForm({
        ...form,
        assignedVehicleIds: currentAssigned.filter(id => id !== vehicleId)
      });
    } else {
      // Add vehicle to assignment
      setForm({
        ...form,
        assignedVehicleIds: [...currentAssigned, vehicleId]
      });
    }
  };

  // Open modal for add/edit
  const openModal = (driver?: Driver) => {
    if (driver) {
      setEditDriver(driver);
      setForm({
        name: driver.name,
        license_number: driver.license_number,
        phone: driver.phone,
        address: driver.address,
        status: driver.status,
        assignedVehicleIds: driver.assignedVehicleIds || [],
      });
    } else {
      setEditDriver(null);
      setForm({ name: '', license_number: '', phone: '', address: '', status: 'active', assignedVehicleIds: [] });
    }
    setShowModal(true);
    setError('');
  };

  // Close modal
  const closeModal = () => {
    setShowModal(false);
    setEditDriver(null);
    setError('');
  };

  // Validate form
  const validate = async () => {
    // Check required fields
    if (!form.name.trim() || !form.license_number.trim() || !form.phone.trim()) {
      setError('Name, License Number, and Phone are required');
      return false;
    }

    // Validate phone number length
    if (form.phone.trim().length !== 10) {
      setError('Phone number must be exactly 10 digits');
      return false;
    }

    // Only check for duplicate license number when adding a new driver (not when editing)
    if (!editDriver) {
      // Check if license number already exists (case-insensitive)
      const licenseExists = drivers.some(
        driver => driver.license_number.toLowerCase() === form.license_number.trim().toLowerCase()
      );
      
      if (licenseExists) {
        setError('A driver with this license number already exists');
        return false;
      }
    }

    return true;
  };


  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isValid = await validate();
    if (!isValid) return;
    try {
      const driverData = {
        ...form,
        last_updated: new Date().toISOString(),
        created_at: editDriver ? editDriver.created_at : new Date().toISOString()
      };
      // console.log('driver data',driverData);
      
      let savedDriver;
      if (editDriver) {
        savedDriver = await driverAPI.updateDriver(editDriver.id, driverData);
      } else {
        savedDriver = await driverAPI.createDriver(driverData);
      }
      
      // Handle vehicle assignments
      // try {
      //   // First, get current assignments if editing
      //   let currentAssignments: string[] = [];
      //   if (editDriver && editDriver.assignedVehicleIds) {
      //     currentAssignments = editDriver.assignedVehicleIds;
      //   }
        
      //   const newAssignments = form.assignedVehicleIds || [];
        
      //   // Find vehicles to unassign (were assigned before but not now)
      //   const toUnassign = currentAssignments.filter(vehicleId => 
      //     !newAssignments.includes(vehicleId)
      //   );
        
      //   // Find vehicles to assign (new assignments)
      //   const toAssign = newAssignments.filter(vehicleId => 
      //     !currentAssignments.includes(vehicleId)
      //   );
        
      //   // Process unassignments
      //   for (const vehicleId of toUnassign) {
      //     try {
      //       await driverAPI.unassignVehicleFromDriver(savedDriver.id, vehicleId);
      //     } catch (unassignError) {
      //       console.warn(`Failed to unassign vehicle ${vehicleId}:`, unassignError);
      //     }
      //   }
        
      //   // Process new assignments
      //   for (const vehicleId of toAssign) {
      //     try {
      //       await driverAPI.assignVehicleToDriver(savedDriver.id, vehicleId);
      //     } catch (assignError) {
      //       console.warn(`Failed to assign vehicle ${vehicleId}:`, assignError);
      //     }
      //   }
      // } catch (assignmentError) {
      //   console.error('Error managing vehicle assignments:', assignmentError);
      //   setError('Driver saved but there was an issue with vehicle assignments');
      // }
      
      // Refresh list
      const driversData = await driverAPI.getAllDrivers();
      setDrivers(driversData);
      closeModal();
      alert(`Driver ${editDriver ? 'updated' : 'added'} successfully`);
    } catch (err) {
      setError('Failed to save driver');
    }
  };

  // Handle driver restored
  const handleDriverRestored = async () => {
    const driversData = await driverAPI.getAllDrivers();
    setDrivers(driversData);
  };

  // Soft delete driver
  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this driver? This action can be undone by an administrator.')) return;
    try {
      // await driverAPI.softDeleteDriver(id);
      // setDrivers(drivers.filter((d) => d.id !== id));
      alert('Driver has been deleted successfully');
    } catch {
      alert('Failed to delete driver');
    }
  };

  return (
    <>
      {/* <Header sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} showDate showTime showCalculator /> */}
      {/* <div className="driver-page"> */}
      <PageContainer>
        <div className="dashboard-content">

        <SectionHeading title='Driver' subtitle="Driver's page" />

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center',marginBottom:'-10px' }}>
            <div style={{ display: 'flex', gap: '10px' }}>
              <ButtonWithGradient onClick={()=>openModal()} text='+ Add Driver'/>
              <RestoreButton onClick={() => setShowRestoreModal(true)} 
                text='Restore Deleted'/>
            </div>
            <div className="search-wrapper">
              <Searchbar type='search' value={searchTerm} onChange={(e)=>setSearchTerm(e.target.value)} placeholder='Search by name'/>
            </div>
          </div>

        {loading ? (
          <div className='mt-3'>Loading...</div>
        ) : error ? (
          <div style={{ color: 'red',marginTop:'20px' }}>{error}</div>
        ) : drivers.length === 0 ? (
          <div className="empty-state">
            <h3>No drivers registered yet</h3>
            <p>Start by adding your first driver to the system</p>
            <ButtonWithGradient text='' onClick={() => openModal()}><Plus size={16} />Add Driver</ButtonWithGradient>
          </div>
        ) : (
          <div className="table-container">
            <Table
              columns={[
                {
                  key: 'globalIndex',
                  header: '#',
                },
                {
                  key: 'name',
                  header: 'Name',
                  renderCell: (value: string) => (
                    <span className='text-capitalize'>{value}</span>
                  )
                },
                {
                  key: 'license_number',
                  header: 'License Number',
                  renderCell: (value: string) => (
                    <span className='text-uppercase'>{value}</span>
                  )
                },
                { key: 'phone', header: 'Phone' },
                {
                  key: 'address',
                  header: 'Address',
                  renderCell: (value: string) => (
                    <span className='text-capitalize'>{value}</span>
                  )
                },
                {
                  key: 'status',
                  header: 'Status',
                  renderCell: (value: string, row: any) => (
                    <span className={`status-badge ${row.status.toLowerCase() === 'active' ? 'active' : 'inactive'}`}>
                      {value}
                    </span>
                  )
                },
                {
                  key: 'assignedVehicles',
                  header: 'Assigned Vehicles',
                  renderCell: (value: string) => {
                    if (!value || value === 'No vehicles assigned') return <span>No vehicles assigned</span>;
                    return value.split(', ').map((vid, index) => (
                      <span key={index} className="driver-vehicle-badge text-uppercase">
                        {vid}
                      </span>
                    ));
                  }
                },
                {
                  key: 'actions',
                  header: 'Actions',
                  renderCell: (value: string) => (
                    <div className='actions-div' style={{ display: 'flex', gap: '10px' }}>
                      <EditButton onClick={()=> openModal(drivers.find(d=>d.id === value))}/>
                        <DeleteButton onClick={() => handleDelete(value)}/>
                    </div>
                  )
                }
              ]}
              data={tableData}
            />
          </div>
        )}

        {/* Modal for add/edit */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal">
              <h2>{editDriver ? 'Edit Driver' : 'Add Driver'}</h2>
              <form onSubmit={handleSubmit}>
                {error && <div className="error">{error}</div>}
                <div style={{ marginBottom: 12 }}>
                  <InputText label='Name *' name="name" value={form.name} onChange={handleChange} placeholder='Name of Driver' required/>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <InputText label='License Number' name="license_number" value={form.license_number} placeholder='License Number' onChange={handleChange} required />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <InputText label='Phone *' type='number' name="phone" value={form.phone} onChange={handleChange} placeholder='Phone Number' required />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <TextAreaInput label='Address' name="address" value={form.address} onChange={handleChange} placeholder='Address' />
                </div>
                <div style={{marginBottom: 12 }} className='driver-checkbox'>
                  <label>
                    Active Driver
                    <div style={{display:'inline-flex'}}> 
                      <input
                        type="checkbox"
                        name="status"
                        checked={form.status === 'active'}
                        onChange={handleChange}
                      />
                    </div> 
                  </label>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label>Assign Vehicles</label>
                  <div className="vehicle-list">
                    {vehicles.map((v) => (
                      <div key={v.id} className='driver-checkbox'>
                        <label className='driver-label text-capitalize'>
                          {v.make} {v.model} <span className='text-uppercase'>({v.registration_number})</span>
                            <input
                              type="checkbox"
                              checked={form.assignedVehicleIds?.includes(v.id) || false}
                              onChange={() => handleVehicleSelect(v.id)} 
                            />
                        </label>
                      </div>
                    ))}
                  </div>
                  <small style={{ color: '#666', fontStyle: 'italic' }}>Select vehicles to assign to this driver.</small>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                  <CancelButton onClick={closeModal} text='Cancel'/>
                  <ButtonWithGradient type='submit' className='btn'>{editDriver ? 'Update' : 'Add'}</ButtonWithGradient>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Restore Deleted Drivers Modal */}
        <DriverRestoreModal
          isOpen={showRestoreModal}
          onClose={() => setShowRestoreModal(false)}
          onDriverRestored={handleDriverRestored}
        />
      {/* </div> */}
        </div>
      </PageContainer>
      {/* <Footer/> */}
    </>
  );
};

export default DriverPage;