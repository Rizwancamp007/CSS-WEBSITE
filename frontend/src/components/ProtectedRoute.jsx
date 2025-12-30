import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * @description The Sentinel Gatekeeper
 * This high-level component intercepts unauthorized access attempts.
 * Hardened to support both general authentication and specific role clearance.
 */
const ProtectedRoute = ({ children, requiredPermission = null }) => {
  const { user, loading, hasPermission } = useAuth();
  const location = useLocation();

  /**
   * @section Handshake Phase
   * While the AuthContext is decrypting the JWT and verifying the node,
   * we display the institutional pulse loader.
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
   * If no identity node is found in the current state, redirect to the login gateway.
   * We preserve the 'from' location to allow 'Session Recovery' after login.
   */
  if (!user) {
    return <Navigate to="/admin" state={{ from: location }} replace />;
  }

  /**
   * @section Authorization Shield (Clearance Check)
   * If a specific permission is required for this route, we verify it here.
   * If the check fails, the user is redirected to the standard dashboard.
   */
  if (requiredPermission && !hasPermission(requiredPermission)) {
    return <Navigate to="/admin-dashboard" replace />;
  }

  // Authorization Successful: Grant access to the requested sector
  return children;
};

export default ProtectedRoute;