import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { submitMembership } from "../api"; // FIXED: Use centralized API

/**
 * @description Recruitment Terminal (Membership Enlistment)
 * Hardened for secure data collection and transmission with real-time validation.
 */
export default function Membership() {
  const [formData, setFormData] = useState({
    fullName: "",
    rollNo: "",
    department: "",
    semester: "",
    gmail: "",
    phoneNumber: "",
    applyingRole: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /**
   * @section Transmission Protocol
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Transmission Validation
    if (!formData.rollNo.trim() || !formData.gmail.trim()) {
      return setError("Critical Identifiers (Roll No/Gmail) missing.");
    }

    setIsSubmitting(true);
    setError("");

    try {
      /**
       * UPLINK SYNCHRONIZATION:
       * Synchronized with Axios Interceptors for centralized URL handling.
       */
      const payload = {
        ...formData,
        rollNo: formData.rollNo.trim().toUpperCase() // Data cleaning for DB integrity
      };

      const res = await submitMembership(payload);
      
      if (res.data?.success) {
        setSubmitted(true);
        setFormData({
          fullName: "", rollNo: "", department: "", semester: "",
          gmail: "", phoneNumber: "", applyingRole: "",
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      const msg = err.response?.data?.message || "COMMUNICATION_FAILURE: Mainframe link unstable.";
      setError(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white overflow-x-hidden relative selection:bg-blue-500/30 font-sans">
      
      {/* --- GRID INFRASTRUCTURE --- */}
      <div className="fixed inset-0 z-0 w-full h-full bg-[linear-gradient(to_right,#FFD70008_1px,transparent_1px),linear-gradient(to_bottom,#FFD70008_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />
      
      <div className="relative z-10 px-4 md:px-6 py-28 max-w-4xl mx-auto mt-12">
        
        {/* TERMINAL HEADER */}
        <div className="text-center mb-16">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-7xl font-black tracking-tighter uppercase mb-6 leading-none italic"
          >
            Enlist in <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] to-yellow-500">The Society</span>
          </motion.h1>

          <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.4em] max-w-xl mx-auto leading-relaxed">
            Initialize your profile with the GCU CS Society Command // Recruitment Active.
          </p>
        </div>

        {/* STATUS HUD */}
        <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-12 p-10 rounded-[3rem] bg-blue-600/5 border border-blue-500/20 text-blue-400 text-center flex flex-col items-center gap-6 shadow-3xl relative overflow-hidden backdrop-blur-xl"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 shadow-[0_0_15px_rgba(37,99,235,1)]" />
                <div className="w-20 h-20 rounded-3xl bg-blue-600/10 flex items-center justify-center text-4xl border border-blue-500/20">✓</div>
                <h3 className="font-black uppercase tracking-tighter text-3xl italic">Transmission Confirmed</h3>
                <p className="text-[11px] font-black text-slate-500 max-w-sm uppercase tracking-widest leading-relaxed">
                  The Executive Board is reviewing your credentials. Check your digital mail for future activation protocols.
                </p>
                <button onClick={() => setSubmitted(false)} className="mt-4 text-[9px] font-black text-blue-400 uppercase tracking-widest hover:underline">New Enlistment</button>
              </motion.div>
            ) : (
              <>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="mb-8 p-5 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-center text-[10px] font-black uppercase tracking-widest shadow-lg"
                  >
                    SYSTEM_ALERT: {error}
                  </motion.div>
                )}

                <motion.form
                  onSubmit={handleSubmit}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-slate-900/40 backdrop-blur-3xl p-10 md:p-14 rounded-[3.5rem] border border-slate-800 shadow-3xl grid grid-cols-1 md:grid-cols-2 gap-8 relative transition-all duration-500 hover:border-[#FFD700]/30 group"
                >
                  <div className="absolute top-0 right-14 w-24 h-1 bg-[#FFD700] shadow-[0_0_15px_rgba(255,215,0,0.5)]" />
                  
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-700 ml-2">Identify Name</label>
                    <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} placeholder="IDENTIFIER" className="w-full px-6 py-5 rounded-2xl bg-slate-950/80 border border-slate-800 text-white placeholder-slate-900 focus:border-blue-500/50 outline-none font-bold text-sm" required />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-700 ml-2">University Roll No</label>
                    <input type="text" name="rollNo" value={formData.rollNo} onChange={handleChange} placeholder="NODE_ID" className="w-full px-6 py-5 rounded-2xl bg-slate-950/80 border border-slate-800 text-white placeholder-slate-900 focus:border-blue-500/50 outline-none font-bold text-sm" required />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-700 ml-2">Department Sector</label>
                    <input type="text" name="department" value={formData.department} onChange={handleChange} placeholder="SECTOR" className="w-full px-6 py-5 rounded-2xl bg-slate-950/80 border border-slate-800 text-white placeholder-slate-900 focus:border-blue-500/50 outline-none font-bold text-sm" required />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-700 ml-2">Enrollment Phase</label>
                    <input type="text" name="semester" value={formData.semester} onChange={handleChange} placeholder="PHASE_INDEX" className="w-full px-6 py-5 rounded-2xl bg-slate-950/80 border border-slate-800 text-white placeholder-slate-900 focus:border-blue-500/50 outline-none font-bold text-sm" required />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-700 ml-2">Primary Uplink (Gmail)</label>
                    <input type="email" name="gmail" value={formData.gmail} onChange={handleChange} placeholder="COMM_LINK" className="w-full px-6 py-5 rounded-2xl bg-slate-950/80 border border-slate-800 text-white placeholder-slate-900 focus:border-blue-500/50 outline-none font-bold text-sm" required />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-700 ml-2">Signal Line (WhatsApp)</label>
                    <input type="text" name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} placeholder="CONTACT_ID" className="w-full px-6 py-5 rounded-2xl bg-slate-950/80 border border-slate-800 text-white placeholder-slate-900 focus:border-blue-500/50 outline-none font-bold text-sm" required />
                  </div>

                  <div className="md:col-span-2 space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-700 ml-2">Desired Authority (Role)</label>
                    <div className="relative">
                      <select 
                          name="applyingRole" 
                          value={formData.applyingRole} 
                          onChange={handleChange} 
                          className="w-full px-6 py-5 rounded-2xl bg-slate-950/80 border border-slate-800 text-white focus:border-blue-500/50 outline-none appearance-none cursor-pointer text-[10px] font-black uppercase tracking-[0.2em]"
                          required
                      >
                          <option value="">-- SELECT CLEARANCE LEVEL --</option>
                          <option value="General Member">General Member</option>
                          <option value="Executive Council">Executive Council</option>
                          <option value="Media Team">Media & Communications</option>
                          <option value="Technical Team">Technical Operations</option>
                      </select>
                      <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">▼</div>
                    </div>
                  </div>

                  <div className="md:col-span-2 pt-8">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className={`w-full py-6 rounded-2xl bg-white text-black font-black uppercase tracking-[0.3em] text-[11px] shadow-3xl hover:bg-[#FFD700] transition-all duration-500 active:scale-95 disabled:opacity-50`}
                    >
                      {isSubmitting ? "SYNCING_CREDENTIALS..." : "INITIATE ENLISTMENT"}
                    </button>
                  </div>
                </motion.form>
              </>
            )}
        </AnimatePresence>
      </div>
    </div>
  );
}