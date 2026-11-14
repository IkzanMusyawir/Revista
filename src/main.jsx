import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Apply dark class BEFORE first paint to avoid flash
if (localStorage.getItem('revista_theme') === 'dark') {
  document.documentElement.classList.add('dark');
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
