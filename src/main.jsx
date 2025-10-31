import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './index.css'; // deja esta línea si existe index.css (en tu proyecto sí existe)

const rootEl = document.getElementById('root');
createRoot(rootEl).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

