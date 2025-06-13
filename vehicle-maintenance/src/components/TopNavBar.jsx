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
        <ul className="nav-list2">
          <li className='nav-link'><NavLink to="/vehicle-list" activeClassName="active">Vehicle List</NavLink></li>
          <li className='nav-link'><NavLink to="/insurance" activeClassName="active">Insurance Management</NavLink></li>
          <li className='nav-link'><NavLink to="/documents" activeClassName="active">Document Repository</NavLink></li>
        </ul>

      </div>
      <ul className="nav-list">
        <div className="searchBar">
          <input type="search" name="search" placeholder="Search Patient with Name or Card No. or Mobile No." />
        </div>
        <li className='nav-list-button'><NavLink to="/dashboard" activeClassName="active">Dashboard</NavLink></li>
        <li className='nav-list-button'><NavLink to="/register-vehicle" activeClassName="active">Add Vehicle</NavLink></li>
        <div className="nav-div-main">
          <div className="nav-div">
            <a href="/vehicle-list" className="nav-link text-white" title="Vehicle List">
              <i className="fas fa-car  mt-1"></i>
            </a>
          </div>
          <div className="nav-div">
            <a href="#" className="nav-link text-white" onClick={(e) => {
              e.preventDefault();
              alert('Notification feature coming soon!');
            }}>
              <i className="fas fa-bell  mt-1"></i>
            </a>
          </div>
          <div className="nav-div">
          <a href="#" className="nav-link text-white" onClick={(e) => {
              e.preventDefault();
              alert('Settings Disabled');
            }}>
              <i className="fas fa-cog  mt-1"></i>
            </a>
          </div>
        </div>
      </ul>
    </nav>
  );
};

export default TopNavBar;
