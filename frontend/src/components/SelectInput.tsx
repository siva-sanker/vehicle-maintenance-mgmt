import React from 'react';

interface Option {
  label: string;
  value: string | number;
  disabled?: boolean;
}

interface SelectInputProps {
  label?: string;
  name: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: Option[];
  placeholder?: string;
  required?: boolean;
  error?: string;
  className?: string;
  disabled?: boolean;
}

const SelectInput: React.FC<SelectInputProps> = ({
  label,
  name,
  value,
  onChange,
  options,
  required = false,
  error = '',
  className = '',
  disabled = false
}) => {
  return (
    <div className="mb-3">
      {label && <label htmlFor={name} className="form-label" style={{fontSize:'14px'}}>{label}</label>}
      <select
        id={name}
        name={name}
        className={`form-select ${error ? 'is-invalid' : ''} ${className}`}
        value={value}
        onChange={onChange}
        required={required}
        disabled={disabled}
      >
        {/* <option value="">{placeholder}</option> */}
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} disabled={opt.disabled}>
            {opt.label}
          </option>
        ))}
      </select>
      {error && <div className="invalid-feedback">{error}</div>}
    </div>
  );
};

export default SelectInput;
