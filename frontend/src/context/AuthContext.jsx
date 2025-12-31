import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react";
import { adminLogin as loginApi, getAdminProfile } from "../api";

const AuthContext = createContext();

/**
 * AuthProvider: Central hub for Admins & Board Members
 * - Handles dual-collection verification (Admin / Membership)
 * - Maintains session persistence with tokenVersion checks
 * - Enforces RBAC & activation rules
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem("user");
    try {
      return (savedUser && savedUser !== "undefined" && savedUser !== "null") 
        ? JSON.parse(savedUser) 
        : null;
    } catch (err) {
      console.error("AUTH_INIT_ERROR: Corrupt session cleared.");
      localStorage.removeItem("user");
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  // ---------------------------
  // Terminate Session
  // ---------------------------
  const logout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
  }, []);

  // ---------------------------
  // Session Verification / Restoration
  // ---------------------------
  useEffect(() => {
    const verifySession = async () => {
      const token = localStorage.getItem("token");
      if (!token || token === "null" || token === "undefined") {
        setLoading(false);
        return;
      }

      try {
        const res = await getAdminProfile();

        if (res.data?.success && res.data.data) {
          const freshUser = res.data.data;

          // Check activation & approved flags for Membership nodes
          if (freshUser.role !== "Admin" && (!freshUser.approved || !freshUser.isActivated)) {
            console.warn("AUTH_VERIFY: Board member not activated or approved.");
            logout();
            return;
          }

          localStorage.setItem("user", JSON.stringify(freshUser));
          setUser(freshUser);
        } else {
          logout();
        }
      } catch (err) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          console.error("AUTH_VERIFY_FAILURE: Session invalid/expired.");
          logout();
        } else {
          console.warn("SERVER_LAG: Retaining local session until uplink recovers.");
        }
      } finally {
        setTimeout(() => setLoading(false), 150);
      }
    };

    verifySession();
  }, [logout]);

  // ---------------------------
  // Login
  // ---------------------------
  const login = async (email, password) => {
    try {
      const res = await loginApi({ 
        email: email.toLowerCase().trim(), 
        password 
      });

      if (res.data?.success) {
        const { token, user: userData } = res.data;

        // Ensure Membership node is approved & activated
        if (userData.role !== "Admin" && (!userData.approved || !userData.isActivated)) {
          return { success: false, message: "Account pending board approval or activation." };
        }

        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userData));
        setUser(userData);

        return { success: true };
      }

      return { success: false, message: res.data?.message || "Handshake refused by authority." };
    } catch (error) {
      return { success: false, message: error.response?.data?.message || "Uplink Failed: Server Unreachable." };
    }
  };

  // ---------------------------
  // Permission Guard (RBAC)
  // ---------------------------
  const hasPermission = useCallback((permissionKey) => {
    if (!user) return false;

    const MASTER = (import.meta.env.VITE_MASTER_ADMIN_EMAIL || "css@gmail.com").toLowerCase().trim();
    const currentEmail = (user.email || user.gmail || "").toLowerCase().trim();

    if (currentEmail === MASTER) return true; 

    const permissions = user.permissions || {};
    return permissions[permissionKey] === true;
  }, [user]);

  // ---------------------------
  // Memoized Context Value
  // ---------------------------
  const authValue = useMemo(() => ({
    user,
    login,
    logout,
    hasPermission,
    loading
  }), [user, login, logout, hasPermission, loading]);

  return (
    <AuthContext.Provider value={authValue}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider.");
  return context;
};
