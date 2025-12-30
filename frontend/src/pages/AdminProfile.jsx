import React, { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
import { updatePassword as updatePasswordApi } from "../api"; // FIXED: Use centralized API

/**
 * @description Account Security (Profile Terminal)
 * Hardened for operator identity management and credential rotation.
 */
export default function AdminProfile() {
  const { user } = useAuth();
  const [passwords, setPasswords] = useState({ old: "", new: "", confirm: "" });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // MASTER IDENTITY SYNC
  const MASTER_EMAIL = import.meta.env.VITE_MASTER_ADMIN_EMAIL || "css@gmail.com";
  const isMaster = user?.email?.toLowerCase() === MASTER_EMAIL.toLowerCase();

  /**
   * @section Credential Rotation Protocol
   */
  const handleChangePass = async (e) => {
    e.preventDefault();
    
    if (passwords.new !== passwords.confirm) {
        return toast.error("Handshake Failed: New passwords do not match.");
    }
    if (passwords.new.length < 8) {
        return toast.error("SECURITY RISK: Access key must be at least 8 characters.");
    }
    
    setLoading(true);
    const loadToast = toast.loading("Encrypting New Access Key...");
    try {
      /**
       * BACKEND HANDSHAKE: PUT /api/admin/change-password
       * Centralized Axios handles token injection and error parsing.
       */
      const res = await updatePasswordApi({ 
          oldPassword: passwords.old, 
          newPassword: passwords.new 
      });

      if (res.data?.success) {
        toast.success("Security Credentials Updated Successfully.", { id: loadToast });
        setPasswords({ old: "", new: "", confirm: "" });
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Credential Update Failed";
      toast.error(msg, { id: loadToast });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 pt-32 font-sans relative overflow-x-hidden selection:bg-yellow-500/30">
      
      {/* Background Infrastructure */}
      <div className="fixed inset-0 z-0 bg-[linear-gradient(to_right,#FFD70008_1px,transparent_1px),linear-gradient(to_bottom,#FFD70008_1px,transparent_1px)] bg-[size:4.5rem_4.5rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />
      
      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* TERMINAL HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none italic">
              Account <span className="text-[#FFD700]">Security</span>
            </h1>
            <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.4em] mt-4 flex items-center gap-2">
                <span className="w-12 h-px bg-slate-800"></span> Administrative Profile Management
            </p>
          </motion.div>

          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/admin-dashboard")}
            className="group flex items-center gap-3 px-8 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-[10px] font-black uppercase tracking-widest hover:border-blue-500/40 transition-all shadow-2xl"
          >
            <svg className="w-4 h-4 text-blue-400 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Return to Command
          </motion.button>
        </div>
        
        <div className="grid md:grid-cols-2 gap-10">
          
          {/* IDENTITY MATRIX (Read-Only) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2.5rem] backdrop-blur-3xl transition-all duration-500 hover:border-blue-500/20"
          >
            <h3 className="text-[10px] font-black uppercase text-slate-600 tracking-[0.3em] mb-8">Identity Matrix</h3>
            <div className="space-y-6">
              <div className="group">
                <p className="text-[9px] text-blue-500 font-black uppercase tracking-widest mb-1 opacity-60">Full Name</p>
                <div className="flex items-center gap-3">
                    <p className="text-xl font-black tracking-tight uppercase">{user?.fullName || user?.name || "Admin Node"}</p>
                    {isMaster && <span className="px-2 py-0.5 rounded-md bg-[#FFD700]/10 border border-[#FFD700]/20 text-[7px] font-black text-[#FFD700]">LEVEL_0</span>}
                </div>
              </div>
              <div className="group">
                <p className="text-[9px] text-blue-500 font-black uppercase tracking-widest mb-1 opacity-60">Email Uplink</p>
                <p className="text-slate-400 font-mono text-sm">{user?.email || user?.gmail}</p>
              </div>
              <div className="pt-6 border-t border-slate-800/50">
                 <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest mb-4">Authority Clearances</p>
                 <div className="flex flex-wrap gap-2">
                    {isMaster ? (
                        <span className="px-3 py-1.5 bg-[#FFD700]/5 border border-[#FFD700]/20 rounded-xl text-[8px] font-black text-[#FFD700] uppercase tracking-widest">
                            Global Master Access
                        </span>
                    ) : (
                        Object.entries(user?.permissions || {}).map(([key, val]) => (
                            val && (
                              <span key={key} className="px-3 py-1.5 bg-blue-500/5 border border-blue-500/20 rounded-xl text-[8px] font-black text-blue-400 uppercase tracking-widest">
                                {key.replace(/([A-Z])/g, ' $1').trim()}
                              </span>
                            )
                        ))
                    )}
                 </div>
              </div>
            </div>
          </motion.div>

          {/* CREDENTIALS CONSOLE (Update Form) */}
          <motion.form 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            onSubmit={handleChangePass} 
            className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2.5rem] backdrop-blur-3xl space-y-4 transition-all duration-500 hover:border-[#FFD700]/30 group"
          >
            <h3 className="text-[10px] font-black uppercase text-slate-600 tracking-[0.3em] mb-6">Update Access Key</h3>
            
            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-slate-700 ml-1 tracking-widest">Current Key</label>
              <input type="password" required placeholder="••••••••" className="w-full bg-slate-950/80 border border-slate-800 p-4 rounded-2xl text-xs font-bold focus:border-blue-500/50 outline-none transition-all placeholder:text-slate-900" value={passwords.old} onChange={e => setPasswords({...passwords, old: e.target.value})} />
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-slate-700 ml-1 tracking-widest">New Secret Key</label>
              <input type="password" required placeholder="••••••••" className="w-full bg-slate-950/80 border border-slate-800 p-4 rounded-2xl text-xs font-bold focus:border-[#FFD700]/40 outline-none transition-all placeholder:text-slate-900" value={passwords.new} onChange={e => setPasswords({...passwords, new: e.target.value})} />
            </div>

            <div className="space-y-2">
              <label className="text-[9px] font-black uppercase text-slate-700 ml-1 tracking-widest">Repeat New Key</label>
              <input type="password" required placeholder="••••••••" className="w-full bg-slate-950/80 border border-slate-800 p-4 rounded-2xl text-xs font-bold focus:border-[#FFD700]/40 outline-none transition-all placeholder:text-slate-900" value={passwords.confirm} onChange={e => setPasswords({...passwords, confirm: e.target.value})} />
            </div>

            <button 
              disabled={loading} 
              className="w-full py-5 bg-gradient-to-r from-[#FFD700] via-yellow-500 to-yellow-600 text-black font-black uppercase text-[10px] tracking-[0.3em] rounded-[1.5rem] mt-4 hover:brightness-110 active:scale-95 transition-all shadow-xl disabled:opacity-50"
            >
              {loading ? "RE-ENCRYPTING..." : "COMMIT ACCESS UPDATE"}
            </button>
          </motion.form>
        </div>
      </div>
    </div>
  );
}