import React from 'react';
import { NavLink } from 'react-router-dom';
import './SideBar.css'; // You will style this as needed
import {GraphIcon, TriangleRightIcon} from '@primer/octicons-react'
import { PlusCircleIcon } from '@primer/octicons-react'
import { ListUnorderedIcon } from '@primer/octicons-react'
import { ReportIcon } from '@primer/octicons-react'
import { ShieldCheckIcon } from '@primer/octicons-react'
import { FileDirectoryIcon } from '@primer/octicons-react'


const SideBar = () => {
  let selectedIndex=0;
  return (
    <div className="sidebar">
      <nav>
        <ul>
          <li className="sidebar-title">Vehicle Maintenance</li>
          <li><NavLink to="/dashboard" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}> <GraphIcon size={22} />Dashboard</NavLink></li>
          <li><NavLink to="/register-vehicle" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}> <PlusCircleIcon size={22} />Vehicle Registration</NavLink></li>
          <li><NavLink to="/vehicle-list" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}> <ListUnorderedIcon size={22} />Vehicle List</NavLink></li>
          <li><NavLink to="/insurance" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}> <FileDirectoryIcon size={22} />Insurance Management</NavLink></li>
          <li><NavLink to="/documents" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}> <ShieldCheckIcon size={22} />Document Repository</NavLink></li>
          <li><NavLink to="/claims" className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}> <ReportIcon size={22} />Claims</NavLink></li>
        </ul>
      </nav>
    </div>
  );
};

export default SideBar;
