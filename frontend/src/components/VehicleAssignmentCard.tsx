import React from 'react';
import ButtonWithGradient from './ButtonWithGradient';
import CancelButton from './CancelButton';

interface VehicleAssignmentCardProps {
    vehicle: {
        id: string;
        make: string;
        model: string;
        registration_number: string;
        status: string;
    };
    isAssigned?: boolean;
    onAssign?: () => void;
    onUnassign?: () => void;
    disabled?: boolean;
}

const VehicleAssignmentCard: React.FC<VehicleAssignmentCardProps> = ({
    vehicle,
    isAssigned = false,
    onAssign,
    onUnassign,
    disabled = false
}) => {
    return (
        <div className="card mb-3">
            <div className="card-body">
                <div className="row align-items-center">
                    <div className="col-md-6">
                        <h6 className="card-title text-capitalize">
                            {vehicle.make} {vehicle.model}
                        </h6>
                        <p className="card-text mb-0">
                            <small className="text-muted">
                                Registration: {vehicle.registration_number}
                            </small>
                        </p>
                        <p className="card-text mb-0">
                            <small className="text-muted">
                                Status: <span className={`badge ${vehicle.status === 'active' ? 'bg-success' : 'bg-warning'}`}>
                                    {vehicle.status}
                                </span>
                            </small>
                        </p>
                    </div>
                    <div className="col-md-6 text-end">
                        {isAssigned ? (
                            <CancelButton 
                                text="Unassign" 
                                onClick={onUnassign}
                                disabled={disabled}
                            />
                        ) : (
                            <ButtonWithGradient 
                                text="Assign" 
                                onClick={onAssign}
                                disabled={disabled}
                            />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default VehicleAssignmentCard;
