import React, { Children } from 'react';

interface InputTextProps {
  id?:string;
  label?: string;
  type?: string;
  name: string;
  step?:number;
  placeholder?: string;
  required?: boolean;
  error?: string;
  className?: string; 
  disabled?: boolean;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void;
}

const InputText: React.FC<InputTextProps> = ({
  id,
  label,
  type = 'text',
  name,
  step,
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
        <label htmlFor={name} className="form-label" style={{fontSize:'14px'}}>
          {label}
        </label>
      )}
      <input
        type={type}
        className={`form-control ${error ? 'is-invalid' : ''} ${className}`}
        id={id}
        name={name}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        step={step}
        // style={{width:'50%'}}
      />
      {error && <div className="invalid-feedback">{error}</div>}
    </div>
  );
};

export default InputText;
