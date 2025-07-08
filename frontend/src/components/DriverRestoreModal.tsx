import React, { useEffect, useState } from 'react';
import { driverAPI, Driver } from '../services/api';
import ButtonWithGradient from './ButtonWithGradient';
import CancelButton from './CancelButton';
import Table from './Table';

interface DriverRestoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDriverRestored: () => void;
}

const DriverRestoreModal: React.FC<DriverRestoreModalProps> = ({ 
  isOpen, 
  onClose, 
  onDriverRestored 
}) => {
  const [deletedDrivers, setDeletedDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadDeletedDrivers();
    }
  }, [isOpen]);

  const loadDeletedDrivers = async () => {
    setLoading(true);
    try {
      const allDrivers = await driverAPI.getAllDriversIncludingDeleted();
      const deleted = allDrivers.filter(driver => driver.deletedAt);
      setDeletedDrivers(deleted);
    } catch (error) {
      console.error('Failed to load deleted drivers:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (driverId: string) => {
    if (!window.confirm('Are you sure you want to restore this driver?')) return;
    
    try {
      await driverAPI.restoreDriver(driverId);
      setDeletedDrivers(prev => prev.filter(d => d.id !== driverId));
      onDriverRestored();
      alert('Driver restored successfully');
    } catch (error) {
      alert('Failed to restore driver');
    }
  };

  const tableData = deletedDrivers.map((driver, index) => ({
    ...driver,
    globalIndex: index + 1,
    deletedDate: new Date(driver.deletedAt!).toLocaleDateString(),
    actions: driver.id
  }));

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: '800px', maxHeight: '80vh' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>Restore Deleted Drivers</h2>
          <div>
            <CancelButton onClick={onClose} text="Close" />
          </div>
        </div>
        
        {loading ? (
          <div>Loading deleted drivers...</div>
        ) : deletedDrivers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <h3>No deleted drivers found</h3>
            {/* <p>All drivers are currently active</p> */}
            {/* <CancelButton onClick={onClose} text="Close" /> */}
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
                  key: 'deletedDate',
                  header: 'Deleted Date',
                },
                {
                  key: 'actions',
                  header: 'Actions',
                  renderCell: (value: string) => (
                    <div className='actions-div' style={{ display: 'flex', gap: '10px' }}>
                      <ButtonWithGradient 
                        onClick={() => handleRestore(value)}
                        text="Restore"
                        className="btn-success"
                      />
                    </div>
                  )
                }
              ]}
              data={tableData}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverRestoreModal; 