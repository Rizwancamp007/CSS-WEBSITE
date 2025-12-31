import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * @description The Sentinel Gatekeeper
 * Hardened to prevent logout loops by synchronizing with AuthContext initialization.
 */
const ProtectedRoute = ({ children, requiredPermission = null }) => {
  const { user, loading, hasPermission } = useAuth();
  const location = useLocation();

  /**
   * @section Handshake Phase
   * Prevents premature redirection while the AuthContext is restoring 
   * the session from localStorage or verifying the JWT with the backend.
   */
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-[#020617]">
        <div className="relative w-20 h-20 mb-4">
            {/* Multi-layered orbital loader */}
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
   * If no user node is found after the loading phase, the operator 
   * is redirected to the login gateway.
   */
  if (!user) {
    return <Navigate to="/admin" state={{ from: location }} replace />;
  }

  /**
   * @section Authorization Shield (RBAC Check)
   * Validates granular permissions. The hasPermission helper handles 
   * Master Admin bypass and email/gmail normalization internally.
   */
  if (requiredPermission && !hasPermission(requiredPermission)) {
    // Authenticated operator lacks specific sector clearance.
    return <Navigate to="/admin-dashboard" replace />;
  }

  // Identity and Clearance Confirmed: Establishing sector uplink.
  return children;
};

export default ProtectedRoute;