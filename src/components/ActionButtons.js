import React from 'react';
import styles from '../styles/Design_Style.module.css';
import ApiButton from './ApiButton';
import DownloadButton from './DownloadButton';

const ActionButtons = ({ resourceId, resourceUrl, resourceFormat, onApiClick }) => {
  const isGeoJSON = resourceFormat?.toLowerCase() === 'geojson';

  return (
    <div className={styles.actionButtons}>
      <div className={styles.buttonGroup}>
        {!isGeoJSON ? (
          <ApiButton onClick={onApiClick} />
        ) : (
          <div className={styles.apiButtonPlaceholder} />
        )}
        <div style={{ flexGrow: 1 }} /> {/* Push download button to the right */}
        <DownloadButton
          resourceId={resourceId}
          resourceUrl={resourceUrl}
          resourceFormat={resourceFormat}
        />
      </div>
    </div>
  );
};

export default ActionButtons;
