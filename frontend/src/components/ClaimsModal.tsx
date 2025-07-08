import React from 'react';
import { FileText } from 'lucide-react';
import { Vehicle } from '../services/api';
import CancelButton from './CancelButton';

interface Claim {
  claimDate: string;
  claimAmount: string;
  reason: string;
  status: string;
}

interface ClaimsModalProps {
  isOpen: boolean;
  onClose: () => void;
  vehicle: Vehicle | null;
  claims: Claim[];
  loading: boolean;
  error: string;
}

const ClaimsModal: React.FC<ClaimsModalProps> = ({
  isOpen,
  onClose,
  vehicle,
  claims,
  loading,
  error
}) => {
  if (!isOpen || !vehicle) return null;

  return (
    <div className="modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onClick={onClose}>
      <div className="modal" style={{
        backgroundColor: 'white',
        padding: '20px',
        maxWidth: '500px',
        width: '90%',
        overflowY: 'auto'
      }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Claims History - {vehicle?.make} {vehicle?.model}</h3>
          <button className="modal-close" onClick={onClose}>×</button>
        </div>
        <div className="modal-body">
          {loading ? (
            <div className="loading">Loading claims...</div>
          ) : error ? (
            <div className="error">{error}</div>
          ) : claims.length === 0 ? (
            <div className="empty-state">
              <FileText size={48} className="empty-icon" />
              <h4>No claims found</h4>
              <p>This vehicle has no claims history.</p>
            </div>
          ) : (
            <div className="claims-list">
              {claims.map((claim, index) => (
                <div key={index} className="claim-item">
                  <div className="claim-header">
                    <h4>Claim #{index + 1}</h4>
                    <span className={`claim-status ${claim.status.toLowerCase()}`}>
                      {claim.status}
                    </span>
                  </div>
                  <div className="claim-details">
                    <div className="claim-info">
                      <span className="info-label">Date:</span>
                      <span className="info-value">{claim.claimDate}</span>
                    </div>
                    <div className="claim-info">
                      <span className="info-label">Amount:</span>
                      <span className="info-value">₹{claim.claimAmount}</span>
                    </div>
                    <div className="claim-info">
                      <span className="info-label">Reason:</span>
                      <span className="info-value">{claim.reason}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="modal-footer">
          <CancelButton onClick={onClose} text='Close'/>
        </div>
      </div>
    </div>
  );
};

export default ClaimsModal; 