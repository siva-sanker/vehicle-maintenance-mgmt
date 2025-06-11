import React from 'react';
import { NavLink } from 'react-router-dom';
import './SideBar.css'; // You will style this as needed
import {TriangleRightIcon} from '@primer/octicons-react'


const SideBar = () => {
  let selectedIndex=0;
  return (
    <div className="sidebar">
      <nav>
        <ul>
          <li className="sidebar-title">Vehicle Maintenance</li>
          <li><NavLink to="/dashboard" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}> <TriangleRightIcon size={24} />Dashboard</NavLink></li>
          <li><NavLink to="/register-vehicle" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}> <TriangleRightIcon size={24} />Vehicle Registration</NavLink></li>
          <li><NavLink to="/vehicle-list" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}> <TriangleRightIcon size={24} />Vehicle List</NavLink></li>
          <li><NavLink to="/insurance" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}> <TriangleRightIcon size={24} />Insurance Management</NavLink></li>
          <li><NavLink to="/documents" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}> <TriangleRightIcon size={24} />Document Repository</NavLink></li>
          <li><NavLink to="/claims" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}> <TriangleRightIcon size={24} />Claims</NavLink></li>
        </ul>
      </nav>
    </div>
  );
};

export default SideBar;
