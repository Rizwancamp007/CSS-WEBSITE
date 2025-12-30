import React, { useState, useEffect } from "react";
import { NavLink, useLocation, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";

/**
 * @description The Command Strip (Navbar)
 * Integrated with Environment-aware Master Admin checks and centralized Auth.
 */
export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isLoggedIn = !!user;
  
  // LIVE FIX: Syncing Master Admin check with Environment Variables
  const MASTER_EMAIL = import.meta.env.VITE_MASTER_ADMIN_EMAIL || "css@gmail.com";
  const isMasterAdmin = user?.email?.toLowerCase() === MASTER_EMAIL.toLowerCase();

  const handleLogout = () => {
    logout();
    toast.success("Uplink Terminated. Logged out.", {
      icon: '🛡️',
      style: { borderRadius: '10px', background: '#333', color: '#fff' }
    });
    navigate("/");
  };

  useEffect(() => { setMobileOpen(false); }, [location]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navItems = [
    { title: "Home", link: "/" },
    { title: "Events", link: "/events" },
    { title: "Team", link: "/team" },
    { title: "Announcements", link: "/announcements" },
    { title: "Contact", link: "/contact" },
    { title: "About", link: "/about" },
  ];

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.6, ease: "circOut" }}
      className={`fixed top-0 left-0 w-full z-[100] transition-all duration-500 ${
        scrolled || mobileOpen
          ? "bg-[#020617]/90 backdrop-blur-xl border-b border-slate-800 shadow-2xl py-3"
          : "bg-transparent border-b border-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
        
        {/* LOGO SECTOR */}
        <Link to="/" className="flex items-center gap-4 group relative z-50">
          <div className="relative">
            <div className="absolute inset-0 bg-blue-500 blur-lg opacity-20 group-hover:opacity-60 transition-opacity duration-500" />
            <motion.div 
              whileHover={{ scale: 1.05 }}
              className="relative w-10 h-10 sm:w-12 sm:h-12 rounded-full overflow-hidden border-2 border-white/10 shadow-2xl transition-all duration-300"
            >
              <img
                src="/logo.jpg"
                alt="CS Society Logo"
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                onError={(e) => { e.target.src = "https://placehold.co/100x100/020617/FFD700?text=CSS"; }}
              />
            </motion.div>
          </div>
          <div className="flex flex-col leading-tight">
            <span className="text-white font-black text-lg tracking-tighter uppercase group-hover:text-[#FFD700] transition-colors">
              CS Society
            </span>
            <span className="text-[#FFD700] text-[9px] font-black tracking-[0.3em] uppercase opacity-80">
              GCU Lahore
            </span>
          </div>
        </Link>

        {/* DESKTOP NAV */}
        <div className="hidden md:flex items-center gap-1 bg-slate-950/40 border border-slate-800 p-1.5 rounded-full backdrop-blur-md">
          {navItems.map((item) => (
            <NavLink
              key={item.link}
              to={item.link}
              className={({ isActive }) =>
                `relative px-5 py-2 text-[11px] font-black uppercase tracking-widest transition-colors duration-300 rounded-full ${
                  isActive ? "text-white" : "text-slate-500 hover:text-white"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <span className="relative z-10">{item.title}</span>
                  {isActive && (
                    <motion.div
                      layoutId="navbar-active"
                      className="absolute inset-0 rounded-full bg-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.4)]"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </div>

        {/* ACTION COMMANDS */}
        <div className="flex items-center gap-4 relative z-50">
          {isLoggedIn ? (
            <div className="hidden md:flex items-center gap-3">
                <Link
                   to="/admin-dashboard"
                   className="px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] bg-slate-900 border border-slate-800 text-[#FFD700] hover:border-[#FFD700]/40 transition-all"
                 >
                   Dashboard
                 </Link>
                
                {isMasterAdmin && (
                  <Link to="/admin/messages" className="p-2.5 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500 hover:text-white transition-all" title="Inquiry Inbox">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </Link>
                )}

                <button
                 onClick={handleLogout}
                 className="p-2.5 rounded-xl bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500 hover:text-white transition-all"
                 title="Terminate Uplink"
               >
                 <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                 </svg>
               </button>
            </div>
          ) : (
            <Link
              to="/admin"
              className="hidden md:block px-8 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] bg-gradient-to-r from-[#FFD700] via-[#FDB931] to-[#FFA500] text-black shadow-2xl"
            >
              Admin Portal
            </Link>
          )}

          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 text-[#FFD700] hover:bg-slate-800 rounded-lg transition-colors"
          >
            <div className="w-6 h-5 flex flex-col justify-between overflow-hidden">
              <motion.span animate={mobileOpen ? { rotate: 45, y: 9 } : { rotate: 0, y: 0 }} className="w-full h-1 bg-current rounded-full origin-left" />
              <motion.span animate={mobileOpen ? { opacity: 0, x: 20 } : { opacity: 1, x: 0 }} className="w-full h-1 bg-current rounded-full" />
              <motion.span animate={mobileOpen ? { rotate: -45, y: -9 } : { rotate: 0, y: 0 }} className="w-full h-1 bg-current rounded-full origin-left" />
            </div>
          </button>
        </div>
      </div>

      {/* MOBILE HUD */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-[#020617] border-b border-slate-800 relative z-[99]"
          >
            <div className="px-8 py-12 space-y-3">
              {navItems.map((item) => (
                <NavLink
                  key={item.link}
                  to={item.link}
                  className={({ isActive }) =>
                    `block text-sm font-black uppercase tracking-[0.3em] py-4 px-6 rounded-2xl transition-all ${
                      isActive ? "bg-blue-600/10 text-blue-400 border border-blue-500/20 shadow-lg" : "text-slate-500"
                    }`
                  }
                >
                  {item.title}
                </NavLink>
              ))}
              <div className="h-px bg-slate-800 my-6 opacity-50" />
              {isLoggedIn ? (
                <div className="flex flex-col gap-4">
                  <Link to="/admin-dashboard" className="py-4 rounded-2xl bg-slate-900 border border-slate-800 text-[#FFD700] font-black uppercase tracking-widest text-[10px] text-center">Dashboard</Link>
                  <button onClick={handleLogout} className="py-4 rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20 font-black uppercase tracking-widest text-[10px] text-center">Terminate Uplink</button>
                </div>
              ) : (
                <Link to="/admin" className="block w-full text-center py-5 rounded-2xl bg-gradient-to-r from-[#FFD700] via-[#FDB931] to-[#FFA500] text-black font-black uppercase tracking-[0.2em] text-[10px]">Access Admin Portal</Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  );
}