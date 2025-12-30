import React from "react";
import ReactDOM from "react-dom/client";
import { HelmetProvider } from 'react-helmet-async';
import { AuthProvider } from "./context/AuthContext";
import App from "./App";

// Style Cascade: Variables first, then Global, then Components
import "./styles/variable.css";
import "./styles/global.css";
import "./index.css"; 
import "./App.css";

/**
 * @section Mainframe Initialization
 * Establishes the core provider architecture.
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