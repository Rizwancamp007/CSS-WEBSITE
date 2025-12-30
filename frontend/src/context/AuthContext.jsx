import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { adminLogin as loginApi, getAdminProfile } from "../api";

const AuthContext = createContext();

/**
 * @description The Identity Hub (AuthContext)
 * Manages the global security state, session persistence, and RBAC clearance.
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  /**
   * @section Terminate Session
   * Wipes local credentials and resets the identity state.
   * Wrapped in useCallback to prevent unnecessary re-renders in the verify effect.
   */
  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }, []);

  /**
   * @section Session Restoration
   * On startup, verifies the local JWT against the backend authority.
   */
  useEffect(() => {
    const verifySession = async () => {
      const token = localStorage.getItem("token");
      
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await getAdminProfile();
        // Defensive check: Match the backend structure { success: true, data: user }
        if (res.data && res.data.success) {
          setUser(res.data.data);
        } else {
          logout();
        }
      } catch (err) {
        console.error("AUTH_VERIFY_FAILURE: Uplink severed.");
        logout();
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, [logout]);

  /**
   * @section Mainframe Login
   * Authenticates credentials and establishes the JWT uplink.
   */
  const login = async (email, password) => {
    try {
      const res = await loginApi({ 
        email: email.toLowerCase().trim(), 
        password 
      });

      if (res.data && res.data.success) {
        localStorage.setItem("token", res.data.token);
        setUser(res.data.user);
        return { success: true };
      }
      return { success: false, message: "Handshake refused by authority." };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || "Uplink Failed: Server Unreachable." 
      };
    }
  };

  /**
   * @helper Permission Guard (The Warden)
   * Implements Level 0 (Master) bypass and granular RBAC checks.
   */
  const hasPermission = (permissionKey) => {
    if (!user) return false;

    // LEVEL 0 BYPASS: Sync with VITE_MASTER_ADMIN_EMAIL from .env
    const MASTER = (import.meta.env.VITE_MASTER_ADMIN_EMAIL || "css@gmail.com").toLowerCase().trim();
    const currentEmail = (user.email || "").toLowerCase().trim();
    
    if (currentEmail === MASTER) return true; 

    // Granular RBAC Check
    return user.permissions?.[permissionKey] === true;
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, hasPermission, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

// Custom Hook for seamless identity access across the frontend
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider node.");
  }
  return context;
};