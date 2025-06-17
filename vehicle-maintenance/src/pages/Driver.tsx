import React, { useEffect, useState } from 'react';
import { driverAPI, vehicleAPI, Driver, Vehicle } from '../services/api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import '../styles/Driver.css';

interface DriverProps {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

const DriverPage: React.FC<DriverProps> = ({ sidebarCollapsed, toggleSidebar }) => {
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editDriver, setEditDriver] = useState<Driver | null>(null);
  const [form, setForm] = useState<Omit<Driver, 'id'>>({
    name: '',
    licenseNumber: '',
    phone: '',
    address: '',
    assignedVehicleIds: [],
  });
  const [error, setError] = useState('');

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

  // Handle form input
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Handle vehicle assignment
  const handleVehicleSelect = (vehicleId: string) => {
    setForm((prev) => {
      const assigned = prev.assignedVehicleIds.includes(vehicleId)
        ? prev.assignedVehicleIds.filter((id) => id !== vehicleId)
        : [...prev.assignedVehicleIds, vehicleId];
      return { ...prev, assignedVehicleIds: assigned };
    });
  };

  // Open modal for add/edit
  const openModal = (driver?: Driver) => {
    if (driver) {
      setEditDriver(driver);
      setForm({
        name: driver.name,
        licenseNumber: driver.licenseNumber,
        phone: driver.phone,
        address: driver.address,
        assignedVehicleIds: driver.assignedVehicleIds,
      });
    } else {
      setEditDriver(null);
      setForm({ name: '', licenseNumber: '', phone: '', address: '', assignedVehicleIds: [] });
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
    if (!form.name.trim() || !form.licenseNumber.trim() || !form.phone.trim()) {
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

  // Delete driver
  const handleDelete = async (id: string) => {
    if (!window.confirm('Delete this driver?')) return;
    try {
      await driverAPI.deleteDriver(id);
      setDrivers(drivers.filter((d) => d.id !== id));
    } catch {
      alert('Failed to delete driver');
    }
  };

  return (
    <>
      <Header sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
      <div className="driver-page">
        <div className="driver-header">
            <h1>Drivers</h1>
            <button className="btn-primary" onClick={() => openModal()}>Add Driver</button>
        </div>
        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div style={{ color: 'red' }}>{error}</div>
        ) : (
          <table className="drivers-table" style={{ width: '100%', marginTop: 24, borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th>Name</th>
                <th>License Number</th>
                <th>Phone</th>
                <th>Address</th>
                <th>Assigned Vehicles</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {drivers.map((driver) => (
                <tr key={driver.id}>
                  <td>{driver.name}</td>
                  <td>{driver.licenseNumber}</td>
                  <td>{driver.phone}</td>
                  <td>{driver.address}</td>
                  <td>
                    {driver.assignedVehicleIds.map((vid) => {
                      const v = vehicles.find((veh) => veh.id === vid);
                      return v ? (
                        <span key={vid} style={{ display: 'inline-block', marginRight: 8, background: '#eee', padding: '2px 6px', borderRadius: 4 }}>
                          {v.make} {v.model} ({v.registrationNumber})
                        </span>
                      ) : null;
                    })}
                  </td>
                  <td>
                    <button onClick={() => openModal(driver)}>Edit</button>
                    <button style={{ marginLeft: 8 }} onClick={() => handleDelete(driver.id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {/* Modal for add/edit */}
        {showModal && (
          <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <div className="modal" style={{ background: '#fff', padding: 24, borderRadius: 8, minWidth: 350, maxWidth: 400 }}>
              <h2>{editDriver ? 'Edit Driver' : 'Add Driver'}</h2>
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 12 }}>
                  <label>Name*</label>
                  <input name="name" value={form.name} onChange={handleChange} required style={{ width: '100%' }} />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label>License Number*</label>
                  <input name="licenseNumber" value={form.licenseNumber} onChange={handleChange} required style={{ width: '100%' }} />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label>Phone*</label>
                  <input name="phone" value={form.phone} onChange={handleChange} required style={{ width: '100%' }} />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label>Address</label>
                  <textarea name="address" value={form.address} onChange={handleChange} style={{ width: '100%' }} />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label>Assign Vehicles</label>
                  <div style={{ maxHeight: 120, overflowY: 'auto', border: '1px solid #eee', borderRadius: 4, padding: 4 }}>
                        {vehicles.map((v) => (
                        <div key={v.id} className='driver-checkbox'>
                            <label>
                                {v.make} {v.model} ({v.registrationNumber})
                            <input
                                type="checkbox"
                                checked={form.assignedVehicleIds.includes(v.id)}
                                onChange={() => handleVehicleSelect(v.id)} 
                            />{' '}
                            </label>
                        </div>
                        ))}
                  </div>
                </div>
                {error && <div style={{ color: 'red', marginBottom: 8 }}>{error}</div>}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                  <button type="button" onClick={closeModal}>Cancel</button>
                  <button type="submit">{editDriver ? 'Update' : 'Add'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
      <Footer/>
    </>
  );
};

export default DriverPage;