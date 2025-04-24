import React from 'react';
import styles from '../styles/Design_Style.module.css';

const ApiButton = ({ onClick }) => {
  return (
    <button className={styles.apiButton} onClick={onClick}>
      API
    </button>
  );
};

export default ApiButton;
