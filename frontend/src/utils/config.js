/**
 * @description Mainframe Communication Configuration
 * Hardened for environment-aware routing. 
 */
const rawUrl = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

// Sanitize URL: Remove trailing slash if present to prevent route collision
export const API_URL = rawUrl.endsWith('/') ? rawUrl.slice(0, -1) : rawUrl;

// Functional Metadata
export const SITE_NAME = "Computer Science Society // GCU Lahore";
export const VERSION = "2.1.0-IRONCLAD";