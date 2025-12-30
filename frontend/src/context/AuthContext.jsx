import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
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
        // Defensive check: Access res.data.data per hardened backend structure
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
   * Hardened to sync with VITE_MASTER_ADMIN_EMAIL.
   */
  const hasPermission = useCallback((permissionKey) => {
    if (!user) return false;

    // LEVEL 0 BYPASS
    const MASTER = (import.meta.env.VITE_MASTER_ADMIN_EMAIL || "css@gmail.com").toLowerCase().trim();
    const currentEmail = (user.email || user.gmail || "").toLowerCase().trim();
    
    if (currentEmail === MASTER) return true; 

    // Granular RBAC Check: Ensure permissions object exists
    const permissions = user.permissions || {};
    return permissions[permissionKey] === true;
  }, [user]);

  // Performance Optimization: Memoize the context value
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