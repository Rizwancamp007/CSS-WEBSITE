import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
// FIXED: Use centralized API functions
import { fetchInquiries, markInquiryRead, deleteMessage as deleteApi } from "../api"; 

/**
 * @description Inquiry Inbox (Master Terminal)
 * Exclusively for Level 0 oversight.
 */
export default function AdminMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMsg, setSelectedMsg] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  /**
   * @section Communication Sync
   */
  const loadMessages = async () => {
    try {
      const res = await fetchInquiries();
      // Handle standardized { success: true, data: [...] } structure
      const msgList = res.data?.data || [];
      setMessages(msgList);
    } catch (error) {
      if (error.response?.status === 403) {
        toast.error("RESTRICTED: Level 0 Clearance Required.");
        navigate("/admin-dashboard");
      } else {
        toast.error("Uplink Failed: Frequencies Unstable.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    // LIVE SYNC: Check Master Admin status via Environment Variable
    const MASTER_EMAIL = import.meta.env.VITE_MASTER_ADMIN_EMAIL || "css@gmail.com";
    if (user && user.email?.toLowerCase() !== MASTER_EMAIL.toLowerCase()) {
      toast.error("ACCESS DENIED: Clearance Level 0 Required.");
      navigate("/admin-dashboard");
      return;
    }
    loadMessages(); 
  }, [user, navigate]);

  const handleSelectMessage = async (msg) => {
    setSelectedMsg(msg);
    if (!msg.isRead) {
      try {
        await markInquiryRead(msg._id);
        setMessages(prev => prev.map(m => m._id === msg._id ? { ...m, isRead: true } : m));
      } catch (error) {
        console.error("Transmission Log Update Error:", error);
      }
    }
  };

  const handlePurge = async (id) => {
    if(!window.confirm("PERMANENT PURGE? This node will be erased.")) return;
    const purgeToast = toast.loading("Purging Transmission...");
    try {
      await deleteApi(id);
      toast.success("Inquiry Node Purged.", { id: purgeToast });
      setMessages(prev => prev.filter(m => m._id !== id));
      if (selectedMsg?._id === id) setSelectedMsg(null);
    } catch (error) {
      toast.error("Purge Protocol Failed.", { id: purgeToast });
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 md:p-12 relative overflow-x-hidden font-sans selection:bg-blue-500/30">
      
      {/* Background Grid */}
      <div className="fixed inset-0 z-0 bg-[linear-gradient(to_right,#FFD70008_1px,transparent_1px),linear-gradient(to_bottom,#FFD70008_1px,transparent_1px)] bg-[size:4.5rem_4.5rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto mt-24 relative z-10">
        
        {/* TERMINAL HEADER */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12 gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-5xl font-black tracking-tighter uppercase leading-none italic">
                Inquiry <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] to-yellow-500">Inbox</span>
            </h1>
            <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.4em] mt-4 flex items-center gap-2">
               <span className="w-12 h-px bg-slate-800"></span> External Communications Terminal
            </p>
          </motion.div>

          <button onClick={() => navigate("/admin-dashboard")} className="flex items-center gap-3 px-8 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-[10px] font-black uppercase tracking-widest hover:border-blue-500/40 transition-all shadow-2xl">
            Return to Command
          </button>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 h-[calc(100vh-280px)] min-h-[550px]">
          
          {/* TRANSMISSION SCANNER */}
          <div className="lg:col-span-4 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
            {loading ? (
              <div className="flex flex-col items-center justify-center h-full py-10 opacity-50">
                  <div className="w-8 h-8 border-2 border-slate-800 border-t-blue-500 rounded-full animate-spin mb-4"></div>
                  <p className="text-[9px] font-black uppercase tracking-widest italic">Scanning Frequencies...</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="h-full border-2 border-dashed border-slate-800/50 rounded-[2.5rem] flex items-center justify-center p-10 text-center opacity-30">
                  <p className="text-[10px] font-black uppercase tracking-[0.3em] italic">No incoming signals detected.</p>
              </div>
            ) : (
              <AnimatePresence>
                {messages.map((msg) => (
                  <motion.div
                    key={msg._id}
                    layout
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    onClick={() => handleSelectMessage(msg)}
                    className={`group p-6 rounded-[2.5rem] border cursor-pointer transition-all duration-500 relative overflow-hidden ${
                      selectedMsg?._id === msg._id 
                      ? "bg-blue-600/10 border-blue-500/40 shadow-2xl" 
                      : "bg-slate-900/40 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    {!msg.isRead && <div className="absolute top-0 right-0 w-8 h-8 bg-[#FFD700] blur-2xl opacity-20" />}
                    <div className="flex justify-between items-start mb-3">
                      <span className={`text-[8px] font-black px-2 py-1 rounded-lg uppercase tracking-widest border ${msg.isRead ? "bg-slate-950 border-slate-800 text-slate-700" : "bg-[#FFD700] border-[#FFD700]/30 text-black"}`}>
                        {msg.isRead ? "LOGGED" : "DIRECT_HIT"}
                      </span>
                      <span className="text-[9px] text-slate-600 font-mono font-bold">{new Date(msg.createdAt).toLocaleDateString('en-GB')}</span>
                    </div>
                    <h3 className={`font-black text-sm uppercase tracking-tight truncate ${selectedMsg?._id === msg._id ? "text-blue-400" : "text-white"}`}>{msg.subject}</h3>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-tighter truncate mt-1">{msg.name}</p>
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>

          {/* DATA PAYLOAD VIEWER */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              {selectedMsg ? (
                <motion.div
                  key={selectedMsg._id}
                  initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.02 }}
                  className="bg-slate-900/40 backdrop-blur-3xl border border-slate-800 rounded-[3rem] p-10 h-full shadow-3xl relative flex flex-col transition-all"
                >
                  <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
                  
                  <div className="mb-10 border-b border-slate-800/50 pb-8 flex flex-col md:flex-row justify-between items-start gap-6">
                    <div>
                      <h2 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter italic">{selectedMsg.subject}</h2>
                      <div className="flex flex-wrap gap-x-8 gap-y-2 text-[10px] font-black uppercase tracking-[0.2em]">
                        <div className="flex items-center gap-2 text-slate-500"><span className="text-blue-500">ORIGIN:</span> <span className="text-slate-300 font-mono">{selectedMsg.name}</span></div>
                        <div className="flex items-center gap-2 text-slate-500"><span className="text-blue-500">UPLINK:</span> <span className="text-slate-300 font-mono">{selectedMsg.email}</span></div>
                      </div>
                    </div>
                    <button onClick={() => handlePurge(selectedMsg._id)} className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 hover:bg-red-600 hover:text-white transition-all">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>

                  <div className="flex-grow text-slate-400 leading-relaxed font-medium whitespace-pre-wrap text-sm custom-scrollbar overflow-y-auto pr-4">
                    {selectedMsg.message}
                  </div>

                  <div className="mt-12 pt-8 border-t border-slate-800/50">
                    <a href={`mailto:${selectedMsg.email}?subject=RE: ${selectedMsg.subject}`} className="inline-flex items-center gap-4 px-12 py-5 bg-gradient-to-r from-[#FFD700] to-yellow-600 text-black font-black uppercase text-[10px] tracking-[0.3em] rounded-[2rem] hover:brightness-110 shadow-2xl transition-all">
                      Initialize Response
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                    </a>
                  </div>
                </motion.div>
              ) : (
                <div className="h-full border-2 border-dashed border-slate-800/30 rounded-[3rem] flex flex-col items-center justify-center text-slate-800 p-10 text-center opacity-40">
                  <div className="w-20 h-20 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center mb-8 text-3xl animate-pulse">📡</div>
                  <p className="uppercase font-black text-[12px] tracking-[0.5em] italic">Monitoring Inbound Signals // Select node to decrypt</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}