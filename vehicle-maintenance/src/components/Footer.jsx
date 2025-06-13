import React from 'react';
import './Footer.css';

const Footer = () => {
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        console.log(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  return (
    <div className='footer-container'>
      <div className="footer-left">
        <span> © 2025 </span>
        <a href="#">www.hodo.com</a>
        <span>Empowering Entrepreneurs in Healthcare </span>
        <a href="#">Short Cuts</a>
      </div>
      <div className="footer-right">
        <button onClick={toggleFullscreen} className="fullscreen-btn">
          ⛶
        </button>
      </div>
    </div>
  );
};

export default Footer;