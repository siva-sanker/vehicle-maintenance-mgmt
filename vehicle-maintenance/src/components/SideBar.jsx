import React from 'react';
import { NavLink } from 'react-router-dom';
import './SideBar.css';
import { GraphIcon } from '@primer/octicons-react'
import { PlusCircleIcon } from '@primer/octicons-react'
import { ListUnorderedIcon } from '@primer/octicons-react'
import { ReportIcon } from '@primer/octicons-react'
import { ShieldCheckIcon } from '@primer/octicons-react'
import { FileDirectoryIcon } from '@primer/octicons-react'
import { LocationIcon } from '@primer/octicons-react'


const SideBar = ({ collapsed = false }) => {
  return (
    <div className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <nav>
        <ul>
          {!collapsed && <li className="sidebar-title">Vehicle Maintenance</li>}
          <li>
            <NavLink
              to="/dashboard"
              className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
              title={collapsed ? "Dashboard" : ""}
            >
              <GraphIcon size={22} />
              {!collapsed && "Dashboard"}
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/register-vehicle"
              className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
              title={collapsed ? "Vehicle Registration" : ""}
            >
              <PlusCircleIcon size={22} />
              {!collapsed && "Vehicle Registration"}
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/vehicle-list"
              className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
              title={collapsed ? "Vehicle List" : ""}
            >
              <ListUnorderedIcon size={22} />
              {!collapsed && "Vehicle List"}
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/insurance"
              className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
              title={collapsed ? "Insurance Management" : ""}
            >
              <FileDirectoryIcon size={22} />
              {!collapsed && "Insurance Management"}
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/documents"
              className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
              title={collapsed ? "Document Repository" : ""}
            >
              <ShieldCheckIcon size={22} />
              {!collapsed && "Document Repository"}
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/claims"
              className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
              title={collapsed ? "Claims" : ""}
            >
              <ReportIcon size={22} />
              {!collapsed && "Claims"}
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/location"
              className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
              title={collapsed ? "Vehicle Location" : ""}
            >
              <LocationIcon size={22} />
              {!collapsed && "Vehicle Location"}
            </NavLink>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default SideBar;
