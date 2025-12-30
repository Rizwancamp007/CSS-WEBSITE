import React, { useState } from "react"; // Removed useEffect from imports
import { motion } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; 
import toast from "react-hot-toast";

/**
 * @description The Administrative Gateway
 * Hardened for secure identity verification with brute-force prevention UI.
 */
export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth(); // Removed 'user' to prevent the useEffect loop here
  const navigate = useNavigate();

  // IMPORTANT: We handle redirection inside handleSubmit success block 
  // to ensure state synchronization is complete.

  /**
   * @section Authentication Sequence
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !password) return toast.error("Credentials required for uplink.");

    setIsSubmitting(true);
    const authToast = toast.loading("Verifying Identity Node...");

    try {
      /**
       * HANDSHAKE:
       * AuthContext handles JWT persistence and role-based state.
       */
      const result = await login(email.toLowerCase().trim(), password);

      if (result.success) {
        toast.success("Identity Verified. Node Active.", { id: authToast });
        
        // Use replace: true to prevent back-button loops
        // Small delay ensures localStorage and Auth State are settled
        setTimeout(() => {
          navigate("/admin-dashboard", { replace: true });
        }, 100);
      } else {
        toast.error(result.message || "Unauthorized Access.", { id: authToast });
      }
    } catch (error) {
      toast.error("SECURITY ALERT: Bridge Offline.", { id: authToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white overflow-hidden relative flex items-center justify-center font-sans selection:bg-yellow-500/30">
      
      {/* --- GRID INFRASTRUCTURE --- */}
      <div className="fixed inset-0 z-0 w-full h-full bg-[linear-gradient(to_right,#FFD70008_1px,transparent_1px),linear-gradient(to_bottom,#FFD70008_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none opacity-50" />

      <div className="relative z-10 w-full max-w-lg px-6 flex flex-col items-center">
        
        {/* BRAND IDENTITY NODE */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-10"
        >
          <div className="inline-block relative p-1 rounded-2xl bg-slate-900 border border-slate-800 shadow-[0_0_30px_rgba(0,0,0,0.5)] mb-6 group">
            <div className="absolute inset-0 bg-yellow-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <img src="/logo.jpg" alt="GCU CSS" className="w-20 h-20 rounded-xl object-cover relative z-10" />
          </div>

          <h1 className="text-4xl font-black text-white tracking-tighter uppercase leading-none italic">
            Admin <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] to-yellow-500">Portal</span>
          </h1>
          <p className="text-slate-600 mt-2 text-[10px] font-black tracking-[0.4em] uppercase opacity-70">
              Security Clearance Level Required
          </p>
        </motion.div>

        {/* ACCESS BOX */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full bg-slate-900/60 backdrop-blur-3xl p-10 rounded-[2.5rem] border border-slate-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] transition-all duration-500 hover:border-[#FFD700]/30"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-2">Uplink Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@gcu.edu.pk"
                className="w-full px-6 py-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-sm font-bold text-white placeholder:text-slate-900 focus:outline-none focus:border-blue-500/50 transition-all"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black text-slate-600 uppercase tracking-widest ml-2">Access Key</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full px-6 py-4 rounded-2xl bg-slate-950/80 border border-slate-800 text-sm font-bold text-white placeholder:text-slate-900 focus:outline-none focus:border-[#FFD700]/40 transition-all"
                required
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full relative py-5 mt-4 rounded-2xl bg-gradient-to-r from-[#FFD700] via-[#FDB931] to-[#FFA500] text-black font-black text-[11px] uppercase tracking-[0.3em] shadow-xl hover:shadow-[#FFD700]/10 active:scale-[0.97] transition-all disabled:opacity-50`}
            >
              {isSubmitting ? "TRANSMITTING..." : "ESTABLISH CONNECTION"}
            </button>
          </form>
        </motion.div>
        
        <Link to="/" className="mt-10 text-[9px] font-black uppercase text-slate-700 hover:text-white transition-all tracking-widest italic">
            ← Return to Public Terminal
        </Link>
      </div>
    </div>
  );
}