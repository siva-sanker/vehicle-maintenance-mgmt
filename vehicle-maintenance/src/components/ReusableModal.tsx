import React, { useState, useEffect, ReactNode } from 'react';
import CancelButton from './CancelButton';
import ButtonWithGradient from './ButtonWithGradient';

interface ReusableModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  onSubmit: () => Promise<void> | void;
  submitButtonText: string;
  isSubmitting?: boolean;
  submittingText?: string;
  showCancelButton?: boolean;
  cancelButtonText?: string;
  maxWidth?: string;
  maxHeight?: string;
  width?: string;
}

const ReusableModal: React.FC<ReusableModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  onSubmit,
  submitButtonText,
  isSubmitting = false,
  submittingText = 'Saving...',
  showCancelButton = true,
  cancelButtonText = 'Cancel',
  maxWidth = '600px',
  maxHeight = '70vh',
  width = '90%'
}) => {
  const [isInternalSubmitting, setIsInternalSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (!isOpen) {
      setIsInternalSubmitting(false);
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (isSubmitting || isInternalSubmitting) return;
    
    setIsInternalSubmitting(true);
    try {
      await onSubmit();
    } catch (error) {
      console.error('Error in modal submission:', error);
    } finally {
      setIsInternalSubmitting(false);
    }
  };

  const handleClose = () => {
    if (!isSubmitting && !isInternalSubmitting) {
      onClose();
    }
  };

  if (!isOpen) return null;

  const isCurrentlySubmitting = isSubmitting || isInternalSubmitting;

  return (
    <div 
      className="modal-overlay" 
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 1000
      }}
      onClick={handleClose}
    >
      <div 
        className="modal" 
        style={{
          backgroundColor: 'white',
          padding: '20px',
          maxWidth: maxWidth,
          width: width,
          maxHeight: maxHeight,
          overflowY: 'auto',
          borderRadius: '8px',
          boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
        }} 
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header" style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          borderBottom: '1px solid #e0e0e0',
          paddingBottom: '10px'
        }}>
          <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '600' }}>{title}</h3>
          <button 
            className="modal-close" 
            onClick={handleClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '24px',
              cursor: 'pointer',
              padding: '0',
              width: '30px',
              height: '30px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%',
              transition: 'background-color 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f0f0f0';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            ×
          </button>
        </div>
        
        <div className="modal-body" style={{ marginBottom: '20px' }}>
          {children}
        </div>
        
        <div className="modal-footer border border-black" style={{
          display: 'none',
          justifyContent: 'flex-end',
          gap: '10px',
          borderTop: '1px solid #e0e0e0',
          paddingTop: '0px'
          }}>
          {/* {showCancelButton && (
            <CancelButton 
              onClick={handleClose} 
              text={cancelButtonText}
              disabled={isCurrentlySubmitting}
            />
          )}
          <ButtonWithGradient
            onClick={handleSubmit}
            disabled={isCurrentlySubmitting}
          >
            {isCurrentlySubmitting ? submittingText : submitButtonText}
          </ButtonWithGradient> */}
        </div>
      </div>
    </div>
  );
};

export default ReusableModal; 