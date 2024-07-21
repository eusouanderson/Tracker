import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.js'; // Adicione a extensão .js
import reportWebVitals from './reportWebVitals.js'; // Adicione a extensão .js

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals();
