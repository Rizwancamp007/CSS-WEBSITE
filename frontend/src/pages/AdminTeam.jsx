import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // FIXED: Integrated Centralized Auth
import toast from "react-hot-toast";
import { API_URL } from "../App"; 

/**
 * @description Board Command (Team Management)
 * Purpose: Oversight of the society's leadership hierarchy.
 * Hardened with real-time rank sorting and clearance-based form rendering.
 */
export default function AdminTeam() {
  const [team, setTeam] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editId, setEditId] = useState(null);
  const { user, hasPermission } = useAuth(); // FIXED: Using global auth state
  const navigate = useNavigate();
  const token = localStorage.getItem("token"); // Standardized key
  
  const [formData, setFormData] = useState({
    name: "",
    role: "",
    image: "",
    hierarchy: 10,
    linkedin: "",
    instagram: "",
    description: ""
  });

  /**
   * @section Hierarchy Synchronization
   * Fetches board data and sorts by the Hierarchy Index (Rank 1 = Highest).
   */
  const fetchTeam = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_URL}/team`, {
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        }
      });
      
      const result = await res.json();
      const list = result.data || (Array.isArray(result) ? result : []);
      
      // Sort Logic: Rank 1 (President) -> Rank 99 (Council)
      setTeam(list.sort((a, b) => a.hierarchy - b.hierarchy));
    } catch (error) {
      toast.error("Hierarchy Sync Failed: Database link unstable.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    if (!token) navigate("/admin");
    else fetchTeam(); 
  }, [token]);

  const handleEdit = (member) => {
    setEditId(member._id);
    setFormData({
      name: member.name,
      role: member.role,
      image: member.image || "",
      hierarchy: member.hierarchy || 10,
      linkedin: member.linkedin || "",
      instagram: member.instagram || "",
      description: member.description || ""
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditId(null);
    setFormData({ name: "", role: "", image: "", hierarchy: 10, linkedin: "", instagram: "", description: "" });
  };

  /**
   * @section Appointment Protocol
   * Handles the confirmed enrollment of new executive board nodes.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name || !formData.role) return toast.error("Identity credentials missing.");

    setIsSubmitting(true);
    const loadToast = toast.loading(editId ? "Modifying Node..." : "Processing Appointment...");

    try {
      const url = editId ? `${API_URL}/team/${editId}` : `${API_URL}/team`;
      const method = editId ? "PUT" : "POST";

      const res = await fetch(url, {
        method: method,
        headers: { 
          "Content-Type": "application/json", 
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        toast.success(editId ? "Node Modified." : "Executive Appointed.", { id: loadToast });
        resetForm();
        fetchTeam(); 
      } else {
        toast.error("Operation Denied by Mainframe.", { id: loadToast });
      }
    } catch (error) {
      toast.error("Uplink Interrupted.", { id: loadToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteMember = async (id) => {
    if (!window.confirm("PERMANENT PURGE: Erase this executive node from history?")) return;
    try {
      const res = await fetch(`${API_URL}/team/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (res.ok) {
        toast.success("Identity Purged from Registry.");
        setTeam(prev => prev.filter(m => m._id !== id));
      }
    } catch (error) {
      toast.error("Bridge Connection Error.");
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white p-6 md:p-12 relative overflow-x-hidden font-sans selection:bg-blue-500/30">
      
      {/* Background Grid Infrastructure */}
      <div className="fixed inset-0 z-0 bg-[linear-gradient(to_right,#FFD70008_1px,transparent_1px),linear-gradient(to_bottom,#FFD70008_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="max-w-7xl mx-auto mt-24 relative z-10">
        
        {/* HEADER TERMINAL */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-16 gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-5xl font-black tracking-tighter uppercase leading-none italic">
                Board <span className="text-[#FFD700]">Command</span>
            </h1>
            <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.4em] mt-4 flex items-center gap-2">
              <span className="w-8 h-px bg-slate-800"></span> Executive Hierarchy Management Terminal
            </p>
          </motion.div>

          <button onClick={() => navigate("/admin-dashboard")} className="group flex items-center gap-3 px-8 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-[10px] font-black uppercase tracking-widest hover:border-blue-500/40 transition-all shadow-xl">
            Return to Command
          </button>
        </div>
        
        {/* DEPLOYMENT CONSOLE (Conditional) */}
        {hasPermission('canManageTeams') ? (
          <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="bg-slate-900/40 backdrop-blur-3xl border border-slate-800 p-8 md:p-10 rounded-[3rem] mb-16 shadow-3xl relative overflow-hidden transition-all duration-500">
            <div className="absolute top-0 left-0 w-full h-1 bg-blue-600/50 shadow-[0_0_15px_rgba(37,99,235,0.5)]" />
            <div className="flex justify-between items-center mb-10">
                <h2 className="text-xl font-black uppercase tracking-tight italic">{editId ? "Modify Executive Parameters" : "Appoint New Executive"}</h2>
                {editId && <button onClick={resetForm} className="text-[9px] font-black text-red-500 uppercase tracking-widest hover:underline">Abort Protocol</button>}
            </div>

            <form onSubmit={handleSubmit} className="grid lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 grid md:grid-cols-2 gap-6">
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-slate-700 tracking-widest ml-1">Personnel Name</label>
                    <input className="w-full bg-slate-950/80 border border-slate-800 p-4 rounded-2xl text-xs font-bold text-white focus:border-blue-500/50 outline-none transition-all placeholder:text-slate-900" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} required />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-slate-700 tracking-widest ml-1">Official Designation</label>
                    <input className="w-full bg-slate-950/80 border border-slate-800 p-4 rounded-2xl text-xs font-bold text-white focus:border-blue-500/50 outline-none transition-all placeholder:text-slate-900" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} required />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-slate-700 tracking-widest ml-1">Hierarchy Index (Rank)</label>
                    <input className="w-full bg-slate-950/80 border border-slate-800 p-4 rounded-2xl text-xs font-bold text-white focus:border-blue-500/50 outline-none transition-all" type="number" value={formData.hierarchy} onChange={e => setFormData({...formData, hierarchy: e.target.value})} />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-slate-700 tracking-widest ml-1">Visual Resource (Image URL)</label>
                    <input className="w-full bg-slate-950/80 border border-slate-800 p-4 rounded-2xl text-xs font-bold text-white focus:border-blue-500/50 outline-none transition-all placeholder:text-slate-900" value={formData.image} onChange={e => setFormData({...formData, image: e.target.value})} />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-slate-700 tracking-widest ml-1">LinkedIn Frequency</label>
                    <input className="w-full bg-slate-950/80 border border-slate-800 p-4 rounded-2xl text-xs font-bold text-white focus:border-[#FFD700]/30 outline-none transition-all placeholder:text-slate-900" value={formData.linkedin} onChange={e => setFormData({...formData, linkedin: e.target.value})} />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase text-slate-700 tracking-widest ml-1">Instagram Uplink</label>
                    <input className="w-full bg-slate-950/80 border border-slate-800 p-4 rounded-2xl text-xs font-bold text-white focus:border-[#FFD700]/30 outline-none transition-all placeholder:text-slate-900" value={formData.instagram} onChange={e => setFormData({...formData, instagram: e.target.value})} />
                  </div>
              </div>

              <div className="lg:col-span-1 flex flex-col gap-6">
                  <div className="flex-grow space-y-1">
                    <label className="text-[9px] font-black uppercase text-slate-700 tracking-widest ml-1">Personnel Description</label>
                    <textarea className="w-full h-40 bg-slate-950/80 border border-slate-800 p-4 rounded-2xl text-xs font-bold text-white focus:border-blue-500/50 outline-none resize-none placeholder:text-slate-900" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})}></textarea>
                  </div>
                  <button disabled={isSubmitting} className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] transition-all shadow-xl ${editId ? 'bg-[#FFD700] text-black hover:bg-yellow-500' : 'bg-blue-600 text-white hover:bg-blue-500'}`}>
                    {isSubmitting ? "TRANSMITTING..." : editId ? "COMMIT CHANGES" : "CONFIRM APPOINTMENT"}
                  </button>
              </div>
            </form>
          </motion.div>
        ) : (
          <div className="bg-slate-900/20 border border-dashed border-slate-800 p-10 rounded-[3rem] text-center mb-16 opacity-40 italic text-[10px] font-black uppercase tracking-widest">
            Identity Unverified: Administrative Clearance Level Insufficient
          </div>
        )}

        {/* HIERARCHY REGISTRY (Grid View) */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
          {loading ? (
             <div className="col-span-full py-20 flex flex-col items-center gap-4 text-slate-800 font-black uppercase tracking-[0.4em] text-[10px]">
                <div className="w-10 h-10 border-4 border-t-[#FFD700] border-slate-900 rounded-full animate-spin"></div>
                Scanning Hierarchy...
             </div>
          ) : (
            <AnimatePresence>
              {team.map((m) => (
                <motion.div layout key={m._id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} whileHover={{ y: -5, borderColor: 'rgba(37,99,235,0.4)' }} className="group bg-slate-950/60 backdrop-blur-2xl p-6 rounded-[2.5rem] border border-slate-800 transition-all duration-500 text-center relative overflow-hidden shadow-2xl">
                  <div className="absolute top-4 right-4 text-[7px] bg-slate-900 border border-slate-800 px-2 py-0.5 rounded-full text-slate-600 font-black">NODE_RANK_{m.hierarchy}</div>
                  <div className="relative w-20 h-20 mx-auto mb-6">
                    <img src={m.image} className="w-full h-full rounded-full object-cover border-4 border-slate-800 group-hover:border-blue-500/50 transition-all grayscale group-hover:grayscale-0 shadow-xl" onError={(e) => e.target.src = "https://via.placeholder.com/150?text=NODE"} />
                  </div>
                  <h3 className="font-black text-xs uppercase tracking-tight text-white mb-1 truncate">{m.name}</h3>
                  <p className="text-[8px] text-blue-500 font-black uppercase tracking-widest mb-6 italic">{m.role}</p>
                  
                  {hasPermission('canManageTeams') && (
                    <div className="flex gap-4 pt-4 border-t border-slate-800/50 mt-auto">
                        <button onClick={() => handleEdit(m)} className="flex-1 text-[8px] font-black uppercase text-slate-600 hover:text-blue-400 transition-colors tracking-widest">Edit</button>
                        <button onClick={() => deleteMember(m._id)} className="flex-1 text-[8px] font-black uppercase text-slate-600 hover:text-red-500 transition-colors tracking-widest">Purge</button>
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}