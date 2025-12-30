/**
 * @description Mainframe Communication Configuration
 * Hardened for environment-aware routing. 
 * Preferences VITE_API_URL for production deployment.
 */
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

// Functional Metadata
export const SITE_NAME = "Computer Science Society // GCU Lahore";
export const VERSION = "2.1.0-IRONCLAD";