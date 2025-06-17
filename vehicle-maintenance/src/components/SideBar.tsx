import React from 'react';
import { NavLink } from 'react-router-dom';
import '../styles/Sidebar.css';
// import { GraphIcon } from '@primer/octicons-react'
// import { PlusCircleIcon } from '@primer/octicons-react'
// import { ListUnorderedIcon } from '@primer/octicons-react'
// import { ReportIcon } from '@primer/octicons-react'
// import { ShieldCheckIcon } from '@primer/octicons-react'
// import { FileDirectoryIcon } from '@primer/octicons-react'
// import { LocationIcon } from '@primer/octicons-react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCaretRight } from '@fortawesome/free-solid-svg-icons';

interface SideBarProps {
  collapsed?: boolean;
}

const SideBar: React.FC<SideBarProps> = ({ collapsed = false }) => {
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
              <span>
                <FontAwesomeIcon icon={faCaretRight} />
              </span>
              {!collapsed && "Dashboard"}
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/register-vehicle"
              className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
              title={collapsed ? "Vehicle Registration" : ""}
            >
              <span>
                <FontAwesomeIcon icon={faCaretRight} />
              </span>
              {!collapsed && "Vehicle Registration"}
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/vehicle-list"
              className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
              title={collapsed ? "Vehicle List" : ""}
            >
              <span>
                <FontAwesomeIcon icon={faCaretRight} />
              </span>
              {!collapsed && "Vehicle List"}
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/insurance"
              className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
              title={collapsed ? "Insurance Management" : ""}
            >
              <span>
                <FontAwesomeIcon icon={faCaretRight} />
              </span>
              {!collapsed && "Insurance Management"}
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/documents"
              className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
              title={collapsed ? "Document Repository" : ""}
            >
              <span>
                <FontAwesomeIcon icon={faCaretRight} />
              </span>
              {!collapsed && "Document Repository"}
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/claims"
              className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
              title={collapsed ? "Claims" : ""}
            >
              <span>
                <FontAwesomeIcon icon={faCaretRight} />
              </span>
              {!collapsed && "Claims"}
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/location"
              className={({ isActive }) => isActive ? 'nav-item active' : 'nav-item'}
              title={collapsed ? "Vehicle Location" : ""}
            >
              <span>
                <FontAwesomeIcon icon={faCaretRight} />
              </span>
              {!collapsed && "Vehicle Location"}
            </NavLink>
          </li>
        </ul>
      </nav>
    </div>
  );
};

export default SideBar; 