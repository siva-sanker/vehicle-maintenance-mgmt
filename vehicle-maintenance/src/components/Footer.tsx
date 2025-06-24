import React, { useState, useRef, useEffect } from 'react';
import '../styles/Footer.css';

const Footer: React.FC = () => {
  const [showShortcuts, setShowShortcuts] = useState(false);
  const shortcutsRef = useRef<HTMLDivElement>(null);

  const toggleFullscreen = (): void => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch((err: Error) => {
        console.log(`Error attempting to enable fullscreen: ${err.message}`);
      });
    } else {
      document.exitFullscreen();
    }
  };

  // Close popup on outside click or Esc
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (shortcutsRef.current && !shortcutsRef.current.contains(event.target as Node)) {
        setShowShortcuts(false);
      }
    };
    const handleEsc = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setShowShortcuts(false);
      }
    };
    if (showShortcuts) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEsc);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, [showShortcuts]);

  return (
    <div className='footer-container'>
      <div className="footer-left">
        <span> © 2025 </span>
        <a href="https://hodo.io/">www.hodo.io</a>
        <span>Empowering Entrepreneurs in Healthcare </span>
        <a href="#" onClick={e => { e.preventDefault(); setShowShortcuts(v => !v); }}>Short Cuts</a>
      </div>
      <div className="footer-right">
        <button onClick={toggleFullscreen} className="fullscreen-btn">
          <i className="fa-solid fa-expand"></i>
        </button>
      </div>
      {showShortcuts && (
        <div className="shortcuts-modal-overlay">
          <div className="shortcuts-modal" ref={shortcutsRef}>
            <h4>Keyboard Shortcuts</h4>
            <ul>
              <li><b>Ctrl + S</b>: Save</li>
              <li><b>Ctrl + F</b>: Find</li>
              <li><b>Ctrl + P</b>: Print</li>
              <li><b>Esc</b>: Close this popup</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default Footer; 