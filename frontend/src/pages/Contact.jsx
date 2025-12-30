import React, { useState } from "react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";
import { submitInquiry } from "../api"; // FIXED: Use centralized API

/**
 * @description Communications Terminal (Contact Page)
 * Hardened for secure message transmission to the Board Registry.
 */
export default function Contact() {
  const [formData, setFormData] = useState({ 
    name: "", 
    email: "", 
    subject: "", 
    message: "" 
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /**
   * @section Transmission Protocol
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.email || !formData.message) {
        return toast.error("Payload Incomplete: Missing critical identifiers.");
    }

    setIsSubmitting(true);
    const loadToast = toast.loading("Establishing Uplink...");
    
    try {
      /**
       * UPLINK SYNCHRONIZATION:
       * Synchronized with Axios Interceptors and Environment API URL.
       */
      const res = await submitInquiry(formData);

      if (res.data?.success) {
        toast.success("Transmission Confirmed. Node Logged.", { id: loadToast });
        setFormData({ name: "", email: "", subject: "", message: "" });
      }
    } catch (error) {
      const msg = error.response?.data?.message || "Bridge Connection Lost.";
      toast.error(`COMMUNICATION_ERROR: ${msg}`, { id: loadToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white overflow-x-hidden relative selection:bg-blue-500/30 font-sans">
      
      {/* --- GRID FREQUENCY INFRASTRUCTURE --- */}
      <div className="fixed inset-0 z-0 w-full h-full bg-[linear-gradient(to_right,#FFD70008_1px,transparent_1px),linear-gradient(to_bottom,#FFD70008_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />
      
      <div className="relative z-10 px-6 pt-32 pb-24 max-w-6xl mx-auto">
        
        {/* TERMINAL HEADER */}
        <motion.div 
            initial={{ opacity: 0, y: -20 }} 
            animate={{ opacity: 1, y: 0 }} 
            className="text-center mb-20"
        >
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase leading-none italic">
            Get In <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] to-yellow-500">Touch</span>
          </h1>
          <p className="text-slate-600 text-[10px] mt-4 font-black uppercase tracking-[0.5em]">
            Connecting The Mainframe With GCU Talent
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-12 items-stretch">
          
          {/* IDENTIFICATION NODE (Left Side) */}
          <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} className="flex flex-col h-full">
            <div className="bg-slate-900/40 backdrop-blur-3xl p-10 rounded-[2.5rem] border border-slate-800 shadow-3xl h-full relative overflow-hidden transition-all duration-500 hover:border-blue-500/30">
              <div className="absolute top-0 left-0 w-2 h-full bg-blue-600/30 shadow-[0_0_15px_rgba(37,99,235,0.3)]" />
              
              <h2 className="text-3xl font-black text-white mb-12 uppercase tracking-tight italic flex items-center gap-4">
                Identity <span className="text-blue-500">Terminal</span>
              </h2>
              
              <div className="space-y-12">
                {/* Physical Sector Link */}
                <a 
                  href="https://maps.google.com/?q=GCU+Lahore+Computer+Science+Department" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="flex items-start gap-6 group"
                >
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-slate-600 transition-all duration-500 group-hover:bg-blue-600/10 group-hover:text-blue-400 group-hover:border-blue-500/40">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    </div>
                  <div>
                    <h3 className="font-black text-slate-500 uppercase text-[10px] tracking-widest mb-1">Physical Sector</h3>
                    <p className="text-base text-slate-400 font-medium font-mono group-hover:text-white transition-colors">CS Dept, GCU Lahore</p>
                  </div>
                </a>

                {/* Email Uplink Link */}
                <a 
                  href="mailto:css@gcu.edu.pk" 
                  className="flex items-start gap-6 group"
                >
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-slate-600 transition-all duration-500 group-hover:bg-emerald-600/10 group-hover:text-emerald-400 group-hover:border-emerald-500/40">
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                    </div>
                  <div>
                    <h3 className="font-black text-slate-500 uppercase text-[10px] tracking-widest mb-1">Uplink Address</h3>
                    <p className="text-base text-slate-400 font-medium font-mono group-hover:text-white transition-colors">css@gcu.edu.pk</p>
                  </div>
                </a>
              </div>

              <div className="mt-20 border-t border-slate-800/50 pt-10">
                <p className="text-[9px] font-black text-slate-700 mb-6 uppercase tracking-[0.4em]">Broadcast Channels</p>
                <div className="flex flex-wrap gap-4">
                  {[
                    { label: "Facebook", link: "https://web.facebook.com/CSSGCU", color: "hover:bg-[#1877F2]" },
                    { label: "LinkedIn", link: "https://www.linkedin.com/in/css-gcu-lahore", color: "hover:bg-[#0077B5]" },
                    { label: "Instagram", link: "https://www.instagram.com/css.gcu", color: "hover:bg-gradient-to-tr hover:from-[#f9ce34] hover:via-[#ee2a7b] hover:to-[#6228d7]" }
                  ].map((chan) => (
                    <a 
                        key={chan.label}
                        href={chan.link} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className={`px-5 py-2.5 rounded-xl bg-slate-950 border border-slate-800 text-[9px] font-black uppercase tracking-widest text-slate-600 hover:text-white transition-all duration-300 active:scale-95 ${chan.color}`}
                    >
                        {chan.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>

          {/* INQUIRY INITIALIZER (Right Side) */}
          <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }}>
            <form 
              onSubmit={handleSubmit} 
              className="bg-slate-900/40 backdrop-blur-3xl p-10 rounded-[2.5rem] border border-slate-800 shadow-3xl h-full relative overflow-hidden transition-all duration-500 hover:border-[#FFD700]/30 group"
            >
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#FFD700] to-transparent opacity-40 shadow-[0_0_10px_rgba(255,215,0,0.5)]" />
              
              <h2 className="text-3xl font-black text-white mb-8 uppercase tracking-tight leading-none italic">Initialize <span className="text-[#FFD700]">Inquiry</span></h2>
              
              <div className="space-y-4">
                <input name="name" value={formData.name} onChange={handleChange} placeholder="IDENTIFIER NAME" className="w-full px-6 py-5 rounded-2xl bg-slate-950/80 border border-slate-800 text-white placeholder:text-slate-900 focus:border-[#FFD700]/30 outline-none transition-all text-[11px] font-black tracking-widest uppercase" required />
                <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="UPLINK GMAIL" className="w-full px-6 py-5 rounded-2xl bg-slate-950/80 border border-slate-800 text-white placeholder:text-slate-900 focus:border-[#FFD700]/30 outline-none transition-all text-[11px] font-black tracking-widest uppercase" required />
                <input name="subject" value={formData.subject} onChange={handleChange} placeholder="PAYLOAD SUBJECT" className="w-full px-6 py-5 rounded-2xl bg-slate-950/80 border border-slate-800 text-white placeholder:text-slate-900 focus:border-[#FFD700]/30 outline-none transition-all text-[11px] font-black tracking-widest uppercase" required />
                <textarea name="message" value={formData.message} onChange={handleChange} placeholder="TRANSMISSION CONTENT..." rows="4" className="w-full px-6 py-5 rounded-2xl bg-slate-950/80 border border-slate-800 text-white placeholder:text-slate-900 focus:border-[#FFD700]/30 outline-none transition-all resize-none text-[11px] font-black tracking-widest uppercase" required></textarea>
              </div>

              <button type="submit" disabled={isSubmitting} className="mt-8 w-full py-6 rounded-2xl bg-gradient-to-r from-[#FFD700] via-[#FDB931] to-[#FFA500] text-black font-black uppercase tracking-[0.3em] text-[10px] shadow-3xl hover:scale-[1.02] hover:shadow-[0_0_30px_rgba(255,215,0,0.2)] active:scale-95 transition-all duration-500 disabled:opacity-50">
                {isSubmitting ? "ENCRYPTING TRANSMISSION..." : "ESTABLISH LINK"}
              </button>
            </form>
          </motion.div>

        </div>
      </div>
    </div>
  );
}