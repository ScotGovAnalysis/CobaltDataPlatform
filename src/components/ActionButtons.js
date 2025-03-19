import React, { useState, useRef } from 'react';
import styles from '../styles/Design_Style.module.css';
import config from '../config.js';

const ActionButtons = ({ resourceId, resourceUrl, resourceFormat, onApiClick }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);
  const isGeoJSON = resourceFormat?.toLowerCase() === 'geojson';
  
  // Toggle dropdown
  const toggleDropdown = () => setIsOpen(!isOpen);
  
  // Handle download
  const handleDownload = (format) => {
    const url = format === 'native' 
      ? resourceUrl 
      : `${config.apiBaseUrl}/datastore/dump/${resourceId}?format=${format}`;
    window.location.href = url;
  };
  
  return (
    <div className={styles.actionButtons} ref={wrapperRef}>
      <div
        className={styles.buttonGroup}
        style={{
          display: 'flex',
          justifyContent: 'flex-end', // Always align content to the right
          width: '100%'
        }}
      >
        {!isGeoJSON ? (
          // Both buttons scenario
          <>
            <button 
              className={styles.apiButton} 
              onClick={onApiClick}
              style={{ marginRight: '8px' }}
            >
              API
            </button>
            
            <div className={styles.downloadWrapper}>
              <button
                className={`${styles.primaryButton} ${styles.hasDropdown}`}
                onClick={toggleDropdown}
              >
                <span className={styles.buttonText}>Download</span>
                <span className={styles.dropdownChevron}>▾</span>
              </button>
              
              {isOpen && (
                <div className={styles.dropdownMenu}>
                  <button onClick={() => handleDownload('csv')}>CSV</button>
                  <button onClick={() => handleDownload('json')}>JSON</button>
                  <button onClick={() => handleDownload('xml')}>XML</button>
                  <button onClick={() => handleDownload('tsv')}>TSV</button>
                </div>
              )}
            </div>
          </>
        ) : (
          // GeoJSON scenario (download button only)
          <div className={styles.downloadWrapper}>
            <button
              className={styles.primaryButton}
              onClick={() => handleDownload('native')}
            >
              <span className={styles.buttonText}>Download</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActionButtons;