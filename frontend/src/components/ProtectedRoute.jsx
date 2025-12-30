import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * @description The Sentinel Gatekeeper
 * Hardened to support general authentication, activation checks, and granular RBAC.
 */
const ProtectedRoute = ({ children, requiredPermission = null }) => {
  const { user, loading, hasPermission } = useAuth();
  const location = useLocation();

  /**
   * @section Handshake Phase
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
   * @section Authentication & Activation Shield
   * SECURITY UPDATE: Explicitly checks if the user is authenticated AND active.
   * If a user is deactivated in the DB, this prevents access even with a valid token.
   */
  if (!user || (user.isActive === false)) {
    return <Navigate to="/admin" state={{ from: location }} replace />;
  }

  /**
   * @section Authorization Shield (Clearance Check)
   */
  if (requiredPermission && !hasPermission(requiredPermission)) {
    // If authenticated but lacks specific power, redirect to the safe zone (Dashboard)
    return <Navigate to="/admin-dashboard" replace />;
  }

  // Identity Confirmed: Establish sector uplink
  return children;
};

export default ProtectedRoute;