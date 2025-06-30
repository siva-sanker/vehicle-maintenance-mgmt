import React from 'react';
import '../styles/style.css';

interface AddressInputProps {
  label?: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
  placeholder?: string;
  rows?: number;
  error?: string;
  className?: string;
  disabled?: boolean;
}

const AddressInput: React.FC<AddressInputProps> = ({
  label,
  name,
  value,
  onChange,
  onBlur,
  placeholder = 'Enter your address',
  rows = 2,
  error = '',
  className = '',
  disabled = false,
}) => {
  return (
    <div className="mb-2">
      {label && <label htmlFor={name} className="form-label">{label}</label>}
      <textarea
        id={name}
        name={name}
        className={`custom-textarea form-control ${error ? 'is-invalid' : ''} ${className}`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        rows={rows}
        disabled={disabled}
      />
      {error && <div className="invalid-feedback">{error}</div>}
    </div>
  );
};

export default AddressInput;