/**
 * main.tsx
 * 
 * Entry point của ứng dụng
 * - Render App component vào DOM
 * - Import CSS nếu có
 */

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

