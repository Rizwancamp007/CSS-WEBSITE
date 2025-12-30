import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // FIXED: Integrated Centralized Auth
import toast from "react-hot-toast";
import { API_URL } from "../App"; 

/**
 * @description Mission Registry (Registrations Terminal)
 * Purpose: High-density participant tracking and data extraction.
 * Hardened with real-time RBAC verification and forensic print optimization.
 */
export default function Registrations() {
  const [registrations, setRegistrations] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterEvent, setFilterEvent] = useState("All");
  const [loading, setLoading] = useState(true);
  const { user, hasPermission } = useAuth(); // FIXED: Reading identity from context
  
  const navigate = useNavigate();
  const token = localStorage.getItem("token"); // Unified token key

  /**
   * @section Registry Synchronization
   * Fetches full participant logs from the mainframe via the secured uplink.
   */
  const fetchRegistrations = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/register/all`, {
        headers: { "Authorization": `Bearer ${token}` },
      });

      const result = await res.json();
      
      // Data Extraction from standardized { success, data } wrapper
      const list = result.data || (Array.isArray(result) ? result : []);
      setRegistrations(list);

      if (res.status === 401) navigate("/admin");
    } catch (error) {
      toast.error("Registry Sync Failed: Mainframe Unreachable.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    // SECURITY GUARD: Check for operational clearance
    if (user && !hasPermission('canViewRegistrations')) {
      toast.error("ACCESS DENIED: Clearance Level Insufficient.");
      navigate("/admin-dashboard");
      return;
    }

    if (!token) navigate("/admin");
    else fetchRegistrations(); 
  }, [token, user]);

  /**
   * @section Purge Protocol
   * Permanently erases a participant node from the mission log.
   */
  const handleDelete = async (id) => {
    if(!window.confirm("CRITICAL: Permanent wipe requested. Purge participant from mission logs?")) return;
    const purgeToast = toast.loading("Purging Registry Node...");
    try {
      const res = await fetch(`${API_URL}/register/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if(res.ok) {
        toast.success("Identity Purged.", { id: purgeToast });
        setRegistrations(prev => prev.filter(reg => reg._id !== id));
      }
    } catch (e) { toast.error("Purge sequence failed.", { id: purgeToast }); }
  };

  /**
   * @section Extraction Protocol (CSV)
   * Converts mission logs into a raw data manifest for external processing.
   */
  const downloadCSV = () => {
    if (!filteredData || filteredData.length === 0) return toast.error("Extraction Failed: No data payload.");
    
    const headers = ["Name,Roll No,Department,Semester,Mission,Email,Phone"];
    const rows = filteredData.map(r => 
      `"${r.name || r.fullName}","${r.rollNo}","${r.department}","${r.semester}","${r.eventName || r.event}","${r.email}","${r.phoneNumber}"`
    );
    
    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `CSS_Registry_${filterEvent}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success("CSV Manifest Extracted.");
  };

  const handlePrint = () => {
    toast.loading("Rendering Print Manifest...", { duration: 2000 });
    setTimeout(() => window.print(), 500);
  };

  const eventList = ["All", ...new Set(registrations.map(reg => reg.eventName || reg.event))];

  const filteredData = registrations.filter(reg => {
    const participantName = (reg.name || reg.fullName || "").toLowerCase();
    const roll = (reg.rollNo || "").toLowerCase();
    const matchesSearch = participantName.includes(searchTerm.toLowerCase()) || roll.includes(searchTerm.toLowerCase());
    const matchesEvent = filterEvent === "All" || (reg.eventName === filterEvent || reg.event === filterEvent);
    return matchesSearch && matchesEvent;
  });

  return (
    <div className="min-h-screen bg-[#020617] text-white overflow-x-hidden relative selection:bg-blue-500/30 font-sans">
      
      {/* Background Polish */}
      <div className="fixed inset-0 z-0 bg-[linear-gradient(to_right,#FFD70008_1px,transparent_1px),linear-gradient(to_bottom,#FFD70008_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="relative z-10 px-6 pt-32 pb-24 max-w-7xl mx-auto">
        
        {/* HEADER & OPERATIONS HUB */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-16 gap-6 no-print">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-5xl font-black tracking-tighter uppercase leading-none mb-4 italic">
              Mission <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] to-yellow-500 drop-shadow-2xl">Registry</span>
            </h1>
            <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.4em]">Participant Payload Logs: {filteredData.length} // Synchronized</p>
          </motion.div>

          <div className="flex flex-wrap items-center gap-4">
            <button onClick={() => navigate("/admin-dashboard")} className="px-6 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-[10px] font-black uppercase tracking-widest hover:border-blue-500/50 transition-all shadow-xl">
              Back to Command
            </button>
            <button onClick={downloadCSV} className="px-6 py-3 bg-emerald-600/10 text-emerald-500 border border-emerald-500/20 hover:bg-emerald-600 hover:text-white font-black uppercase rounded-2xl text-[10px] transition-all shadow-xl">
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
                  className="w-full px-6 py-5 rounded-2xl bg-slate-950/80 border border-slate-800 focus:border-blue-500/50 outline-none text-[11px] font-black uppercase tracking-widest transition-all placeholder:text-slate-900 shadow-inner"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="md:col-span-4 relative">
                <select 
                  className="w-full px-6 py-5 rounded-2xl bg-slate-950/80 border border-slate-800 focus:border-[#FFD700]/30 outline-none text-[10px] font-black uppercase tracking-widest cursor-pointer appearance-none text-white shadow-inner"
                  value={filterEvent}
                  onChange={(e) => setFilterEvent(e.target.value)}
                >
                  {eventList.map(ev => <option key={ev} value={ev} className="bg-slate-950">{ev === "All" ? "ALL MISSIONS" : ev.toUpperCase()}</option>)}
                </select>
                <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">▼</div>
            </div>
        </div>

        {/* MAINFRAME LEDGER */}
        <div className="bg-slate-900/40 backdrop-blur-3xl border border-slate-800 rounded-[3rem] shadow-3xl overflow-hidden relative">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#FFD700] to-transparent opacity-30 shadow-[0_0_10px_rgba(255,215,0,0.3)]" />
          
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
                    <th className="p-8">Node Index (Roll)</th>
                    <th className="p-8">Allocated Mission</th>
                    <th className="p-8">Uplink Protocol</th>
                    <th className="p-8 text-right no-print">Forensics</th>
                  </tr>
                </thead>
                <tbody className="text-[11px]">
                  <AnimatePresence>
                  {filteredData.length > 0 ? filteredData.map((reg) => (
                    <motion.tr 
                      key={reg._id}
                      layout
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                      whileHover={{ backgroundColor: 'rgba(59,130,246,0.03)' }}
                      className="border-b border-slate-800/30 transition-all group"
                    >
                      <td className="p-8">
                        <div className="font-black text-slate-200 uppercase tracking-tight group-hover:text-blue-400 transition-colors">
                          {reg.name || reg.fullName}
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
                          {reg.eventName || reg.event}
                        </span>
                      </td>
                      <td className="p-8">
                        <div className="font-black text-slate-500 group-hover:text-slate-300 transition-colors font-mono">{reg.email}</div>
                        <div className="text-[9px] text-slate-700 font-mono mt-1 italic">{reg.phoneNumber || "NO_TEL_SIGNAL"}</div>
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
          .bg-slate-900, .bg-slate-950, .backdrop-blur-3xl { background: none !important; border: 1px solid #ccc !important; }
          table { width: 100% !important; border-collapse: collapse !important; color: black !important; }
          th, td { border: 1px solid #ddd !important; padding: 12px !important; color: black !important; }
          .text-blue-500, .text-[#FFD700] { color: black !important; font-weight: bold !important; }
        }
      `}</style>
    </div>
  );
}