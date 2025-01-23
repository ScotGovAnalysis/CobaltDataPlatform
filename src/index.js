import React from 'react';
import ReactDOM from 'react-dom/client';
import '@scottish-government/design-system/dist/css/design-system.min.css'; // Import the minified CSS
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);