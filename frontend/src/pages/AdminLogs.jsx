import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { API_URL } from "../App";

/**
 * @description System Audit Trail (Forensic Terminal)
 * Exclusively for Level 0 (Master Admin) oversight.
 * Hardened for high-density event monitoring and forensic tracking.
 */
export default function AdminLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const token = localStorage.getItem("token"); // Unified token key

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await fetch(`${API_URL}/admin/logs`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const result = await res.json();
        
        // Data extraction from standardized { success, data } wrapper
        const logData = result.success ? result.data : (Array.isArray(result) ? result : []);
        
        // Chronological sort: Newest transmissions first
        setLogs(logData.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
      } catch (err) {
        console.error("LOG_RETRIEVAL_FAILURE: Frequency link unstable.");
      } finally {
        setLoading(false);
      }
    };
    
    if (!token) navigate("/admin");
    else fetchLogs();
  }, [token, navigate]);

  /**
   * @section Protocol Styling
   * Dynamic color coding based on the severity and type of system action.
   */
  const getActionStyle = (action) => {
    switch (action) {
      case 'PASSWORD_CHANGE': 
      case 'EVENT_PURGE': 
        return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'LOGIN': 
        return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      case 'MEMBERSHIP_PURGE': 
        return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'AUTHORITY_SYNC': 
        return 'text-purple-500 bg-purple-500/10 border-purple-500/20';
      default: 
        return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 pt-32 relative overflow-x-hidden font-sans selection:bg-blue-500/30">
      
      {/* --- GRID FREQUENCY BACKGROUND --- */}
      <div className="fixed inset-0 z-0 bg-[linear-gradient(to_right,#FFD70012_1px,transparent_1px),linear-gradient(to_bottom,#FFD70012_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />
      
      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* HEADER TERMINAL */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none italic">
              System <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] to-yellow-500">Audit Trail</span>
            </h1>
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.4em] mt-4 flex items-center gap-2">
               <span className="w-12 h-px bg-slate-800"></span> Real-time Security Event Monitoring
            </p>
          </motion.div>

          <button 
            onClick={() => navigate("/admin-dashboard")} 
            className="group flex items-center gap-3 px-8 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-blue-500/40 transition-all shadow-2xl"
          >
            <svg className="w-4 h-4 text-blue-400 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Return to Command
          </button>
        </div>

        {/* --- MAINFRAME LEDGER BOX --- */}
        <div className="bg-slate-900/20 border border-slate-800 rounded-[2.5rem] overflow-hidden backdrop-blur-3xl shadow-3xl relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/20 to-transparent" />

          {/* LEDGER LEGEND */}
          <div className="p-6 bg-slate-950/50 border-b border-slate-800 grid grid-cols-12 gap-4 text-[9px] font-black uppercase text-slate-600 tracking-[0.2em] items-center">
            <span className="col-span-3 md:col-span-2">Transmission</span>
            <span className="col-span-3 md:col-span-2 text-center">Protocol</span>
            <span className="col-span-4 md:col-span-6">Operation Payload</span>
            <span className="hidden md:block md:col-span-2 text-right">Operator Node</span>
          </div>

          {/* STREAMING LOG CONTENT */}
          <div className="max-h-[65vh] overflow-y-auto custom-scrollbar font-mono text-[11px]">
            {loading ? (
              <div className="p-32 text-center flex flex-col items-center gap-6">
                <div className="w-10 h-10 border-2 border-t-[#FFD700] border-slate-900 rounded-full animate-spin" />
                <p className="font-black uppercase tracking-[0.5em] text-slate-800 animate-pulse text-[10px]">Synchronizing Secure Ledger...</p>
              </div>
            ) : logs.length === 0 ? (
                <div className="p-32 text-center text-slate-800 font-black uppercase tracking-[0.4em] italic text-[10px]">
                    No signals detected in current frequency.
                </div>
            ) : (
              <AnimatePresence>
                {logs.map((log, i) => (
                  <motion.div 
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={log._id || i} 
                    className="p-6 border-b border-slate-800/40 grid grid-cols-12 gap-4 items-center transition-all duration-300 group relative hover:bg-blue-600/[0.03]"
                  >
                    {/* Visual Anchor Glow */}
                    <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />

                    <span className="col-span-3 md:col-span-2 text-slate-500 text-[10px] font-mono leading-tight">
                        {new Date(log.createdAt).toLocaleTimeString([], { hour12: false })}
                        <br />
                        <span className="text-[8px] opacity-40 font-black">{new Date(log.createdAt).toLocaleDateString('en-GB')}</span>
                    </span>

                    <div className="col-span-3 md:col-span-2 flex justify-center">
                        <span className={`px-4 py-1.5 rounded-full border text-[8px] font-black tracking-widest uppercase shadow-lg ${getActionStyle(log.action)}`}>
                            {log.action}
                        </span>
                    </div>

                    <span className="col-span-4 md:col-span-6 text-slate-400 font-medium leading-relaxed">
                        {log.details}
                        {log.ipAddress && (
                          <span className="hidden lg:inline ml-3 text-[9px] font-mono text-slate-600 bg-black/40 px-2 py-0.5 rounded border border-slate-800">
                            IP: {log.ipAddress}
                          </span>
                        )}
                    </span>

                    <span className="col-span-2 hidden md:block text-right text-slate-600 font-bold truncate group-hover:text-[#FFD700] transition-colors uppercase tracking-tighter">
                        {log.adminEmail || 'SYSTEM_NODE'}
                    </span>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>
        
        {/* TERMINAL STATUS BAR */}
        <div className="mt-8 flex items-center justify-between px-6 opacity-30">
             <p className="text-[8px] font-black uppercase tracking-[0.5em] text-slate-500 italic">Secure Transmission Link // E2E Encrypted</p>
             <p className="text-[8px] font-black uppercase tracking-[0.5em] text-slate-500">Telemetry Nodes: {logs.length}</p>
        </div>
      </div>

      <style jsx>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #FFD70050; }
      `}</style>
    </div>
  );
}