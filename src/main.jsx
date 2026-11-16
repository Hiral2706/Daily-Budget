import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// Register PWA service worker (injected by vite-plugin-pwa)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // vite-plugin-pwa handles registration automatically via registerType: 'autoUpdate'
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
