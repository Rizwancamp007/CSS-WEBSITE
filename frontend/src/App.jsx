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
 * FIXED: Synchronized with specialized loading node to prevent "null flicker" logout loop.
 */
const ProtectedRoute = ({ children, requireSuperAdmin = false }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  /**
   * HANDSHAKE PHASE: 
   * If AuthContext is still verifying the token from localStorage, 
   * we show a full-screen terminal loader instead of null or redirecting.
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

  // REDIRECT: If no user object is found after loading, return to portal gateway
  if (!user) {
    return <Navigate to="/admin" state={{ from: location }} replace />;
  }

  // RBAC SHIELD: Level 0 (SuperAdmin) Clearance Check
  const MASTER_EMAIL = (import.meta.env.VITE_MASTER_ADMIN_EMAIL || "css@gmail.com").toLowerCase().trim();
  const currentEmail = (user.email || user.gmail || "").toLowerCase().trim(); // BRIDGE: Handle both field variants

  if (requireSuperAdmin && currentEmail !== MASTER_EMAIL) {
    return <Navigate to="/admin-dashboard" replace />;
  }

  return children;
};

/**
 * @section THE BRIDGE (Routing Logic)
 */
function AppContent() {
  const location = useLocation();
  
  // FIXED: Hardened detection for all Administrative frequencies
  const isAdminPath = location.pathname.startsWith("/admin") || 
                      location.pathname === "/all-registrations" ||
                      location.pathname === "/setup-board-password" ||
                      location.pathname.startsWith("/admin-dashboard"); 

  return (
    <div className={`min-h-screen ${isAdminPath ? 'bg-[#020617]' : 'grid-bg'}`}>
      
      {/* Navbar only shows on public student-facing pages */}
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

          {/* Handshake path synchronized with invitation tokens */}
          <Route path="/setup-board-password" element={<ActivateAccount />} />

          {/* --- ADMIN GATEWAY --- */}
          <Route path="/admin" element={<AdminLogin />} />

          {/* --- PROTECTED ADMINISTRATIVE GRID --- */}
          <Route path="/admin-dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/events" element={<ProtectedRoute><AdminEvents /></ProtectedRoute>} />
          <Route path="/admin/announcements" element={<ProtectedRoute><AdminAnnouncements /></ProtectedRoute>} />
          <Route path="/admin/team" element={<ProtectedRoute><AdminTeam /></ProtectedRoute>} />
          <Route path="/admin/profile" element={<ProtectedRoute><AdminProfile /></ProtectedRoute>} />
          <Route path="/all-registrations" element={<ProtectedRoute><Registrations /></ProtectedRoute>} />

          {/* --- LEVEL 0 RESTRICTED ROUTES (SuperAdmin Only) --- */}
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