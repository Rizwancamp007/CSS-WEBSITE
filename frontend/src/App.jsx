import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from "framer-motion";
import { useAuth } from "./context/AuthContext";

// Layout Components
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";

// Public Terminal Pages
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

// Administrative Grid Pages
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

/**
 * @section AUTHENTICATION GUARD
 * High-clearance gatekeeper for the administrative grid.
 */
const ProtectedRoute = ({ children, requireSuperAdmin = false }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null; // Prevent flicker during session handshake

  if (!user) {
    return <Navigate to="/admin" state={{ from: location }} replace />;
  }

  // SuperAdmin Logic: Check against master identity
  const MASTER_EMAIL = import.meta.env.VITE_MASTER_ADMIN_EMAIL || "css@gmail.com";
  if (requireSuperAdmin && user.email?.toLowerCase() !== MASTER_EMAIL.toLowerCase()) {
    return <Navigate to="/admin-dashboard" replace />;
  }

  return children;
};

/**
 * @section THE BRIDGE (Routing Logic)
 */
function AppContent() {
  const location = useLocation();
  
  // Grid detection for UI suppression
  const isAdminPath = location.pathname.startsWith("/admin") || 
                     location.pathname === "/all-registrations";

  const isLoginPage = location.pathname === "/admin";

  return (
    <div className={`min-h-screen ${isAdminPath ? 'bg-[#020617]' : 'grid-bg'}`}>
      
      {/* Suppress standard UI during administrative operations */}
      {!isAdminPath && <Navbar />}
      
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          {/* --- PUBLIC FREQUENCIES --- */}
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<Events />} />
          <Route path="/team" element={<Team />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/announcements" element={<Announcements />} />
          <Route path="/register/:eventId?" element={<Register />} />
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

          {/* --- LEVEL 0 RESTRICTED ROUTES --- */}
          <Route path="/admin/messages" element={<ProtectedRoute requireSuperAdmin><AdminMessages /></ProtectedRoute>} />
          <Route path="/admin/logs" element={<ProtectedRoute requireSuperAdmin><AdminLogs /></ProtectedRoute>} />
          <Route path="/admin/memberships" element={<ProtectedRoute requireSuperAdmin><AdminMemberships /></ProtectedRoute>} />

          {/* --- 404 UNKNOWN SECTOR --- */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AnimatePresence>

      {!isAdminPath && <Footer />}
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
          duration: 4000,
          className: 'ironclad-toast',
          style: { 
            background: '#0f172a', 
            color: '#fff', 
            border: '1px solid rgba(255, 215, 0, 0.2)',
            textTransform: 'uppercase',
            fontSize: '9px',
            fontWeight: '900',
            letterSpacing: '0.15em',
            fontFamily: 'monospace',
            borderRadius: '12px'
          }
        }} 
      />
      <AppContent />
    </Router>
  );
}

export default App;