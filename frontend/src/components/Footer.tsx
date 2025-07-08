import React, { useState, useRef, useEffect } from 'react';
import '../styles/Footer.css';

const generalShortcuts = [
  { keys: 'ALT + CTRL + L', description: 'Log out or login' },
  { keys: 'ALT + S', description: 'Search Patient (Clear and search if patient selected)' },
  { keys: 'ALT + R', description: 'Register patient' },
  { keys: 'ALT + H', description: 'Visit History (After patient selected)' },
  { keys: 'ALT + A', description: 'Assign Doctor/Lab Tests (After patient selected)' },
  { keys: 'ALT + F', description: 'Add Pending Lab Result' },
  { keys: 'ALT + J', description: 'Add Pending Radiology Result (After patient selected)' },
  { keys: 'ALT + U', description: 'Add Pending Procedure Result (After patient selected)' },
  { keys: 'ALT + Z', description: 'View Lab Entered Results' },
  { keys: 'ALT + Y', description: 'Home collection registration' },
];


const functionKeys = [
  { keys: 'F1', description: 'Search' },
  { keys: 'F2', description: 'Todays Bills' },
  { keys: 'F3', description: 'Todays Visits' },
  { keys: 'CTRL + F2', description: 'Collect Sample' },
  { keys: 'F4', description: 'Appointments' },
  { keys: 'F6', description: 'Drug Stocks' },
  { keys: 'ALT + F6', description: 'Brand Name wise Stock' },
  { keys: 'CTRL + F6', description: 'Stock transfer' },
  { keys: 'F7', description: 'Pharmacy Sale' },
  { keys: 'CTRL + F7', description: 'Pharmacy Sale Return' },
  { keys: 'F8', description: 'Register Patient' },
  { keys: 'F9', description: 'New Visit' },
];

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
    <>
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
            {generalShortcuts.map((shortcut,idx)=>(
              <ul>
              <li><b>{shortcut.keys}</b>{shortcut.description}</li>

            </ul>
            ))}
            <h4>Function Keys</h4>
            {functionKeys.map((shortcut,idx)=>(
              <ul>
              <li><b>{shortcut.keys}</b>{shortcut.description}</li>

            </ul>
            ))}
          </div>
        </div>
      )}
    </div>
    </>
  );
};

export default Footer; 