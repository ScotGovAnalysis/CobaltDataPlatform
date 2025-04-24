import React from 'react';
import '@scottish-government/design-system/dist/css/design-system.min.css';

const ApiButton = ({ onClick }) => {
  return (
<button
  className="ds_button ds_button--secondary"
  style={{ marginBottom: 0 }}
  onClick={onClick}
  type="button"
>      API
    </button>
  );
};

export default ApiButton;