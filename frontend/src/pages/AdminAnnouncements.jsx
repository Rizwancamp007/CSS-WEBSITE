import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { API_URL } from "../App"; 

/**
 * @description News Broadcaster (Admin Interface)
 * Hardened for announcement lifecycle management.
 * Features real-time state synchronization and dual-frequency data retrieval.
 */
export default function AdminAnnouncements() {
  const [announcements, setAnnouncements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userPermissions, setUserPermissions] = useState(null);
  const [editId, setEditId] = useState(null); 
  
  const [formData, setFormData] = useState({
    title: "",
    date: "",
    type: "",
    description: "",
  });

  const navigate = useNavigate();
  const token = localStorage.getItem("token"); // Unified token key

  /**
   * @section Data Synchronization
   * Fetches the full ledger (including archived nodes) via the Admin endpoint.
   */
  const fetchAnnouncements = async () => {
    try {
      // Primary: High-Clearance Admin Endpoint
      let res = await fetch(`${API_URL}/announcements/admin/all`, {
        headers: { "Authorization": `Bearer ${token}` }
      });

      // Fallback: Public Frequency if Admin route fails
      if (!res.ok) res = await fetch(`${API_URL}/announcements`);

      const result = await res.json();
      
      // Extraction logic for the standardized { success, data } wrapper
      const list = result.data || result.announcements || (Array.isArray(result) ? result : []);
      setAnnouncements(list);
      
      // Permissions check for conditional rendering of the 'New Node' form
      const savedUserData = JSON.parse(localStorage.getItem("user") || "{}");
      setUserPermissions(savedUserData?.permissions);
      
    } catch (error) {
      toast.error("Frequency Sync Failed: Inaccessible Registry.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { 
    if (!token) navigate("/admin");
    else fetchAnnouncements(); 
  }, [token, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  /**
   * @section Edit Initialization
   * Pre-populates the broadcast form with existing node data.
   */
  const handleEdit = (item) => {
    setEditId(item._id);
    setFormData({
      title: item.title,
      type: item.type,
      description: item.description,
      date: item.date ? new Date(item.date).toISOString().split('T')[0] : ""
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetForm = () => {
    setEditId(null);
    setFormData({ title: "", date: "", type: "", description: "" });
  };

  /**
   * @section Transmission Logic
   * Handles both deployment (POST) and modification (PUT) of broadcast nodes.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    const loadToast = toast.loading(editId ? "Updating Node..." : "Broadcasting...");
    
    const url = editId ? `${API_URL}/announcements/${editId}` : `${API_URL}/announcements`;
    
    try {
      const response = await fetch(url, {
        method: editId ? "PUT" : "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
          throw new Error(data.message || "Transmission Refused by Mainframe.");
      }

      toast.success(editId ? "Entry Modified." : "Broadcast Deployed.", { id: loadToast });
      resetForm();
      fetchAnnouncements(); 
    } catch (error) {
      toast.error(error.message, { id: loadToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  /**
   * @section Archive Protocol
   * Toggles the visibility of the announcement on the public feed.
   */
  const toggleArchive = async (id) => {
    const loadToast = toast.loading("Syncing status...");
    try {
      const res = await fetch(`${API_URL}/announcements/archive/${id}`, {
        method: "PATCH",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (res.ok) {
        toast.success("Status Toggled.", { id: loadToast });
        fetchAnnouncements();
      } else {
        throw new Error();
      }
    } catch (error) {
      toast.error("Handshake Failed. Verify Archive Route.", { id: loadToast });
    }
  };

  const deleteAnnouncement = async (id) => {
    if(!window.confirm("PERMANENT PURGE? This cannot be undone.")) return;
    try {
      const response = await fetch(`${API_URL}/announcements/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        toast.success("Record Purged.");
        setAnnouncements(prev => prev.filter((a) => a._id !== id));
      }
    } catch (error) {
      toast.error("Purge Sequence Failed.");
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white overflow-x-hidden relative">
      {/* Background Polish */}
      <div className="fixed inset-0 z-0 w-full h-full bg-[linear-gradient(to_right,#FFD70008_1px,transparent_1px),linear-gradient(to_bottom,#FFD70008_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />
      
      <div className="relative z-10 px-6 pt-32 pb-24 max-w-7xl mx-auto">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-16 gap-6">
          <h1 className="text-5xl font-black tracking-tighter uppercase leading-none">News <span className="text-[#FFD700] italic">Broadcaster</span></h1>
          <button onClick={() => navigate("/admin-dashboard")} className="px-6 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-[10px] font-black uppercase tracking-widest hover:border-blue-500/50 transition-all shadow-xl">Back to Command</button>
        </div>

        <div className="grid lg:grid-cols-12 gap-12">
          {/* CONTROL PANEL */}
          <div className="lg:col-span-4">
            {userPermissions?.canManageAnnouncements && (
              <motion.div initial={{ x: -20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="bg-slate-900/40 backdrop-blur-3xl border border-slate-800 p-8 rounded-[2.5rem] shadow-2xl sticky top-32 overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-blue-600/50" />
                <div className="flex justify-between items-center mb-8">
                    <h2 className="text-lg font-black text-white uppercase tracking-tight">{editId ? "Modify Node" : "Deploy Node"}</h2>
                    {editId && <button onClick={resetForm} className="text-[9px] font-black text-red-500 uppercase tracking-widest hover:underline">Abort</button>}
                </div>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <input name="title" value={formData.title} onChange={handleChange} placeholder="HEADLINE" className="w-full px-5 py-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-bold focus:border-blue-500/50 outline-none transition-all placeholder:text-slate-800" required />
                  <div className="grid grid-cols-2 gap-4">
                    <select name="type" value={formData.type} onChange={handleChange} className="w-full px-4 py-4 rounded-2xl bg-slate-950 border border-slate-800 text-[10px] font-bold outline-none text-slate-400" required>
                      <option value="">CATEGORY</option>
                      <option value="Notice">Notice</option>
                      <option value="Update">Update</option>
                      <option value="Opportunity">Opportunity</option>
                    </select>
                    <input type="date" name="date" value={formData.date} onChange={handleChange} className="w-full px-4 py-4 rounded-2xl bg-slate-950 border border-slate-800 text-[10px] font-bold outline-none text-slate-400" required />
                  </div>
                  <textarea name="description" value={formData.description} onChange={handleChange} placeholder="BROADCAST CONTENT..." rows="4" className="w-full px-5 py-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs font-bold focus:border-blue-500/50 outline-none resize-none placeholder:text-slate-800" required />
                  <button type="submit" disabled={isSubmitting} className={`w-full py-4 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] transition-all shadow-lg ${editId ? 'bg-[#FFD700] text-black hover:bg-yellow-500' : 'bg-blue-600 text-white hover:bg-blue-500'}`}>
                    {isSubmitting ? "TRANSMITTING..." : editId ? "COMMIT CHANGES" : "INITIALIZE BROADCAST"}
                  </button>
                </form>
              </motion.div>
            )}
          </div>

          {/* BROADCAST REGISTRY */}
          <div className="lg:col-span-8 space-y-4">
            <AnimatePresence>
              {announcements.map((item) => (
                <motion.div key={item._id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }} className={`bg-slate-900/40 backdrop-blur-2xl border border-slate-800 p-8 rounded-[2.5rem] flex justify-between items-center transition-all group ${item.isArchived ? 'opacity-40 grayscale border-dashed' : 'hover:border-blue-500/30'}`}>
                  <div className="flex-1">
                    <div className="flex items-center gap-4 mb-3 text-[8px] font-black uppercase tracking-widest">
                      <span className={item.isArchived ? 'text-slate-500' : 'text-[#FFD700]'}>{item.type}</span>
                      <span className="text-slate-600 font-mono">{new Date(item.date).toDateString()}</span>
                      {item.isArchived && <span className="bg-red-500/10 text-red-500 px-2 py-0.5 rounded">Archived</span>}
                    </div>
                    <h3 className="text-xl font-black text-white uppercase mb-2 group-hover:text-blue-400 transition-colors">{item.title}</h3>
                    <p className="text-slate-500 text-sm line-clamp-1 font-medium">{item.description}</p>
                  </div>
                  <div className="flex gap-2 ml-6">
                    <button onClick={() => handleEdit(item)} className="p-3 rounded-2xl bg-blue-500/10 text-blue-400 hover:bg-blue-600 hover:text-white transition-all shadow-lg" title="Edit Node">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    <button onClick={() => toggleArchive(item._id)} className="p-3 rounded-2xl bg-slate-800 text-slate-400 hover:text-[#FFD700] transition-all shadow-lg" title={item.isArchived ? "Restore Node" : "Archive Node"}>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
                    </button>
                    <button onClick={() => deleteAnnouncement(item._id)} className="p-3 rounded-2xl bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-600 hover:text-white transition-all shadow-lg" title="Purge Node">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}