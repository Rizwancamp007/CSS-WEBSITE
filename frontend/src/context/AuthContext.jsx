import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { adminLogin as loginApi, getAdminProfile } from "../api";

const AuthContext = createContext();

/**
 * @description The Identity Hub (AuthContext)
 * Hardened for dual-collection verification and resilient session persistence.
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
   * FIXED: Added precise error handling to prevent "Panic Logouts" during server lag.
   */
  useEffect(() => {
    const verifySession = async () => {
      const token = localStorage.getItem("token");
      
      if (!token || token === "null" || token === "undefined") {
        setLoading(false);
        return;
      }

      try {
        const res = await getAdminProfile();
        // SYNCED: Accessing res.data.data to match backend return structure
        if (res.data && res.data.success && res.data.data) {
          setUser(res.data.data);
        } else {
          logout();
        }
      } catch (err) {
        // Only logout if the error is 401/403 (Token Invalid)
        // Prevents logging out on 500 errors or network drops
        if (err.response && (err.response.status === 401 || err.response.status === 403)) {
          console.error("AUTH_VERIFY_FAILURE: Session invalid.");
          logout();
        }
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
        // SYNCED: Backend login returns user at root of data
        setUser(res.data.user); 
        return { success: true };
      }
      return { success: false, message: res.data.message || "Handshake refused." };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || "Uplink Failed." 
      };
    }
  };

  /**
   * @helper Permission Guard (The Warden)
   */
  const hasPermission = useCallback((permissionKey) => {
    if (!user) return false;

    // LEVEL 0 BYPASS (Master Admin)
    const MASTER = (import.meta.env.VITE_MASTER_ADMIN_EMAIL || "css@gmail.com").toLowerCase().trim();
    const currentEmail = (user.email || user.gmail || "").toLowerCase().trim();
    
    if (currentEmail === MASTER) return true; 

    // Granular RBAC Check
    const permissions = user.permissions || {};
    return permissions[permissionKey] === true;
  }, [user]);

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