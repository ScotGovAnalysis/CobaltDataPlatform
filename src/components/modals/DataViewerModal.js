import React from 'react';
import styles from '../../styles/Embedded_Modal.module.css';

const DataViewerModal = ({ isOpen, onClose, src }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent} style={{ padding: 0 }}>
        <div className={styles.modalHeader}>
          <div className={styles.titleContainer}>
            <span className={styles.viewerTitle}>Data Viewer</span>
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
        <div className={styles.modalBody} style={{ padding: 5 }}>
          <iframe
            title="Data Viewer"
            src={src}
            className={styles.viewerFrame}
            width="100%"
            height="100%"
            frameBorder="0"
          />
        </div>
      </div>
    </div>
  );
};

export default DataViewerModal;
