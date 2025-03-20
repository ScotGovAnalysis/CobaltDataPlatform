import React from 'react';
import PropTypes from 'prop-types';
import styles from '../../styles/Embedded_Modal.module.css';
import ReactJson from 'react-json-view';

const JSONViewerModal = ({ isOpen, onClose, data }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <div className={styles.modalHeader}>
          <div className={styles.titleContainer}>
            <span className={styles.viewerTitle}>JSON Viewer</span>
          </div>
          <button
            className={styles.closeButton}
            onClick={onClose}
            aria-label="Close modal"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              <path d="M5 5L15 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className={styles.modalBodyJson} style={{ padding: 0 }}>
          <ReactJson
            src={data}
            theme="monokai"
            collapsed={1}
            displayDataTypes={false}
            displayObjectSize={false}
            style={{
              backgroundColor: 'black',
              padding: '10px',
              fontFamily: 'monospace',
            }}
          />
        </div>
      </div>
    </div>
  );
};

JSONViewerModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  data: PropTypes.object.isRequired,
};

export default JSONViewerModal;