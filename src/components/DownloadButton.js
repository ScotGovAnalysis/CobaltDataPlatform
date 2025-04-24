import React, { useState, useRef } from 'react';
import styles from '../styles/Design_Style.module.css';
import config from '../config.js';

const DownloadButton = ({ resourceId, resourceUrl, resourceFormat }) => {
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
    <div className={styles.downloadWrapper} ref={wrapperRef}>
      <button
        className={`${styles.primaryButton} ${isGeoJSON ? '' : styles.hasDropdown}`}
        onClick={toggleDropdown}
      >
        <span className={styles.buttonText}>Download</span>
        {!isGeoJSON && <span className={styles.dropdownChevron}>▾</span>}
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
