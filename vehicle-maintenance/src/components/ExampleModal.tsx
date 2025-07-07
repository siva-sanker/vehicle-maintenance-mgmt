import React from 'react';
import ReusableModal from './ReusableModal';

interface ExampleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
}

const ExampleModal: React.FC<ExampleModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel'
}) => {
  const handleConfirm = async () => {
    await onConfirm();
    onClose();
  };

  return (
    <ReusableModal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      onSubmit={handleConfirm}
      submitButtonText={confirmText}
      showCancelButton={true}
      cancelButtonText={cancelText}
      maxWidth="400px"
      width="90%"
    >
      <div style={{ textAlign: 'center', padding: '20px 0' }}>
        <p style={{ fontSize: '16px', lineHeight: '1.5', margin: 0 }}>
          {message}
        </p>
      </div>
    </ReusableModal>
  );
};

export default ExampleModal; 