import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import toast from "react-hot-toast";
import { 
  fetchAdminEvents, 
  createEvent, 
  updateEvent, 
  deleteEvent as deleteApi,
  toggleArchiveEvent 
} from "../api"; 
import { useAuth } from "../context/AuthContext";

export default function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editId, setEditId] = useState(null); 
  const { hasPermission } = useAuth();
  
  const [formData, setFormData] = useState({ 
    title: "", 
    date: "", 
    description: "", 
    image: "",
    maxParticipants: 0, 
    location: "GCU Lahore"
  });
  
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState("ledger"); 
  const navigate = useNavigate();

  const loadEvents = async () => {
    try {
      const res = await fetchAdminEvents();
      setEvents(res.data?.data || []);
    } catch (error) {
      toast.error("Ledger Sync Failed.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadEvents(); }, []);

  const handleArchiveToggle = async (id) => {
    try {
      await toggleArchiveEvent(id);
      toast.success("Visibility updated.");
      loadEvents();
    } catch (err) {
      toast.error("Archive Protocol Failed.");
    }
  };

  /**
   * @section DATA EXPORT PROTOCOLS
   */
  const handlePrint = () => window.print();

  const handleDownloadCSV = () => {
    const headers = ["Title", "Date", "Location", "Registrations", "Status"];
    const rows = filteredEvents.map(e => [
      e.title,
      new Date(e.date).toLocaleDateString(),
      e.location,
      e.registrationCount,
      e.isArchived ? "Archived" : "Public"
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + headers.join(",") + "\n" 
      + rows.map(r => r.join(",")).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `mission_registry_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { ...formData, maxParticipants: parseInt(formData.maxParticipants) || 0 };
    const loadToast = toast.loading(editId ? "Updating..." : "Deploying...");

    try {
      if (editId) {
        await updateEvent(editId, payload);
        toast.success("Parameters Updated.", { id: loadToast });
      } else {
        await createEvent(payload);
        toast.success("Mission Deployed.", { id: loadToast });
      }
      resetForm();
      loadEvents(); 
    } catch (error) {
      toast.error("Operation failed.", { id: loadToast });
    }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("Purge this node?")) return;
    try {
      await deleteApi(id);
      toast.success("Node Purged.");
      setEvents(prev => prev.filter(ev => ev._id !== id));
    } catch (e) { toast.error("Wipe failed."); }
  };

  const handleEdit = (event) => {
    setEditId(event._id);
    setFormData({
      title: event.title,
      date: event.date ? new Date(event.date).toISOString().split('T')[0] : "",
      description: event.description,
      image: event.image || "",
      maxParticipants: event.maxParticipants || 0,
      location: event.location || "GCU Lahore"
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditId(null);
    setFormData({ title: "", date: "", description: "", image: "", maxParticipants: 0, location: "GCU Lahore" });
  };

  const filteredEvents = events.filter(e => 
    e.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 md:p-12 relative overflow-x-hidden">
      <div className="fixed inset-0 z-0 bg-[linear-gradient(to_right,#FFD70008_1px,transparent_1px),linear-gradient(to_bottom,#FFD70008_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

      <div className="max-w-7xl mx-auto mt-24 relative z-10">
        
        {/* --- 1. COMMAND HEADER --- */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12 gap-6 no-print">
          <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
            <Link to="/admin-dashboard" className="group flex items-center gap-4">
               <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center text-[#FFD700] group-hover:border-[#FFD700]/50 transition-all">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
               </div>
               <h1 className="text-4xl font-black tracking-tighter uppercase leading-none italic">Mission <span className="text-[#FFD700]">Control</span></h1>
            </Link>
          </motion.div>

          <div className="flex items-center gap-3">
            <button onClick={() => setViewMode(viewMode === "grid" ? "ledger" : "grid")} className="px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
              {viewMode === "grid" ? "Master Ledger" : "Grid Interface"}
            </button>
          </div>
        </div>

        {/* --- 2. EVENT MANAGING BOX --- */}
        {hasPermission("canManageEvents") && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900/40 backdrop-blur-3xl border border-slate-800 p-10 rounded-[3rem] mb-12 relative overflow-hidden no-print shadow-2xl">
            <div className="absolute top-0 left-0 w-2 h-full bg-blue-600/50" />
            <h2 className="text-xl font-black uppercase mb-8 tracking-tight flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
              {editId ? "Modify Mission Node" : "Broadcast New Mission"}
            </h2>
            <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-6">
              <input className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl p-5 text-xs font-bold focus:border-blue-500 outline-none" placeholder="MISSION TITLE" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
              <input type="date" className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl p-5 text-xs font-bold focus:border-blue-500 outline-none text-slate-400" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required />
              <input className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl p-5 text-xs font-bold focus:border-blue-500 outline-none" placeholder="ASSET URL (IMAGE)" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} />
              <input type="number" className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl p-5 text-xs font-bold focus:border-blue-500 outline-none" placeholder="MAX CAPACITY" value={formData.maxParticipants} onChange={e => setFormData({...formData, maxParticipants: e.target.value})} />
              <textarea className="md:col-span-2 w-full bg-slate-950/80 border border-slate-800 rounded-2xl p-5 text-xs font-bold focus:border-blue-500 outline-none h-32 resize-none" placeholder="MISSION BRIEFING..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required />
              <div className="md:col-span-2 flex gap-4">
                <button type="submit" className={`flex-grow py-5 rounded-2xl font-black uppercase tracking-[0.3em] text-[11px] transition-all shadow-xl ${editId ? "bg-[#FFD700] text-black" : "bg-blue-600 text-white hover:bg-blue-500"}`}>
                  {editId ? "Commit Changes" : "Deploy Mission"}
                </button>
                {editId && <button onClick={resetForm} type="button" className="px-10 rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20 font-black uppercase text-[10px]">Abort</button>}
              </div>
            </form>
          </motion.div>
        )}

        {/* --- 3. UNIFIED UTILITY BAR (Search, Print, CSV) --- */}
        {/* Positioned below managing box to ensure results are visible immediately */}
        <div className="bg-slate-900/60 backdrop-blur-md p-4 rounded-3xl border border-slate-800 shadow-2xl flex flex-col md:flex-row gap-4 no-print mb-8">
          <div className="relative flex-grow flex items-center">
            <span className="absolute left-6 text-slate-500 font-black text-[10px]">SEARCH:</span>
            <input 
              type="text" 
              placeholder="FILTER BY MISSION TITLE (E.G. 'AI', 'WEB')..." 
              className="w-full bg-slate-950 border border-slate-800 rounded-2xl pl-20 pr-6 py-4 text-[11px] font-black focus:border-[#FFD700]/40 outline-none placeholder:text-slate-800" 
              value={searchQuery} 
              onChange={(e) => setSearchQuery(e.target.value)} 
            />
          </div>
          <div className="flex gap-2">
            <button onClick={handlePrint} className="px-6 py-4 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all flex items-center gap-2">
              <span>🖨️</span> Print
            </button>
            <button onClick={handleDownloadCSV} className="px-6 py-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all flex items-center gap-2">
              <span>📊</span> CSV
            </button>
          </div>
        </div>

        {/* --- 4. REGISTRY RESULTS --- */}
        <div id="printable-registry" className="bg-slate-900/40 backdrop-blur-3xl border border-slate-800 rounded-[3rem] overflow-hidden shadow-2xl">
          {viewMode === "ledger" ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-800/40 text-slate-600 text-[10px] font-black uppercase tracking-[0.4em] border-b border-slate-800/50">
                    <th className="p-8">Date</th>
                    <th className="p-8">Mission</th>
                    <th className="p-8">Status</th>
                    <th className="p-8 text-right no-print">Ops</th>
                  </tr>
                </thead>
                <tbody className="text-xs">
                  {filteredEvents.map(event => (
                    <tr key={event._id} className={`${event.isArchived ? "opacity-40 grayscale" : ""} border-t border-slate-800/30`}>
                      <td className="p-8 text-slate-500 font-mono italic">{new Date(event.date).toLocaleDateString('en-GB')}</td>
                      <td className="p-8 font-black uppercase text-slate-200">{event.title}</td>
                      <td className="p-8">
                        <button onClick={() => handleArchiveToggle(event._id)} className={`no-print px-3 py-1 rounded-lg text-[8px] font-black uppercase transition-all ${event.isArchived ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'}`}>
                          {event.isArchived ? 'Archived' : 'Public'}
                        </button>
                        <span className="hidden print:inline text-black font-bold text-[8px]">[{event.isArchived ? 'Archived' : 'Public'}]</span>
                      </td>
                      <td className="p-8 text-right no-print">
                        <div className="flex justify-end gap-6 font-black text-[10px] tracking-widest uppercase">
                          <button onClick={() => handleEdit(event)} className="text-blue-500 hover:text-white transition-all">Edit</button>
                          <button onClick={() => handleDelete(event._id)} className="text-red-600 hover:text-white transition-all">Purge</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 p-12">
                {filteredEvents.map(event => (
                  <div key={event._id} className={`bg-slate-950/60 p-8 rounded-[2.5rem] border border-slate-800 flex flex-col ${event.isArchived ? "opacity-50 grayscale" : "shadow-2xl"}`}>
                    <div className="flex justify-between items-start mb-6 no-print">
                        <button 
                          onClick={() => handleArchiveToggle(event._id)} 
                          className={`px-4 py-1.5 rounded-xl text-[9px] font-black uppercase transition-all ${event.isArchived ? 'bg-red-500/20 text-red-400 border border-red-500/30' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'}`}
                        >
                          {event.isArchived ? 'Archived' : 'Public'}
                        </button>
                    </div>
                    <h3 className="text-2xl font-black text-white uppercase italic mb-2 print:text-black">{event.title}</h3>
                    <p className="text-[10px] text-slate-500 font-black mb-10 print:text-black">{new Date(event.date).toDateString()}</p>
                    <div className="mt-auto flex gap-4 no-print">
                        <button onClick={() => handleEdit(event)} className="flex-grow bg-blue-600/10 text-blue-400 py-3.5 rounded-2xl text-[10px] font-black uppercase">Edit</button>
                        <button onClick={() => handleDelete(event._id)} className="flex-grow bg-red-600/10 text-red-500 py-3.5 rounded-2xl text-[10px] font-black uppercase">Purge</button>
                    </div>
                  </div>
                ))}
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media print {
          .no-print, .fixed, form, button { display: none !important; }
          #printable-registry { background: white !important; color: black !important; border: 1px solid #000 !important; border-radius: 0 !important; margin-top: 0 !important; }
          table { width: 100% !important; border-collapse: collapse !important; }
          th, td { color: black !important; border-bottom: 1px solid #000 !important; padding: 12px !important; }
          body { background: white !important; padding: 0 !important; }
        }
      `}</style>
    </div>
  );
}