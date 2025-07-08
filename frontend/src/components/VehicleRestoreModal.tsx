import React, { useEffect, useState } from 'react';
import { vehicleAPI, Vehicle } from '../services/api';
import ButtonWithGradient from './ButtonWithGradient';
import CancelButton from './CancelButton';
import Table from './Table';

interface VehicleRestoreModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVehicleRestored: () => void;
}

const VehicleRestoreModal: React.FC<VehicleRestoreModalProps> = ({ 
  isOpen, 
  onClose, 
  onVehicleRestored 
}) => {
  const [deletedVehicles, setDeletedVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadDeletedVehicles();
    }
  }, [isOpen]);

  const loadDeletedVehicles = async () => {
    setLoading(true);
    try {
      const allVehicles = await vehicleAPI.getAllVehiclesIncludingDeleted();
      const deleted = allVehicles.filter(vehicle => vehicle.deletedAt);
      setDeletedVehicles(deleted);
    } catch (error) {
      console.error('Failed to load deleted vehicles:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (vehicleId: string) => {
    if (!window.confirm('Are you sure you want to restore this vehicle?')) return;
    
    try {
      await vehicleAPI.restoreVehicle(vehicleId);
      setDeletedVehicles(prev => prev.filter(v => v.id !== vehicleId));
      onVehicleRestored();
      alert('Vehicle restored successfully');
    } catch (error) {
      alert('Failed to restore vehicle');
    }
  };

  const tableData = deletedVehicles.map((vehicle, index) => ({
    ...vehicle,
    globalIndex: index + 1,
    deletedDate: new Date(vehicle.deletedAt!).toLocaleDateString(),
    fuelType: (
      <span className={`fuel-badge ${vehicle.fuelType.toLowerCase()}`}>
        {vehicle.fuelType}
      </span>
    ),
    purchasePrice: `₹${vehicle.purchasePrice}`,
    actions: vehicle.id
  }));

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: '900px', maxHeight: '80vh' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <h2>Restore Deleted Vehicles</h2>
          <div>
            <CancelButton onClick={onClose} text="Close" />
          </div>
        </div>
        
        {loading ? (
          <div>Loading deleted vehicles...</div>
        ) : deletedVehicles.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <h3>No deleted vehicles found</h3>
            <p>All vehicles are currently active</p>
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
                  key: 'make',
                  header: 'Make',
                  renderCell: (value: string) => (
                    <span className='text-capitalize'>{value}</span>
                  )
                },
                {
                  key: 'model',
                  header: 'Model',
                  renderCell: (value: string) => (
                    <span className='text-capitalize'>{value}</span>
                  )
                },
                {
                  key: 'registrationNumber',
                  header: 'Registration',
                  renderCell: (value: string) => (
                    <span className='text-uppercase'>{value}</span>
                  )
                },
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

export default VehicleRestoreModal; 