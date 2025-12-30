import React from "react";
import ReactDOM from "react-dom/client";
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from "./context/AuthContext";
import App from "./App";
import "./index.css"; 
import "./App.css";
import "./styles/global.css";
import "./styles/variable.css";

/**
 * @section Mainframe Initialization
 * Wraps the application in the core provider layers.
 * 1. StrictMode: Identifies potential logic risks during development.
 * 2. HelmetProvider: Manages head metadata (titles/SEO) dynamically.
 * 3. AuthProvider: Maintains the Ironclad security session across all routes.
 */
ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <HelmetProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </HelmetProvider>
  </React.StrictMode>
);