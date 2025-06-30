import React, { useEffect, useState } from 'react';
import { driverAPI, vehicleAPI, Driver, Vehicle } from '../services/api';
import Header from '../components/Header';
import Footer from '../components/Footer';
import PageContainer from '../components/PageContainer';
import SectionHeading from '../components/SectionHeading';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
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
    isActive: true,
    assignedVehicleIds: [],
  });
  const [error, setError] = useState('');

  // Search state
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Pagination state
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [driversPerPage] = useState<number>(10); // Number of drivers to show per page

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
    driver.licenseNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    driver.phone.includes(searchTerm)
  );

  // Pagination logic
  const indexOfLastDriver = currentPage * driversPerPage;
  const indexOfFirstDriver = indexOfLastDriver - driversPerPage;
  const currentDrivers = filteredDrivers.slice(indexOfFirstDriver, indexOfLastDriver);
  const totalPages = Math.ceil(filteredDrivers.length / driversPerPage);

  // Change page
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  // Reset to first page when search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm]);

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
        isActive: driver.isActive,
        assignedVehicleIds: driver.assignedVehicleIds,
      });
    } else {
      setEditDriver(null);
      setForm({ name: '', licenseNumber: '', phone: '', address: '', isActive: true, assignedVehicleIds: [] });
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
      {/* <Header sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} /> */}
      <Header sidebarCollapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} showDate showTime showCalculator />
      {/* <div className="driver-page"> */}
      <PageContainer>
        {/* <div className="driver-header">
          <div className="header-content">
            <h1 className="page-title">Drivers</h1>
            <p className="page-subtitle">Manage and view all your registered drivers</p>
          </div>
          <div className="header-actions">
            <button className="btn-primary" onClick={() => openModal()}>
              <Plus size={16} />
              Add Driver
            </button>
            <div className="search-wrapper">
              <i className="search-icon fa-solid fa-magnifying-glass"></i>
              <input
                type="search"
                name="search"
                id="search"
                placeholder='Search by name, license number, or phone...'
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>
          </div>
        </div> */}
        <SectionHeading title='Driver' subtitle="Driver's page"/>

        {loading ? (
          <div>Loading...</div>
        ) : error ? (
          <div style={{ color: 'red' }}>{error}</div>
        ) : drivers.length === 0 ? (
          <div className="empty-state">
            <h3>No drivers registered yet</h3>
            <p>Start by adding your first driver to the system</p>
            <button className="btn-primary" onClick={() => openModal()}>
              <Plus size={16} />
              Add Driver
            </button>
          </div>
        ) : (
          <div className="table-container">
            <table className="drivers-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>License Number</th>
                  <th>Phone</th>
                  <th>Address</th>
                  <th>Active</th>
                  <th>Assigned Vehicles</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {currentDrivers.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="no-data">
                      <div className="no-data-content">
                        <p>No drivers found matching your search criteria.</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentDrivers.map((driver, index) => (
                    <tr key={driver.id} className="table-row">
                      <td className="row-number">{indexOfFirstDriver + index + 1}</td>
                      <td className='text-capitalize'>{driver.name}</td>
                      <td className='text-uppercase'>{driver.licenseNumber}</td>
                      <td>{driver.phone}</td>
                      <td className='text-capitalize'>{driver.address}</td>
                      <td>
                        <span className={`status-badge ${driver.isActive ? 'active' : 'inactive'}`}>
                          {driver.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        {driver.assignedVehicleIds.map((vid) => {
                          const v = vehicles.find((veh) => veh.id === vid);
                          return v ? (
                            <span key={vid} className="driver-vehicle-badge text-uppercase">
                              {v.registrationNumber}
                            </span>
                          ) : null;
                        })}
                      </td>
                      <td>
                        <button className="btn-details" onClick={() => openModal(driver)}>
                          Edit
                        </button>
                        <button className="btn-details" style={{ marginLeft: 8 }} onClick={() => handleDelete(driver.id)}>
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Controls */}
        {filteredDrivers.length > driversPerPage && (
          <div className="pagination-container-list">
            <div className="pagination-info">
              Showing {indexOfFirstDriver + 1} to {Math.min(indexOfLastDriver, filteredDrivers.length)} of {filteredDrivers.length} drivers
              {searchTerm && ` (filtered from ${drivers.length} total)`}
            </div>
            <div className="pagination-controls">
              <button
                className="pagination-btn"
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
              >
                <ChevronLeft size={16} />
                Previous
              </button>

              <div className="page-numbers">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(number => (
                  <button
                    key={number}
                    className={`page-number ${currentPage === number ? 'active' : ''}`}
                    onClick={() => paginate(number)}
                  >
                    {number}
                  </button>
                ))}
              </div>

              <button
                className="pagination-btn"
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Modal for add/edit */}
        {showModal && (
          <div className="modal-overlay">
            <div className="modal">
              <h2>{editDriver ? 'Edit Driver' : 'Add Driver'}</h2>
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: 12 }}>
                  <label>Name*</label>
                  <input name="name" value={form.name} onChange={handleChange} required />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label>License Number*</label>
                  <input name="licenseNumber" value={form.licenseNumber} onChange={handleChange} required />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label>Phone*</label>
                  <input name="phone" value={form.phone} onChange={handleChange} required />
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label>Address</label>
                  <textarea name="address" value={form.address} onChange={handleChange} />
                </div>
                <div style={{ marginBottom: 12 }} className='driver-checkbox'>
                  <label>
                    Active Driver
                    <input
                      type="checkbox"
                      name="isActive"
                      checked={form.isActive}
                      onChange={handleChange}
                    />
                  </label>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label>Assign Vehicles</label>
                  <div className="vehicle-list">
                    {vehicles.map((v) => (
                      <div key={v.id} className='driver-checkbox'>
                        <label className='text-capitalize'>
                          {v.make} {v.model} <span className='text-uppercase'>({v.registrationNumber})</span>
                          <input
                            type="checkbox"
                            checked={form.assignedVehicleIds.includes(v.id)}
                            onChange={() => handleVehicleSelect(v.id)} 
                          />
                        </label>
                      </div>
                    ))}
                  </div>
                </div>
                {error && <div className="error">{error}</div>}
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
                  <button type="button" onClick={closeModal}>Cancel</button>
                  <button type="submit">{editDriver ? 'Update' : 'Add'}</button>
                </div>
              </form>
            </div>
          </div>
        )}
      {/* </div> */}
      </PageContainer>
      <Footer/>
    </>
  );
};

export default DriverPage;