import React from 'react';

interface InputTextProps {
  label?: string;
  type?: string;
  name: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  className?: string; // extra Bootstrap classes
  disabled?: boolean;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
}

const InputText: React.FC<InputTextProps> = ({
  label,
  type = 'text',
  name,
  placeholder = '',
  required = false,
  error = '',
  className = '',
  disabled = false,
  value = '',
  onChange,
  onBlur,
}) => {
  return (
    <div className="mb-2">
      {label && (
        <label htmlFor={name} className="form-label">
          {label}
        </label>
      )}
      <input
        type={type}
        className={`form-control ${error ? 'is-invalid' : ''} ${className}`}
        id={name}
        name={name}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
      />
      {error && <div className="invalid-feedback">{error}</div>}
    </div>
  );
};

export default InputText;
