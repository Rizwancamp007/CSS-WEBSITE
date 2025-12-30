import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from "framer-motion";
import { useAuth } from "./context/AuthContext";

// Layout Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Public Pages
import Home from "./pages/Home";
import Events from "./pages/Events";
import Team from "./pages/Team";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Announcements from "./pages/Announcements";
import Register from "./pages/Register";
import Membership from "./pages/Membership";
import ActivateAccount from "./pages/ActivateAccount"; 
import NotFound from "./pages/NotFound";

// Admin Pages
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminEvents from "./pages/AdminEvents";
import AdminMemberships from "./pages/AdminMemberships";
import AdminAnnouncements from "./pages/AdminAnnouncements";
import AdminMessages from "./pages/AdminMessages"; 
import Registrations from "./pages/Registrations";
import AdminTeam from "./pages/AdminTeam";
import AdminLogs from "./pages/AdminLogs";
import AdminProfile from "./pages/AdminProfile";

/**
 * @section SCROLL PROTOCOL
 */
function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}
export const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

/**
 * @section AUTHENTICATION GUARD
 * Hardened to use the AuthContext state for real-time security.
 */
const ProtectedRoute = ({ children, requireSuperAdmin = false }) => {
  const { user, loading, hasPermission } = useAuth();
  const location = useLocation();

  if (loading) return null; // Wait for session verification

  // 1. Check if authenticated
  if (!user) {
    return <Navigate to="/admin" state={{ from: location }} replace />;
  }

  // 2. Check for Master/SuperAdmin Clearance if required
  // Route check for sensitive logs and authority management
  if (requireSuperAdmin && user.email !== "css@gmail.com" && !user.isSuperAdmin) {
    return <Navigate to="/admin-dashboard" replace />;
  }

  return children;
};

/**
 * @section THE BRIDGE (Routing Logic)
 */
function AppContent() {
  const location = useLocation();
  
  // Detect if current path is part of the Administrative Grid
  const isAdminInternal = location.pathname.startsWith("/admin-dashboard") || 
                          location.pathname.startsWith("/admin/") || 
                          location.pathname === "/all-registrations";

  const isLoginPage = location.pathname === "/admin";

  return (
    <div className={`min-h-screen ${isAdminInternal ? 'admin-theme bg-[#020617]' : 'grid-bg'}`}>
      
      {/* Navbar/Footer hidden on Admin Dashboard for industrial focus */}
      {!isAdminInternal && !isLoginPage && <Navbar />}
      
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* --- PUBLIC FREQUENCIES --- */}
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<Events />} />
          <Route path="/team" element={<Team />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/announcements" element={<Announcements />} />
          <Route path="/register/:id" element={<Register />} />
          <Route path="/membership" element={<Membership />} />
          <Route path="/activate" element={<ActivateAccount />} />

          {/* --- ADMIN GATEWAY --- */}
          <Route path="/admin" element={<AdminLogin />} />

          {/* --- PROTECTED ADMINISTRATIVE GRID --- */}
          <Route path="/admin-dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/events" element={<ProtectedRoute><AdminEvents /></ProtectedRoute>} />
          <Route path="/admin/announcements" element={<ProtectedRoute><AdminAnnouncements /></ProtectedRoute>} />
          <Route path="/admin/team" element={<ProtectedRoute><AdminTeam /></ProtectedRoute>} />
          <Route path="/admin/profile" element={<ProtectedRoute><AdminProfile /></ProtectedRoute>} />
          <Route path="/all-registrations" element={<ProtectedRoute><Registrations /></ProtectedRoute>} />

          {/* --- LEVEL 0 (ROOT) RESTRICTED ROUTES --- */}
          <Route path="/admin/messages" element={<ProtectedRoute requireSuperAdmin={true}><AdminMessages /></ProtectedRoute>} />
          <Route path="/admin/logs" element={<ProtectedRoute requireSuperAdmin={true}><AdminLogs /></ProtectedRoute>} />
          <Route path="/admin/memberships" element={<ProtectedRoute requireSuperAdmin={true}><AdminMemberships /></ProtectedRoute>} />

          {/* --- 404 UNKNOWN SECTOR --- */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>

      {!isAdminInternal && !isLoginPage && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <ScrollToTop />
      <Toaster 
        position="top-center" 
        toastOptions={{
          duration: 3000,
          style: { 
            background: '#0f172a', 
            color: '#fff', 
            border: '1px solid rgba(0, 255, 255, 0.2)', // Cyber cyan border
            textTransform: 'uppercase',
            fontSize: '10px',
            fontWeight: '900',
            letterSpacing: '0.1em',
            fontFamily: 'monospace'
          }
        }} 
      />
      <AppContent />
    </Router>
  );
}

export default App;