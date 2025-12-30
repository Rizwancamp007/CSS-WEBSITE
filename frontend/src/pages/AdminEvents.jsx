import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { API_URL } from "../App"; 

/**
 * @description Mission Operations Center (Admin Events)
 * Hardened for lifecycle management of society events.
 * Features dual-view ledger systems and real-time status toggling.
 */
export default function AdminEvents() {
  const [events, setEvents] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [editId, setEditId] = useState(null); 
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
  const [userPermissions, setUserPermissions] = useState(null);
  
  const navigate = useNavigate();
  const token = localStorage.getItem("token"); // Unified token key

  /**
   * @section Ledger Synchronization
   * Fetches the full mission history including archived nodes.
   */
  const fetchEvents = async () => {
    try {
      const res = await fetch(`${API_URL}/events/admin/all`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      const result = await res.json();
      
      // Standardized extraction from { success, data }
      const list = result.data || (Array.isArray(result) ? result : []);
      setEvents(list);
      
      const savedUserData = JSON.parse(localStorage.getItem("user") || "{}");
      setUserPermissions(savedUserData?.permissions);
      
    } catch (error) {
      toast.error("Ledger Sync Failed: Mainframe Unreachable.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    if (!token) navigate("/admin");
    else fetchEvents(); 
  }, [token, navigate]);

  /**
   * @section Deployment Logic
   * Handles initialization of new missions or modification of existing nodes.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.description) return toast.error("Transmission rejected: Insufficient Data.");

    const payload = {
      ...formData,
      maxParticipants: parseInt(formData.maxParticipants) || 0,
      image: formData.image || "/assets/images/placeholder.jpg"
    };

    const url = editId ? `${API_URL}/events/${editId}` : `${API_URL}/events`;
    const method = editId ? "PUT" : "POST";
    const loadToast = toast.loading(editId ? "Updating Node..." : "Broadcasting Mission...");

    try {
      const res = await fetch(url, {
        method: method,
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(payload) 
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(editId ? "Parameters Updated." : "Mission Deployed.", { id: loadToast });
        resetForm();
        fetchEvents(); 
      } else {
        toast.error(data.message || "Operation failed.", { id: loadToast });
      }
    } catch (error) {
      toast.error("Bridge Connection Lost.", { id: loadToast });
    }
  };

  const handleArchive = async (id) => {
    const loadToast = toast.loading("Modifying Node Visibility...");
    try {
      const res = await fetch(`${API_URL}/events/archive/${id}`, {
        method: "PATCH",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if(res.ok) {
        toast.success("Visibility Status Toggled.", { id: loadToast });
        fetchEvents();
      }
    } catch (e) { toast.error("Archive Failed.", { id: loadToast }); }
  };

  const handleDelete = async (id) => {
    if(!window.confirm("CRITICAL: Permanent wipe requested. Purge this node?")) return;
    try {
      const res = await fetch(`${API_URL}/events/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if(res.ok) {
        toast.success("Node Purged from Mainframe.");
        setEvents(prev => prev.filter(ev => ev._id !== id));
      }
    } catch (e) { toast.error("Wipe failed."); }
  };

  const handleEdit = (event) => {
    setEditId(event._id);
    const formattedDate = event.date ? new Date(event.date).toISOString().split('T')[0] : "";
    setFormData({
      title: event.title,
      date: formattedDate,
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
    <div className="min-h-screen bg-[#020617] text-white p-6 md:p-12 relative overflow-x-hidden selection:bg-blue-500/30">
      
      {/* Background Infrastructure */}
      <div className="fixed inset-0 z-0 bg-[linear-gradient(to_right,#FFD70008_1px,transparent_1px),linear-gradient(to_bottom,#FFD70008_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto mt-24 relative z-10">
        
        {/* COMMAND HEADER */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-16 gap-6">
          <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }}>
            <h1 className="text-5xl font-black tracking-tighter uppercase leading-none mb-2">Event <span className="text-[#FFD700] italic">Ledger</span></h1>
            <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.4em]">Administrative Sector // Operations Active</p>
          </motion.div>

          <div className="flex flex-wrap items-center gap-4 w-full lg:w-auto">
            <button onClick={() => navigate("/admin-dashboard")} className="px-6 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-[10px] font-black uppercase tracking-widest hover:border-blue-500/50 transition-all shadow-xl">Back to Command</button>
            <input type="text" placeholder="FILTER LEDGER..." className="flex-grow lg:w-64 bg-slate-950/80 border border-slate-800 rounded-2xl px-6 py-3 text-[10px] font-black focus:border-[#FFD700]/40 outline-none transition-all placeholder:text-slate-900" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            <button onClick={() => setViewMode(viewMode === "grid" ? "ledger" : "grid")} className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#FFD700] to-yellow-600 text-black text-[10px] font-black uppercase tracking-widest shadow-xl">
              {viewMode === "grid" ? "Master Ledger" : "Grid Interface"}
            </button>
          </div>
        </div>

        {/* MISSION DEPLOYMENT CONSOLE */}
        {userPermissions?.canManageEvents && (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900/40 backdrop-blur-3xl border border-slate-800 p-10 rounded-[3rem] mb-16 shadow-2xl relative overflow-hidden transition-all group">
            <div className="absolute top-0 left-0 w-2 h-full bg-blue-600/50" />
            <h2 className="text-xl font-black uppercase mb-10 tracking-tight flex items-center gap-3">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse shadow-[0_0_10px_rgba(59,130,246,1)]"></span>
              {editId ? "Modify Mission Parameters" : "Broadcast New Mission"}
            </h2>
            <form onSubmit={handleSubmit} className="grid md:grid-cols-2 gap-8">
              <input className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl p-5 text-xs font-bold focus:border-blue-500 outline-none transition-all placeholder:text-slate-900" placeholder="MISSION TITLE" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} required />
              <input type="date" className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl p-5 text-xs font-bold focus:border-blue-500 outline-none transition-all text-slate-400" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} required />
              <input className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl p-5 text-xs font-bold focus:border-blue-500 outline-none transition-all placeholder:text-slate-900" placeholder="ASSET URL (IMAGE)" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} />
              <input type="number" className="w-full bg-slate-950/80 border border-slate-800 rounded-2xl p-5 text-xs font-bold focus:border-blue-500 outline-none transition-all placeholder:text-slate-900" placeholder="MAX UPLINKS (CAPACITY)" value={formData.maxParticipants} onChange={e => setFormData({...formData, maxParticipants: e.target.value})} />
              <textarea className="md:col-span-2 w-full bg-slate-950/80 border border-slate-800 rounded-2xl p-5 text-xs font-bold focus:border-blue-500 outline-none h-32 resize-none transition-all placeholder:text-slate-900" placeholder="MISSION BRIEFING..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} required />
              <div className="md:col-span-2 flex gap-4">
                <button type="submit" className={`flex-grow py-5 rounded-2xl font-black uppercase tracking-[0.3em] text-[11px] transition-all shadow-xl ${editId ? "bg-[#FFD700] text-black" : "bg-blue-600 text-white hover:bg-blue-500"}`}>
                  {editId ? "Commit Changes" : "Deploy Mission"}
                </button>
                {editId && <button onClick={resetForm} type="button" className="px-10 rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20 font-black uppercase tracking-widest text-[10px]">Abort</button>}
              </div>
            </form>
          </motion.div>
        )}

        {/* REGISTRY DATA DISPLAY */}
        <div className="bg-slate-900/40 backdrop-blur-3xl border border-slate-800 rounded-[3rem] overflow-hidden shadow-2xl transition-all">
          {viewMode === "ledger" ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-800/40 text-slate-600 text-[10px] font-black uppercase tracking-[0.4em] border-b border-slate-800/50">
                    <th className="p-8">Timestamp</th>
                    <th className="p-8">Mission Node</th>
                    <th className="p-8">Occupancy</th>
                    <th className="p-8 text-right">Operations</th>
                  </tr>
                </thead>
                <tbody className="text-xs">
                  {filteredEvents.map(event => (
                    <motion.tr key={event._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`border-t border-slate-800/30 hover:bg-white/[0.02] transition-all ${event.isArchived ? "opacity-40 grayscale" : ""}`}>
                      <td className="p-8 text-slate-500 font-mono italic">{new Date(event.date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</td>
                      <td className="p-8">
                          <div className="font-black text-slate-200 uppercase tracking-tight">{event.title}</div>
                          <div className="text-[9px] text-slate-600 uppercase font-black tracking-widest mt-1">{event.location}</div>
                      </td>
                      <td className="p-8">
                        <div className="flex flex-col gap-1">
                          <span className="text-[10px] font-black text-blue-400">{event.registrationCount} / {event.maxParticipants || "∞"}</span>
                          <div className="w-24 h-1 bg-slate-800 rounded-full overflow-hidden">
                            <div className="h-full bg-blue-500" style={{ width: `${(event.registrationCount / (event.maxParticipants || 100)) * 100}%` }} />
                          </div>
                        </div>
                      </td>
                      <td className="p-8 text-right">
                        <div className="flex justify-end gap-6 uppercase font-black text-[10px] tracking-widest">
                          <button onClick={() => handleEdit(event)} className="text-blue-500 hover:text-white transition-all">Modify</button>
                          <button onClick={() => handleArchive(event._id)} className="text-amber-600 hover:text-white transition-all">{event.isArchived ? "Restore" : "Archive"}</button>
                          <button onClick={() => handleDelete(event._id)} className="text-red-600 hover:text-white transition-all">Purge</button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10 p-12">
              <AnimatePresence>
                {filteredEvents.map(event => (
                  <motion.div key={event._id} layout whileHover={{ borderColor: 'rgba(255,215,0,0.4)', y: -8 }} className={`bg-slate-950/60 p-8 rounded-[2.5rem] border transition-all duration-500 relative overflow-hidden flex flex-col ${event.isArchived ? "border-amber-900/50 opacity-50 grayscale" : "border-slate-800 shadow-2xl"}`}>
                    <div className="flex justify-between items-start mb-8">
                      <span className="text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-600">CAP: {event.maxParticipants || "∞"}</span>
                      {event.isArchived && <span className="text-[9px] text-amber-500 font-black uppercase tracking-widest bg-amber-500/10 px-3 py-1.5 rounded-xl border border-amber-500/20">ARCHIVED</span>}
                    </div>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-2 leading-none italic">{event.title}</h3>
                    <p className="text-[10px] text-slate-700 font-black uppercase tracking-widest mb-10">{new Date(event.date).toDateString()}</p>
                    
                    <div className="mt-auto grid grid-cols-2 gap-4">
                      <button onClick={() => handleEdit(event)} className="bg-blue-600/10 text-blue-400 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all">Edit</button>
                      <button onClick={() => handleArchive(event._id)} className={`py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${event.isArchived ? "bg-emerald-600/10 text-emerald-400" : "bg-amber-600/10 text-amber-500"} hover:text-white shadow-lg`}>
                          {event.isArchived ? "Restore" : "Archive"}
                      </button>
                      <button onClick={() => handleDelete(event._id)} className="col-span-2 bg-red-600/10 text-red-500 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-red-600 hover:text-white transition-all shadow-xl">Purge Node</button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}