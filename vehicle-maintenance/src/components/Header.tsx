import React, { useState, useEffect } from 'react';
import '../styles/Header.css';
import { ChevronLeftIcon, ChevronRightIcon } from '@primer/octicons-react';
import { Calendar, Clock, Calculator } from 'lucide-react';

interface HeaderProps {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ sidebarCollapsed, toggleSidebar }) => {
    const [currentTime, setCurrentTime] = useState<Date>(new Date());

    const currentDate = new Date().toLocaleDateString('en-US', {
        weekday: 'short',
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    });

    const formattedTime = currentTime.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });

    // Update time every second
    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);

        // Cleanup timer on component unmount
        return () => clearInterval(timer);
    }, []);

    return (
        <div className='header-container'>
            <button
                className="sidebar-toggle-btn"
                onClick={toggleSidebar}
                title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
                {sidebarCollapsed ? <ChevronRightIcon size={20} /> : <ChevronLeftIcon size={20} />}
            </button>
            <h1></h1>
            <div className="header-div ">
                <div className="icons-div">
                    <div className="icon-item">
                        <Calendar size={25} className='header-icon' />
                        <span className='header-span'>{currentDate}</span>
                    </div>
                    <div className="icon-item">
                        <Clock size={25} className='header-icon' />
                        <span className='header-span'>{formattedTime}</span>
                    </div>
                    <div className="icon-item">
                        <Calculator size={25} className='header-icon' />
                        {/* <span>Calculator</span> */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Header; 