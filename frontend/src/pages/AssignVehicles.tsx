import React, { useState, useEffect } from "react";
import PageContainer from "../components/PageContainer";
import SelectInput from "../components/SelectInput";
import ButtonWithGradient from "../components/ButtonWithGradient";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import SuccessMessage from "../components/SuccessMessage";
import { driverAPI, vehicleAPI, Vehicle } from "../services/api";

interface Driver {
    id: string;
    name: string;
    phone: string;
    address: string;
    license_number: string;
    status: string;
    assignedVehicleIds: string[];
}

type DriverOption = { value: string; label: string; disabled?: boolean };

const AssignVehicles: React.FC = () => {
    const [drivers, setDrivers] = useState<DriverOption[]>([]);
    const [selectedDriverId, setSelectedDriverId] = useState<string>("");
    const [vehicles, setVehicles] = useState<Vehicle[]>([]);
    const [selectedVehicleIds, setSelectedVehicleIds] = useState<string[]>([]);
    const [assignedVehicleIds, setAssignedVehicleIds] = useState<string[]>([]);
    const [loading, setLoading] = useState({
        drivers: true,
        vehicles: false,
        assigning: false
    });
    const [error, setError] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    // Load drivers and vehicles on component mount
    useEffect(() => {
        loadDrivers();
        loadVehicles();
    }, []);

    // Load assigned vehicles when driver changes
    useEffect(() => {
        if (selectedDriverId) {
            loadDriverAssignedVehicles(selectedDriverId);
        } else {
            setAssignedVehicleIds([]);
            setSelectedVehicleIds([]);
        }
    }, [selectedDriverId]);

    const loadDrivers = async () => {
        try {
            setLoading(prev => ({ ...prev, drivers: true }));
            setError(null);
            
            const driversData = await driverAPI.getAllDrivers();
            
            const driverOptions: DriverOption[] = [
                { value: '', label: 'Select Driver', disabled: true },
                ...driversData.map((driver: Driver) => ({
                    value: driver.id,
                    label: driver.name
                }))
            ];
            
            setDrivers(driverOptions);
        } catch (err) {
            console.error('Error fetching drivers:', err);
            setError('Failed to load drivers. Please try again.');
            setDrivers([{ value: '', label: 'Error loading drivers', disabled: true }]);
        } finally {
            setLoading(prev => ({ ...prev, drivers: false }));
        }
    };

    const loadVehicles = async () => {
        try {
            setLoading(prev => ({ ...prev, vehicles: true }));
            const vehiclesData = await vehicleAPI.getAllVehicles();
            setVehicles(vehiclesData);
        } catch (err) {
            console.error('Error fetching vehicles:', err);
            setError('Failed to load vehicles. Please try again.');
        } finally {
            setLoading(prev => ({ ...prev, vehicles: false }));
        }
    };

    const loadDriverAssignedVehicles = async (driverId: string) => {
        try {
            const assignedVehiclesData = await driverAPI.getDriverAssignedVehicles(driverId);
            // Extract vehicle IDs from the assigned vehicles data
            const vehicleIds = assignedVehiclesData.map((vehicle: any) => 
                vehicle.v_id_pk?.toString() || vehicle.id
            );
            setAssignedVehicleIds(vehicleIds);
        } catch (err) {
            console.error('Error fetching assigned vehicles:', err);
            setAssignedVehicleIds([]);
        }
    };

    const handleDriverChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const driverId = e.target.value;
        setSelectedDriverId(driverId);
    };

    const handleVehicleCheckboxChange = (vehicleId: string, isChecked: boolean) => {
        if (isChecked) {
            setSelectedVehicleIds(prev => [...prev, vehicleId]);
        } else {
            setSelectedVehicleIds(prev => prev.filter(id => id !== vehicleId));
        }
    };

    const handleAssignVehicles = async () => {
        if (!selectedDriverId || selectedVehicleIds.length === 0) {
            setError('Please select a driver and at least one vehicle.');
            return;
        }

        try {
            setLoading(prev => ({ ...prev, assigning: true }));
            setError(null);

            // Use bulk assignment API
            await driverAPI.assignMultipleVehiclesToDriver(selectedDriverId, selectedVehicleIds);

            const vehicleCount = selectedVehicleIds.length;
            setSuccessMessage(
                `Successfully assigned ${vehicleCount} vehicle${vehicleCount > 1 ? 's' : ''} to driver.`
            );

            // Clear selected vehicles and reload assigned vehicles
            setSelectedVehicleIds([]);
            await loadDriverAssignedVehicles(selectedDriverId);

        } catch (err) {
            console.error('Error assigning vehicles:', err);
            setError('Failed to assign vehicles. Please try again.');
        } finally {
            setLoading(prev => ({ ...prev, assigning: false }));
        }
    };

    const isVehicleAssigned = (vehicleId: string) => {
        return assignedVehicleIds.includes(vehicleId);
    };

    const isVehicleSelected = (vehicleId: string) => {
        return selectedVehicleIds.includes(vehicleId);
    };

    return (
        <PageContainer>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h1>Assign Vehicles to Drivers</h1>
            </div>

            {error && (
                <ErrorMessage 
                    message={error} 
                    onRetry={() => {
                        setError(null);
                        loadDrivers();
                        loadVehicles();
                        if (selectedDriverId) {
                            loadDriverAssignedVehicles(selectedDriverId);
                        }
                    }}
                    className="mb-4"
                />
            )}

            {successMessage && (
                <SuccessMessage
                    message={successMessage}
                    onDismiss={() => setSuccessMessage(null)}
                    className="mb-4"
                />
            )}

            <div className="row">
                {/* Left Side - Driver Selection */}
                <div className="col-md-4">
                    <div className="card h-100">
                        <div className="card-body">
                            <h5 className="card-title mb-3">Select Driver</h5>
                            
                            {loading.drivers ? (
                                <LoadingSpinner size="sm" text="Loading drivers..." />
                            ) : (
                                <SelectInput 
                                    label="Driver" 
                                    name="drivers" 
                                    value={selectedDriverId}
                                    onChange={handleDriverChange}
                                    options={drivers} 
                                    disabled={loading.drivers}
                                />
                            )}

                            {selectedDriverId && selectedVehicleIds.length > 0 && (
                                <div className="mt-4">
                                    <ButtonWithGradient
                                        text={`Assign ${selectedVehicleIds.length} Vehicle${selectedVehicleIds.length > 1 ? 's' : ''}`}
                                        onClick={handleAssignVehicles}
                                        disabled={loading.assigning}
                                        processing={loading.assigning}
                                        className="w-100"
                                    />
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right Side - Available Vehicles */}
                <div className="col-md-8">
                    <div className="card h-100">
                        <div className="card-body">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h5 className="card-title mb-0">Available Vehicles</h5>
                                {selectedVehicleIds.length > 0 && (
                                    <span className="status-badge text-white bg-primary">
                                        {selectedVehicleIds.length} selected
                                    </span>
                                )}
                            </div>

                            {!selectedDriverId ? (
                                <div className="text-center p-4">
                                    <p className="text-muted">Please select a driver to view and assign vehicles.</p>
                                </div>
                            ) : loading.vehicles ? (
                                <LoadingSpinner text="Loading vehicles..." />
                            ) : (
                                <div className="vehicle-list" style={{maxHeight: '500px', overflowY: 'auto'}}>
                                    {vehicles.length === 0 ? (
                                        <div className="text-center p-4">
                                            <p className="text-muted">No vehicles found.</p>
                                        </div>
                                    ) : (
                                        <div className="list-group list-group-flush">
                                            {vehicles.map((vehicle) => {
                                                const isAssigned = isVehicleAssigned(vehicle.id);
                                                const isSelected = isVehicleSelected(vehicle.id);
                                                
                                                return (
                                                    <div 
                                                        key={vehicle.id} 
                                                        className={`list-group-item list-group-item-action ${
                                                            isAssigned ? 'list-group-item-secondary' : ''
                                                        } ${isSelected ? 'bg-light border-primary' : ''}`}
                                                    >
                                                        <div className="d-flex align-items-center">
                                                            <div className="form-check me-3">
                                                                <input
                                                                    className="form-check-input"
                                                                    type="checkbox"
                                                                    id={`vehicle-${vehicle.id}`}
                                                                    checked={isSelected}
                                                                    disabled={isAssigned || loading.assigning}
                                                                    onChange={(e) => handleVehicleCheckboxChange(vehicle.id, e.target.checked)}
                                                                />
                                                            </div>
                                                            <div className="flex-grow-1">
                                                                <div className="d-flex justify-content-between align-items-start">
                                                                    <div>
                                                                        <h6 className="mb-1 text-capitalize">
                                                                            {vehicle.make} {vehicle.model}
                                                                        </h6>
                                                                        <p className="mb-1 text-muted small">
                                                                            <strong>Registration:</strong> {vehicle.registration_number}
                                                                        </p>
                                                                        <span className={`status-badge text-white ${
                                                                            vehicle.status === 'active' ? 'bg-success' : 'bg-warning'
                                                                        }`}>
                                                                            {vehicle.status}
                                                                        </span>
                                                                        {isAssigned && (
                                                                            <span className="badge bg-secondary ms-2">
                                                                                Already Assigned
                                                                            </span>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </PageContainer>
    );
};

export default AssignVehicles;
