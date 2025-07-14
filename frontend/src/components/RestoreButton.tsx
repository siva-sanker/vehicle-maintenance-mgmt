import React from 'react';

export interface RestoreButtonProps {
  text?: string;
  children?: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  processing?: boolean;
  className?: string;
}

const RestoreButton: React.FC<RestoreButtonProps> = ({
  text,
  children,
  onClick,
  type,
  disabled = false,
  processing = false,
  className = ''
}) => {
  return (
    <button
      className={`text-black ${className}`}
      style={{
        // width: '110px',
        height: '36px',
        fontSize:'14px',
        border:'1px solid #80888B',  
        borderRadius:'4px',
        backgroundColor: '#ffffff',  
        whiteSpace: 'nowrap'
      }}
      onClick={onClick}
      type={type ?? 'button'}
      disabled={disabled || processing}
    >
      {processing ? 'Loading...' : text || children}
    </button>
  );
};

export default RestoreButton;
