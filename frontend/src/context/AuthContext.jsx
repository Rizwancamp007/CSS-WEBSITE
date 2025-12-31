import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { adminLogin as loginApi, getAdminProfile } from "../api";

const AuthContext = createContext();

/**
 * @description The Identity Hub (AuthContext)
 * Hardened for dual-collection verification and resilient session persistence.
 */
export const AuthProvider = ({ children }) => {
  // PERSISTENCE FIX: Initialize user from localStorage to prevent "null" flicker on refresh
  // This ensures ProtectedRoute sees the user immediately before the API call finishes.
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    try {
      // Hardened: Ensures corrupted localStorage doesn't crash the boot sequence
      return (savedUser && savedUser !== "undefined" && savedUser !== "null") 
        ? JSON.parse(savedUser) 
        : null;
    } catch (err) {
      console.error("AUTH_INIT_ERROR: Corrupt session data node purged.");
      localStorage.removeItem("user");
      return null;
    }
  });
  
  const [loading, setLoading] = useState(true);

  /**
   * @section Terminate Session
   */
  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }, []);

  /**
   * @section Session Restoration
   * Verifies the local JWT against the backend authority on boot.
   */
  useEffect(() => {
    const verifySession = async () => {
      const token = localStorage.getItem("token");
      
      // LIVE FIX: Handling malformed or 'null' string tokens
      if (!token || token === "null" || token === "undefined") {
        setLoading(false);
        return;
      }

      try {
        const res = await getAdminProfile();
        
        // SYNCED: Matches the 'res.data.data' structure from adminController.js
        if (res.data && res.data.success && res.data.data) {
          const freshUser = res.data.data;
          setUser(freshUser);
          
          // Update local storage with fresh telemetry (synced permissions/names)
          localStorage.setItem("user", JSON.stringify(freshUser));
        } else {
          // If response success is false or data missing, decommissioning session
          logout();
        }
      } catch (err) {
        // RESILIENCY: Only logout if the error is 401/403 (Token Invalid/Expired)
        // This prevents logging out on 500 errors or temporary network drops.
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          console.error("AUTH_VERIFY_FAILURE: Session invalid or expired.");
          logout();
        } else {
          console.warn("SERVER_LAG: Retaining local session state until uplink recovers.");
        }
      } finally {
        // Settling time ensures state is fully painted before hiding loader
        setTimeout(() => setLoading(false), 150);
      }
    };

    verifySession();
  }, [logout]);

  /**
   * @section Mainframe Login
   */
  const login = async (email, password) => {
    try {
      const res = await loginApi({ 
        email: email.toLowerCase().trim(), 
        password 
      });

      if (res.data && res.data.success) {
        // NOTE: login response returns user at root to match loginApi original spec
        const { token, user: userData } = res.data;
        
        // PERSISTENCE: Save both Token and User object for refresh stability
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userData));
        
        setUser(userData); 
        return { success: true };
      }
      return { 
        success: false, 
        message: res.data.message || "Handshake refused by authority." 
      };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || "Uplink Failed: Server Unreachable." 
      };
    }
  };

  /**
   * @helper Permission Guard (The Warden)
   * Hardened to handle both 'email' (Admin) and 'gmail' (Board Member) fields.
   */
  const hasPermission = useCallback((permissionKey) => {
    if (!user) return false;

    // LEVEL 0 BYPASS (Master Admin)
    const MASTER = (import.meta.env.VITE_MASTER_ADMIN_EMAIL || "css@gmail.com").toLowerCase().trim();
    
    // NORMALIZATION BRIDGE: Consolidates identity field variants
    const currentEmail = (user.email || user.gmail || "").toLowerCase().trim();
    
    if (currentEmail === MASTER) return true; 

    // Granular RBAC Check: Validates specific clearance keys
    const permissions = user.permissions || {};
    return permissions[permissionKey] === true;
  }, [user]);

  // Performance Optimization: Memoize the context value to prevent unnecessary re-renders
  const authValue = useMemo(() => ({
    user,
    login,
    logout,
    hasPermission,
    loading
  }), [user, logout, hasPermission, loading]);

  return (
    <AuthContext.Provider value={authValue}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider node.");
  }
  return context;
};