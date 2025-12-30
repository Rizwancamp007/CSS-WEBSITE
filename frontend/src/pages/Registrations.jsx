import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import toast from "react-hot-toast";
// FIXED: Use centralized API functions
import { fetchAllRegistrations, deleteRegistration as deleteApi, exportRegistrations } from "../api"; 

/**
 * @description Mission Registry (Registrations Terminal)
 * Hardened for high-density participant tracking and professional data extraction.
 */
export default function Registrations() {
  const [registrations, setRegistrations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEvent, setFilterEvent] = useState("All");
  const [loading, setLoading] = useState(true);
  const { hasPermission } = useAuth();
  const navigate = useNavigate();

  /**
   * @section Registry Synchronization
   */
  const loadRegistrations = async () => {
    try {
      setLoading(true);
      const res = await fetchAllRegistrations();
      const list = res.data?.data || [];
      setRegistrations(list);
    } catch (error) {
      toast.error("Registry Sync Failed: Mainframe Unreachable.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    if (!hasPermission('canViewRegistrations')) {
      toast.error("ACCESS DENIED: Clearance Level Insufficient.");
      navigate("/admin-dashboard");
      return;
    }
    loadRegistrations(); 
  }, [hasPermission, navigate]);

  const handleDelete = async (id) => {
    if(!window.confirm("CRITICAL: Permanent wipe requested. Purge participant?")) return;
    const purgeToast = toast.loading("Purging Registry Node...");
    try {
      await deleteApi(id);
      toast.success("Identity Purged.", { id: purgeToast });
      setRegistrations(prev => prev.filter(reg => reg._id !== id));
    } catch (e) { toast.error("Purge failed.", { id: purgeToast }); }
  };

  /**
   * @section Extraction Protocol
   * Uses the hardened backend stream to generate a clean CSV manifest.
   */
  const handleExport = async () => {
    const exportToast = toast.loading("Extracting Manifest...");
    try {
      const res = await exportRegistrations();
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `CSS_Mission_Registry_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      toast.success("CSV Manifest Extracted.", { id: exportToast });
    } catch (err) {
      toast.error("Extraction Failed.", { id: exportToast });
    }
  };

  const handlePrint = () => {
    toast.loading("Rendering Print Manifest...", { duration: 2000 });
    setTimeout(() => window.print(), 500);
  };

  const eventList = ["All", ...new Set(registrations.map(reg => reg.eventId?.title || "Unknown Mission"))];

  const filteredData = registrations.filter(reg => {
    const participantName = (reg.name || "").toLowerCase();
    const roll = (reg.rollNo || "").toLowerCase();
    const missionName = (reg.eventId?.title || "").toLowerCase();
    const matchesSearch = participantName.includes(searchTerm.toLowerCase()) || roll.includes(searchTerm.toLowerCase());
    const matchesEvent = filterEvent === "All" || (reg.eventId?.title === filterEvent);
    return matchesSearch && matchesEvent;
  });

  return (
    <div className="min-h-screen bg-[#020617] text-white overflow-x-hidden relative selection:bg-blue-500/30 font-sans">
      
      <div className="fixed inset-0 z-0 bg-[linear-gradient(to_right,#FFD70008_1px,transparent_1px),linear-gradient(to_bottom,#FFD70008_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      <div className="relative z-10 px-6 pt-32 pb-24 max-w-7xl mx-auto">
        
        {/* HEADER & OPERATIONS HUB */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-16 gap-6 no-print">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-5xl font-black tracking-tighter uppercase leading-none mb-4 italic">
              Mission <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] to-yellow-500">Registry</span>
            </h1>
            <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.4em]">Active Nodes: {filteredData.length} // Encrypted Link</p>
          </motion.div>

          <div className="flex flex-wrap items-center gap-4">
            <button onClick={() => navigate("/admin-dashboard")} className="px-6 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-[10px] font-black uppercase tracking-widest hover:border-blue-500/50 transition-all shadow-xl">
              Back to Command
            </button>
            <button onClick={handleExport} className="px-6 py-3 bg-emerald-600/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-600 hover:text-white font-black uppercase rounded-2xl text-[10px] transition-all shadow-xl">
              Extract CSV
            </button>
            <button onClick={handlePrint} className="px-6 py-3 bg-blue-600 text-white font-black uppercase rounded-2xl text-[10px] shadow-2xl hover:bg-blue-500 transition-all">
              Print Manifest
            </button>
          </div>
        </div>

        {/* FILTER ARRAY */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 mb-10 no-print">
            <div className="md:col-span-8">
                <input 
                  type="text" 
                  placeholder="SEARCH PARTICIPANT IDENTITY / NODE ID..." 
                  className="w-full px-6 py-5 rounded-2xl bg-slate-950/80 border border-slate-800 focus:border-blue-500/50 outline-none text-[11px] font-black uppercase tracking-widest transition-all placeholder:text-slate-900"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="md:col-span-4 relative">
                <select 
                  className="w-full px-6 py-5 rounded-2xl bg-slate-950/80 border border-slate-800 focus:border-[#FFD700]/30 outline-none text-[10px] font-black uppercase tracking-widest cursor-pointer appearance-none text-white"
                  value={filterEvent}
                  onChange={(e) => setFilterEvent(e.target.value)}
                >
                  {eventList.map(ev => <option key={ev} value={ev} className="bg-slate-950">{ev === "All" ? "ALL MISSIONS" : ev.toUpperCase()}</option>)}
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-40 text-xs">▼</div>
            </div>
        </div>

        {/* MAINFRAME LEDGER */}
        <div className="bg-slate-900/40 backdrop-blur-3xl border border-slate-800 rounded-[3rem] shadow-3xl overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#FFD700] to-transparent opacity-30" />
          
          {loading ? (
              <div className="text-center py-40">
                <div className="w-12 h-12 border-4 border-t-[#FFD700] border-slate-950 rounded-full animate-spin mx-auto mb-6"></div>
                <p className="text-[10px] font-black uppercase tracking-[0.5em] text-slate-800">Accessing Encrypted Registry...</p>
              </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-950/50 text-[10px] font-black uppercase tracking-[0.4em] text-slate-700 border-b border-slate-800/50">
                    <th className="p-8">Participant Identifier</th>
                    <th className="p-8">Node ID (Roll)</th>
                    <th className="p-8">Allocated Mission</th>
                    <th className="p-8">Contact Frequency</th>
                    <th className="p-8 text-right no-print">Operations</th>
                  </tr>
                </thead>
                <tbody className="text-[11px]">
                  <AnimatePresence>
                  {filteredData.length > 0 ? filteredData.map((reg) => (
                    <motion.tr 
                      key={reg._id}
                      layout
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      className="border-b border-slate-800/30 transition-all group hover:bg-blue-600/[0.02]"
                    >
                      <td className="p-8">
                        <div className="font-black text-slate-200 uppercase tracking-tight group-hover:text-blue-400 transition-colors">
                          {reg.name}
                        </div>
                        <div className="text-[9px] text-slate-600 font-black uppercase tracking-widest mt-1">
                          {reg.department} <span className="mx-2 opacity-20">//</span> SEM_{reg.semester}
                        </div>
                      </td>
                      <td className="p-8 font-mono text-blue-500 font-black tracking-tighter uppercase">
                        {reg.rollNo}
                      </td>
                      <td className="p-8">
                        <span className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-[#FFD700] text-[9px] font-black uppercase tracking-widest shadow-lg italic">
                          {reg.eventId?.title || "Unknown Mission"}
                        </span>
                      </td>
                      <td className="p-8">
                        <div className="font-black text-slate-500 group-hover:text-slate-300 transition-colors font-mono">{reg.email}</div>
                        <div className="text-[9px] text-slate-700 font-mono mt-1 italic">{reg.phoneNumber}</div>
                      </td>
                      <td className="p-8 text-right no-print">
                         <div className="flex justify-end gap-6 uppercase font-black text-[9px] tracking-widest">
                           <a href={`mailto:${reg.email}`} className="text-blue-500 hover:text-white transition-all">Ping</a>
                           <button onClick={() => handleDelete(reg._id)} className="text-red-600 hover:text-white transition-all">Purge</button>
                         </div>
                      </td>
                    </motion.tr>
                  )) : (
                    <tr><td colSpan="5" className="p-40 text-center text-slate-800 text-[11px] font-black uppercase tracking-[0.5em] italic">No active mission records detected on this frequency.</td></tr>
                  )}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: white !important; color: black !important; padding: 0 !important; }
          .relative.z-10 { padding-top: 0 !important; }
          .bg-slate-900, .bg-slate-950, .backdrop-blur-3xl { background: none !important; border: 1px solid #eee !important; }
          table { width: 100% !important; border-collapse: collapse !important; color: black !important; }
          th, td { border: 1px solid #eee !important; padding: 12px !important; color: black !important; font-size: 10px !important; }
          .text-blue-500, .text-[#FFD700], .text-slate-200 { color: black !important; font-weight: bold !important; }
          h1 span { color: black !important; background: none !important; -webkit-text-fill-color: black !important; }
        }
      `}</style>
    </div>
  );
}