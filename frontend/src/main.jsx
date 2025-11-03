import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import axios from 'axios';
import './theme.css';
import './index.css';
import App from './App.jsx';
import {registerSW} from "virtual:pwa-register";

// Set axios defaults to always send credentials (cookies)
axios.defaults.withCredentials = true;

registerSW();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
