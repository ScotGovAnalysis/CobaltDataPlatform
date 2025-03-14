import React, { useState, useEffect, useRef } from 'react';
import styles from '../styles/Design_Style.module.css';

const ActionButtons = ({ resourceId, resourceUrl, resourceFormat, onApiClick }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleDownload = (format, bom = false) => {
    const url = format === 'native' 
      ? resourceUrl 
      : `https://cobaltadmin.sgdatacatalogue.net/datastore/dump/${resourceId}?format=${format}${bom ? '&bom=True' : ''}`;
    window.location.href = url;
  };

  return (
    <div className={styles.actionButtonsContainer} ref={dropdownRef}>
      <div className={styles.buttonGroup}>
        <div className={styles.downloadWrapper}>
          <button className={styles.primaryButton}>
            <span 
              className={styles.buttonText}
              onClick={() => handleDownload('native')} // Add click handler here
            >
              Download
            </span>
            <div 
              className={styles.dropdownToggleArea}
              onClick={(e) => {
                e.stopPropagation();
                setIsDropdownOpen(!isDropdownOpen);
              }}
            >
              <span className={styles.dropdownArrow}>▾</span>
            </div>
          </button>
          
          {isDropdownOpen && (
            <div className={styles.dropdownMenu}>
            <div className={styles.dropdownItem} onClick={() => handleDownload('json')}>
              JSON
            </div>
            <div className={styles.dropdownItem} onClick={() => handleDownload('tsv', true)}>
              TSV with BOM
            </div>
            <div className={styles.dropdownItem} onClick={() => handleDownload('xml')}>
              XML
            </div>
            <div className={styles.dropdownItem} onClick={() => handleDownload('csv', true)}>
              CSV with BOM
            </div>
            <div className={styles.dropdownItem} onClick={() => handleDownload('native')}>
              Native Format
            </div>
          </div>
          )}
        </div>

        <button className={styles.secondaryButton} onClick={onApiClick}>
          API
        </button>
      </div>
    </div>
  );
};
export default ActionButtons