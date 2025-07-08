// Searchbar.tsx
import React from 'react';
import '../styles/searchbar.css';
import 'bootstrap/dist/css/bootstrap.min.css';

interface SearchbarProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder:string;
  type:string;
}

const Searchbar: React.FC<SearchbarProps> = ({ value, onChange,type,placeholder }) => {
  return (
    <div className="searchbar-container" style={{ maxWidth: '100%'}}>
      <input
        type={type}
        className="form-control search"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
      <i className="fa-solid fa-magnifying-glass search-icon"></i>
    </div>

  );
};

export default Searchbar;
