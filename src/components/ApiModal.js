import React from 'react';
import styles from '../styles/Api_Modal.module.css';

const ApiModal = ({ resourceId, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <div className={styles.titleContainer}>
            <span className={styles.apiTitle}>CKAN Data API</span>
            <span className={styles.apiVersion}>v1.0</span>
          </div>
          <button 
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close modal"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
              <path d="M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        <div className={styles.modalBody}>
          <iframe
            title="API Information"
            src={`https://cobaltadmin.sgdatacatalogue.net/api/1/util/snippet/api_info.html?resource_id=${resourceId}`}
            className={styles.apiFrame}
          />
        </div>
      </div>
    </div>
  );
};

export default ApiModal;