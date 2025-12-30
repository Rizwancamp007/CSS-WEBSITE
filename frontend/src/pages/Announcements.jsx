import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { fetchAnnouncements } from "../api"; // FIXED: Use centralized API uplink

/**
 * @description Institutional Alerts (Public Feed)
 * Hardened for real-time broadcast synchronization and categorical badge styling.
 */
export default function Announcements() {
  const [announcements, setAnnouncements] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  /**
   * @section Frequency Synchronization
   */
  useEffect(() => {
    const loadAnnouncements = async () => {
      try {
        const res = await fetchAnnouncements();
        
        // Data Extraction: Supports standardized { success, data } wrapper
        const list = res.data?.data || [];
        
        // SECURITY: Strict public filtering (Archives remain hidden)
        const publicFeed = list.filter(a => !a.isArchived);
        
        // Sort: Most recent transmissions first
        setAnnouncements(publicFeed.sort((a, b) => new Date(b.date) - new Date(a.date)));
      } catch (error) {
        setError("UPLINK_FAILURE: Monitoring system suggests connection interference.");
      } finally {
        setLoading(false);
      }
    };

    loadAnnouncements();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "ACTIVE_NOW";
    return new Date(dateString).toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  /**
   * @section Protocol Badge Styling
   */
  const getBadgeStyle = (type) => {
    switch (type?.toLowerCase()) {
      case "notice": return "bg-red-500/10 text-red-400 border-red-500/20";
      case "opportunity": return "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
      case "result": return "bg-amber-500/10 text-amber-400 border-amber-500/20";
      case "update": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      default: return "bg-slate-800 text-slate-400 border-slate-700";
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white overflow-x-hidden relative selection:bg-blue-500/30 font-sans">
      
      {/* --- GRID INFRASTRUCTURE --- */}
      <div className="fixed inset-0 z-0 w-full h-full bg-[linear-gradient(to_right,#FFD70008_1px,transparent_1px),linear-gradient(to_bottom,#FFD70008_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />
      
      {/* Ambient Lighting Pulse */}
      <motion.div
        className="fixed top-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full bg-blue-600/5 blur-[120px] pointer-events-none z-0"
        animate={{ scale: [1, 1.1, 1], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 12, repeat: Infinity }}
      />

      <div className="relative z-10 px-6 pt-32 pb-24 max-w-5xl mx-auto">
        
        {/* PAGE HEADER */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-20"
        >
          <div className="inline-block px-4 py-1.5 rounded-full border border-blue-500/20 bg-blue-500/5 text-blue-400 text-[9px] font-black uppercase tracking-[0.4em] mb-6">
            REAL_TIME_INTEL_STREAM
          </div>
          <h1 className="text-6xl md:text-7xl font-black tracking-tighter leading-none mb-6 italic">
            Institutional <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] to-yellow-500">Alerts</span>
          </h1>
          <p className="text-slate-500 text-lg max-w-2xl mx-auto font-medium">
            Departmental notices, result bulletins, and career opportunities 
            synced directly from the Board Command.
          </p>
        </motion.div>

        {error && (
          <div className="bg-red-500/5 border border-red-500/20 text-red-500 p-6 rounded-[2rem] text-center mb-12 backdrop-blur-xl font-black uppercase text-[10px] tracking-widest">
            SYSTEM_ERROR: {error}
          </div>
        )}

        {/* BROADCAST STREAM */}
        <div className="space-y-6">
          {loading ? (
            <div className="text-center py-24 flex flex-col items-center">
               <div className="w-10 h-10 border-4 border-t-[#FFD700] border-slate-900 rounded-full animate-spin mb-6"></div>
               <p className="text-[9px] font-black uppercase tracking-[0.4em] text-slate-700 italic">Decrypting Frequency...</p>
            </div>
          ) : announcements.length === 0 ? (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-24 bg-slate-900/20 rounded-[3rem] border border-slate-800 border-dashed">
              <p className="text-slate-600 font-black uppercase tracking-[0.3em] text-[10px] italic">The broadcast frequency is currently silent.</p>
            </motion.div>
          ) : (
            <AnimatePresence mode="popLayout">
              {announcements.map((item) => (
                <motion.article
                  key={item._id}
                  initial={{ opacity: 0, x: -15 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="group relative bg-slate-900/40 backdrop-blur-3xl rounded-[2.5rem] border border-slate-800 p-8 sm:p-10 transition-all duration-500 hover:border-blue-500/30 shadow-2xl overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 blur-[100px] opacity-0 group-hover:opacity-10 transition-opacity" />
                  
                  <div className="flex flex-col md:flex-row justify-between gap-8 items-start relative z-10">
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-6">
                        <span className={`px-4 py-1.5 rounded-xl text-[8px] font-black uppercase tracking-[0.2em] border transition-all ${getBadgeStyle(item.type)}`}>
                          {item.type || "Update"}
                        </span>
                        <div className="flex items-center gap-2">
                           <div className="w-1 h-1 rounded-full bg-slate-800"></div>
                           <span className="text-slate-600 text-[10px] font-mono font-bold tracking-widest">
                             {formatDate(item.date)}
                           </span>
                        </div>
                      </div>

                      <h3 className="text-3xl font-black text-white group-hover:text-blue-400 transition-colors mb-4 uppercase tracking-tighter leading-tight italic">
                        {item.title}
                      </h3>
                      <p className="text-slate-400 leading-relaxed font-medium text-base whitespace-pre-line">
                        {item.description}
                      </p>
                    </div>
                  </div>
                </motion.article>
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* CALL TO ACTION */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-32 p-12 md:p-16 rounded-[3.5rem] border border-slate-800 bg-slate-950/40 backdrop-blur-3xl text-center relative overflow-hidden group transition-all duration-500 hover:border-[#FFD700]/20 shadow-3xl"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/30 to-transparent opacity-50" />
          <h3 className="text-4xl font-black text-white mb-4 uppercase tracking-tighter italic">Stay Synchronized</h3>
          <p className="text-slate-500 mb-10 max-w-lg mx-auto font-medium">Join the elite ranks receiving direct alerts on technical workshops and society activities.</p>
          
          <Link
            to="/membership"
            className="inline-block px-12 py-5 rounded-[2rem] bg-gradient-to-r from-[#FFD700] to-yellow-600 text-black font-black uppercase tracking-[0.3em] text-[11px] shadow-2xl hover:shadow-[0_0_30px_rgba(255,215,0,0.2)] transition-all duration-300"
          >
            Initiate Enlistment
          </Link>
        </motion.div>

      </div>
    </div>
  );
}