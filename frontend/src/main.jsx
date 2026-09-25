import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Purge any stale tokens/users from older versions on browser load
if (typeof window !== 'undefined') {
  try {
    localStorage.removeItem('water_user');
    localStorage.removeItem('water_token');
    localStorage.removeItem('smartwater_user');
    localStorage.removeItem('smartwater_token');
    sessionStorage.clear();
  } catch (e) {
    // Ignore sandbox errors
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
