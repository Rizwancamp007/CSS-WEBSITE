import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * @description The Sentinel Gatekeeper
 * Synchronized with AuthProvider to prevent "null flicker" logout loops.
 */
const ProtectedRoute = ({ children, requiredPermission = null }) => {
  const { user, loading, hasPermission } = useAuth();
  const location = useLocation();

  /**
   * @section Handshake Phase
   * If AuthContext is still verifying the token, we show the terminal loader.
   * This prevents premature redirection while the uplink is being established.
   */
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#020617]">
        <div className="relative w-20 h-20 mb-4">
            <div className="absolute inset-0 border-4 border-blue-500/20 rounded-full"></div>
            <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
        </div>
        <div className="text-blue-500 animate-pulse font-mono text-[10px] uppercase tracking-[0.3em] font-black">
            Verifying Clearance...
        </div>
      </div>
    );
  }

  /**
   * @section Authentication Shield
   * If no user is found in state or localStorage, redirect to login.
   * We removed the "user.isActive" check here because the backend 
   * 'adminLogin' and 'getAdminProfile' already handle activation 
   * and approval gates before returning the user.
   */
  if (!user) {
    return <Navigate to="/admin" state={{ from: location }} replace />;
  }

  /**
   * @section Authorization Shield (RBAC Check)
   * Verifies if the authenticated node has the specific clearance for this sector.
   */
  if (requiredPermission && !hasPermission(requiredPermission)) {
    // Authenticated but unauthorized: redirect to the neutral Dashboard zone.
    return <Navigate to="/admin-dashboard" replace />;
  }

  // Clearance Confirmed: Establish sector uplink.
  return children;
};

export default ProtectedRoute;