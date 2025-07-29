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
  const [form, setForm] = useState<Omit<Driver, 'id'>>({
    name: '',
    license_number: '',
    phone: '',
    address: '',
    status: 'active',
    last_updated: '',
    created_at: '',
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
  const tableData = filteredDrivers.map((driver, index) => ({
    ...driver,
    globalIndex: index + 1,
    assignedVehicles: driver.assignedVehicleIds.map((vid) => {
      const v = vehicles.find((veh) => veh.id === vid);
      return v ? v.registration_number : null;
    }).filter(Boolean).join(', '),
    status: driver.status === 'active' ? 'Active' : 'Inactive',
    actions: driver.id // We'll use this for the renderCell function
  }));

  // Handle form input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setForm({ ...form, [name]: checked });
    } else {
      setForm({ ...form, [name]: value });
    }
  };

  // Handle vehicle assignment
  const handleVehicleSelect = (vehicleId: string) => {
    setForm((prev) => {
      const assigned = prev.assigned_vehicle_ids.includes(vehicleId)
        ? prev.assigned_vehicle_ids.filter((id) => id !== vehicleId)
        : [...prev.assigned_vehicle_ids, vehicleId];
      return { ...prev, assigned_vehicle_ids: assigned };
    });
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
        assigned_vehicle_ids: driver.assigned_vehicle_ids,
      });
    } else {
      setEditDriver(null);
      setForm({ name: '', license_number: '', phone: '', address: '', status: 'active', assigned_vehicle_ids: [] });
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
  const validate = () => {
    if (!form.name.trim() || !form.license_number.trim() || !form.phone.trim()) {
      setError('Name, License Number, and Phone are required');
      return false;
    }
    return true;
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    try {
      if (editDriver) {
        await driverAPI.updateDriver(editDriver.id, form);
      } else {
        await driverAPI.createDriver(form);
      }
      // Refresh list
      const driversData = await driverAPI.getAllDrivers();
      setDrivers(driversData);
      closeModal();
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
      await driverAPI.softDeleteDriver(id);
      setDrivers(drivers.filter((d) => d.id !== id));
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
                  key: 'licenseNumber',
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
                  header: 'Active',
                  renderCell: (value: string, row: any) => (
                    <span className={`status-badge ${row.isActive ? 'active' : 'inactive'}`}>
                      {value}
                    </span>
                  )
                },
                {
                  key: 'assignedVehicles',
                  header: 'Assigned Vehicles',
                  renderCell: (value: string) => {
                    if (!value) return <span>No vehicles assigned</span>;
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
                              checked={form.assigned_vehicle_ids.includes(v.id)}
                              onChange={() => handleVehicleSelect(v.id)} 
                            />
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                {error && <div className="error">{error}</div>}
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