import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { toast } from "react-hot-toast";
import { API_URL } from "../App"; 

/**
 * @description The Activation Node
 * Purpose: Finalizes board member enrollment by setting access credentials.
 * Hardened with token verification and input normalization.
 */
export default function ActivateAccount() {
  const [formData, setFormData] = useState({ 
    rollNo: "", 
    gmail: "", 
    password: "", 
    confirmPassword: "" 
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // SECURITY PROTOCOL: Extract encrypted token from URL uplink
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get("token");

  useEffect(() => {
    if (!token) {
      toast.error("SECURITY ALERT: No activation token detected. Use the official link.");
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // VALIDATION SEQUENCE
    if (formData.password !== formData.confirmPassword) {
      return toast.error("Handshake Failed: Passcodes do not match.");
    }
    if (formData.password.length < 8) { // Hardened to 8 characters
      return toast.error("SECURITY RISK: Password must be at least 8 characters.");
    }
    if (!token) {
      return toast.error("UPLINK DENIED: Missing Security Token.");
    }

    setLoading(true);
    const loadToast = toast.loading("Establishing Secure Connection...");

    try {
      /**
       * BACKEND HANDSHAKE:
       * Synchronized with AdminController -> setupAdminPassword
       */
      const response = await fetch(`${API_URL}/admin/setup-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          rollNo: formData.rollNo.toUpperCase().trim(),
          gmail: formData.gmail.toLowerCase().trim(),
          password: formData.password,
          token: token 
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast.success("Identity Verified. Welcome to the Executive Board.", { id: loadToast });
        // Temporal delay to allow the user to read the confirmation
        setTimeout(() => navigate("/admin"), 2500);
      } else {
        toast.error(data.message || "Activation logic failure.", { id: loadToast });
      }
    } catch (error) {
      toast.error("COMMUNICATION ERROR: Mainframe Bridge Lost.", { id: loadToast });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white flex items-center justify-center p-6 relative overflow-hidden selection:bg-yellow-500/30">
      
      {/* --- GRID INFRASTRUCTURE --- */}
      <div className="fixed inset-0 z-0 w-full h-full bg-[linear-gradient(to_right,#FFD70010_1px,transparent_1px),linear-gradient(to_bottom,#FFD70010_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-full max-w-md bg-slate-900/40 backdrop-blur-3xl border border-slate-800 p-10 rounded-[3rem] shadow-3xl"
      >
        <div className="text-center mb-10">
          <div className="inline-block px-4 py-1.5 rounded-full border border-[#FFD700]/20 bg-[#FFD700]/5 text-[#FFD700] text-[9px] font-black uppercase tracking-[0.3em] mb-6">
            Executive Node Activation
          </div>
          <h1 className="text-4xl font-black tracking-tighter uppercase leading-none mb-2">
            Confirm <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] to-yellow-500 italic">Access</span>
          </h1>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-3">Finalize your administrative credentials</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Identity Verification Fields */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-600 tracking-widest ml-1">Verified Roll No</label>
            <input 
              required
              name="rollNo"
              value={formData.rollNo}
              onChange={(e) => setFormData({...formData, rollNo: e.target.value})}
              className="w-full bg-slate-950/80 border border-slate-800 p-4 rounded-2xl text-xs font-bold text-white focus:border-blue-500/50 outline-none transition-all placeholder:text-slate-800" 
              placeholder="e.g. 0001-BSCS-24" 
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-600 tracking-widest ml-1">Registered Gmail</label>
            <input 
              required
              type="email"
              name="gmail"
              value={formData.gmail}
              onChange={(e) => setFormData({...formData, gmail: e.target.value})}
              className="w-full bg-slate-950/80 border border-slate-800 p-4 rounded-2xl text-xs font-bold text-white focus:border-blue-500/50 outline-none transition-all placeholder:text-slate-800" 
              placeholder="ravian@gmail.com" 
            />
          </div>

          <div className="h-px bg-slate-800/40 my-6" />

          {/* Credential Setting Fields */}
          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-600 tracking-widest ml-1">Secret Access Key</label>
            <input 
              required
              type="password"
              name="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full bg-slate-950/80 border border-slate-800 p-4 rounded-2xl text-xs font-bold text-white focus:border-[#FFD700]/40 outline-none transition-all placeholder:text-slate-800" 
              placeholder="••••••••" 
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-black uppercase text-slate-600 tracking-widest ml-1">Repeat Key</label>
            <input 
              required
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({...formData, confirmPassword: e.target.value})}
              className="w-full bg-slate-950/80 border border-slate-800 p-4 rounded-2xl text-xs font-bold text-white focus:border-[#FFD700]/40 outline-none transition-all placeholder:text-slate-800" 
              placeholder="••••••••" 
            />
          </div>

          <button 
            disabled={loading}
            className="w-full bg-gradient-to-r from-[#FFD700] via-yellow-500 to-yellow-600 text-black font-black uppercase tracking-[0.3em] text-[11px] py-5 rounded-2xl mt-4 hover:shadow-[0_0_30px_rgba(255,215,0,0.2)] active:scale-95 transition-all disabled:opacity-50"
          >
            {loading ? "Establishing Identity..." : "Activate Executive Account"}
          </button>
        </form>

        <div className="mt-10 pt-8 border-t border-slate-800/50 text-center">
            <Link to="/admin" className="text-[10px] font-black uppercase text-blue-500 hover:text-blue-400 transition-colors tracking-[0.2em]">
              ← Back to Mainframe Login
            </Link>
        </div>
      </motion.div>
    </div>
  );
}