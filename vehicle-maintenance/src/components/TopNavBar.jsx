import React from 'react';
import { NavLink } from 'react-router-dom';
import './TopNavBar.css'; // Create and customize this CSS file
import logo from '../assets/logo.png';

const TopNavBar = () => {
  return (
    <nav className="top-navbar">
        <div className="navItem">
          <img src={logo} alt="Logo" />
          {/* <h4 className="topNavBarTitle text-light">HODO Hospital</h4> */}
        </div>
      <ul className="nav-list">
        <div className="searchBar">
          <input type="search" name="search" placeholder="Search" />
        </div>
        <li className='button btn'><NavLink to="/dashboard" activeClassName="active">Dashboard</NavLink></li>
        <li className='button btn'><NavLink to="/register-vehicle" activeClassName="active">Vehicle Registration</NavLink></li>
        <a href="/vehicles" className="nav-link text-white" title="Vehicle List">
          <i className="fas fa-car fa-2x mt-1"></i>
        </a>
        <a href="/add" className="nav-link text-white" title="Add Vehicle">
          <i className="fas fa-plus-circle fa-2x mt-1"></i>
        </a>
        <a href="/settings" className="nav-link text-white" title="Settings">
          <i className="fas fa-cog fa-2x mt-1"></i>
        </a>
        {/* <li className='button btn'><NavLink to="/vehicle-list" activeClassName="active">Vehicle List</NavLink></li>
        <li className='button btn'><NavLink to="/insurance" activeClassName="active">Insurance Management</NavLink></li>
        <li className='button btn'><NavLink to="/documents" activeClassName="active">Document Repository</NavLink></li> */}
      </ul>
    </nav>
  );
};

export default TopNavBar;
