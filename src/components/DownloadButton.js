import React, { useState, useRef, useEffect } from 'react';
import '@scottish-government/design-system/dist/css/design-system.min.css';
import config from '../config.js';
import styles from '../styles/Design_Style.module.css';

const DownloadButton = ({ resourceId, resourceUrl, resourceFormat }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);
  const isGeoJSON = resourceFormat?.toLowerCase() === 'geojson';

  // Toggle dropdown
  const toggleDropdown = () => setIsOpen(!isOpen);

  // Handle download
  const handleDownload = (format) => {
    const url = format === 'native' ? resourceUrl : `${config.apiBaseUrl}/datastore/dump/${resourceId}?format=${format}`;
    window.location.href = url;
    setIsOpen(false);
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [wrapperRef]);

  return (
    <div className={styles.downloadWrapper} ref={wrapperRef}>
      <button
        className={`ds_button ${!isGeoJSON ? styles.hasDropdown : ''}`}
        onClick={toggleDropdown}
      >
        Download{!isGeoJSON && ' ▾'}
      </button>
      {isOpen && !isGeoJSON && (
        <div className={styles.dropdownMenu}>
          <button onClick={() => handleDownload('csv')}>CSV</button>
          <button onClick={() => handleDownload('json')}>JSON</button>
          <button onClick={() => handleDownload('xml')}>XML</button>
          <button onClick={() => handleDownload('tsv')}>TSV</button>
        </div>
      )}
    </div>
  );
};

export default DownloadButton;
