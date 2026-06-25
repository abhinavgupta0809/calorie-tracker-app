import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';
import analytics from './analytics.js';
import { getUserId } from './utils/userId.js';

// Tie PostHog's identity to the same anonymous id used for per-user data.
analytics.init();
analytics.identify(getUserId());

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
