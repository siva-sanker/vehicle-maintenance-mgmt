import React from 'react';

interface TextAreaInputProps {
  label?: string;
  name: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  className?: string;
  value?: string;
  onChange?: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onBlur?: (e: React.FocusEvent<HTMLTextAreaElement>) => void;
}

const TextAreaInput: React.FC<TextAreaInputProps> = ({
  label,
  name,
  placeholder = '',
  required = false,
  error = '',
  className = '',
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
      <textarea
        id={name}
        name={name}
        placeholder={placeholder}
        required={required}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        rows={2}
        className={`form-control ${error ? 'is-invalid' : ''} ${className}`}
        style={{height:'60px'}}
      />
      {error && <div className="invalid-feedback">{error}</div>}
    </div>
  );
};

export default TextAreaInput;
