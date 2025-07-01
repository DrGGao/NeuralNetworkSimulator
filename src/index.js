import React from 'react';
import ReactDOM from 'react-dom/client';
import ReactGA from 'react-ga4';
import './index.css';
import App from './App';

// 初始化 Google Analytics
ReactGA.initialize('G-XHWS16J90W');

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
); 