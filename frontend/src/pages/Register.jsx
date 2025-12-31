import { useState, useEffect } from "react";
import { useParams } from "react-router-dom"; 
import { motion, AnimatePresence } from "framer-motion";
import toast from 'react-hot-toast';
import { fetchEvents, registerForEvent } from "../api"; 

/**
 * @description Secure Enrollment Terminal (Register Page)
 * FIXED: Mission selection logic to prevent "Entry Suspended" on archived but active nodes.
 */
export default function Register() {
  const { eventId: preSelectedId } = useParams(); 
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    rollNo: "",
    phoneNumber: "",
    department: "",
    semester: "",
    eventId: preSelectedId || "", 
  });

  const [eventsList, setEventsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  /**
   * @section Mission Frequency Sync
   */
  useEffect(() => {
    const loadActiveMissions = async () => {
      try {
        const res = await fetchEvents();
        const list = res.data?.data || [];
        
        /**
         * PROTOCOL UPDATE: 
         * We now show any event that isn't explicitly closed for registration.
         * Even if an event is "Archived" from the main grid, students can still 
         * register if they have the link, unless the date has passed.
         */
        const activeMissions = list.filter(ev => {
            const eventDate = new Date(ev.date);
            const today = new Date();
            // Show if registration is not manually closed AND date is not in the past
            return ev.registrationOpen !== false && eventDate >= today.setHours(0,0,0,0);
        });

        setEventsList(activeMissions);

        // If a pre-selected ID is invalid or closed, notify the user
        if (preSelectedId && !activeMissions.find(e => e._id === preSelectedId)) {
            toast.error("MISSION_EXPIRED: The requested entry node is no longer accepting uplinks.");
        }
      } catch (err) {
        console.error("MISSION_SYNC_FAILURE: Frequency unstable.");
      } finally {
        setLoading(false);
      }
    };
    loadActiveMissions();
  }, [preSelectedId]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  /**
   * @section Enrollment Protocol
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.rollNo || !formData.email || !formData.eventId) {
        return toast.error("Essential identifiers (Name, Roll, Email, Mission) missing.");
    }

    setIsSubmitting(true);
    const loadToast = toast.loading("Establishing Uplink...");

    try {
      const payload = {
        ...formData,
        rollNo: formData.rollNo.toUpperCase().trim(),
        email: formData.email.toLowerCase().trim()
      };

      const res = await registerForEvent(payload);

      if (res.data?.success) {
        toast.success("Mission Enrollment Confirmed!", { id: loadToast });
        setFormData({
          name: "", email: "", rollNo: "", phoneNumber: "",
          department: "", semester: "", eventId: "",
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      const msg = err.response?.data?.message || "Registration Protocol Refused.";
      toast.error(msg, { id: loadToast });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white relative selection:bg-blue-500/30 overflow-x-hidden font-sans">
      <div className="fixed inset-0 z-0 bg-[linear-gradient(to_right,#FFD70008_1px,transparent_1px),linear-gradient(to_bottom,#FFD70008_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />
      
      <div className="relative z-10 px-6 pt-40 pb-24 max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="inline-block px-5 py-2 rounded-full border border-blue-500/20 bg-blue-500/5 text-blue-400 text-[10px] font-black uppercase tracking-[0.4em] mb-8 shadow-xl italic">
            SECURE_ENROLLMENT_NODE
          </motion.div>
          <h1 className="text-6xl md:text-7xl font-black tracking-tighter uppercase leading-none mb-6 italic">
            Event <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] to-yellow-500 drop-shadow-3xl">Registry</span>
          </h1>
        </div>

        {loading ? (
            <div className="text-center py-20 flex flex-col items-center gap-4">
                <div className="w-10 h-10 border-4 border-t-[#FFD700] border-slate-900 rounded-full animate-spin"></div>
                <p className="text-slate-800 font-black uppercase text-[9px] tracking-widest">Scanning Active Missions...</p>
            </div>
        ) : (
            <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-900/40 backdrop-blur-3xl p-10 md:p-14 rounded-[3rem] border border-slate-800 shadow-3xl relative overflow-hidden transition-all duration-500 hover:border-[#FFD700]/20"
            >
            <div className="absolute top-0 right-14 w-24 h-1 bg-[#FFD700] shadow-[0_0_15px_rgba(255,215,0,0.5)]" />
            
            {eventsList.length === 0 ? (
                <div className="text-center py-10">
                    <p className="text-slate-500 font-black uppercase text-xs tracking-widest">No active mission uplinks available at this time.</p>
                    <button onClick={() => window.location.href='/'} className="mt-6 text-[10px] font-black uppercase text-blue-500 underline">Return to Mainframe</button>
                </div>
            ) : (
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
                <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-700 ml-2">Identify Name</label>
                    <input name="name" value={formData.name} onChange={handleChange} placeholder="FULL NAME" className="w-full bg-slate-950/80 border border-slate-800 p-5 rounded-2xl text-xs font-bold text-white focus:border-blue-500/50 outline-none transition-all" required />
                </div>

                <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-700 ml-2">Node ID (Roll No)</label>
                    <input name="rollNo" value={formData.rollNo} onChange={handleChange} placeholder="0001-BSCS-24" className="w-full bg-slate-950/80 border border-slate-800 p-5 rounded-2xl text-xs font-black font-mono text-white focus:border-blue-500/50 outline-none transition-all uppercase" required />
                </div>

                <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-700 ml-2">Comm-Link (Email)</label>
                    <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="ravian@gmail.com" className="w-full bg-slate-950/80 border border-slate-800 p-5 rounded-2xl text-xs font-bold text-white focus:border-blue-500/50 outline-none transition-all" required />
                </div>

                <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-700 ml-2">Signal Frequency (WhatsApp)</label>
                    <input name="phoneNumber" value={formData.phoneNumber} onChange={handleChange} placeholder="03XXXXXXXXX" className="w-full bg-slate-950/80 border border-slate-800 p-5 rounded-2xl text-xs font-bold text-white focus:border-blue-500/50 outline-none transition-all" />
                </div>

                <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-700 ml-2">Sector (Department)</label>
                    <input name="department" value={formData.department} onChange={handleChange} placeholder="COMPUTER SCIENCE" className="w-full bg-slate-950/80 border border-slate-800 p-5 rounded-2xl text-xs font-bold text-white focus:border-blue-500/50 outline-none transition-all" />
                </div>

                <div className="space-y-1">
                    <label className="text-[9px] font-black uppercase tracking-widest text-slate-700 ml-2">Phase (Semester)</label>
                    <input name="semester" value={formData.semester} onChange={handleChange} placeholder="PHASE_04" className="w-full bg-slate-950/80 border border-slate-800 p-5 rounded-2xl text-xs font-bold text-white focus:border-blue-500/50 outline-none transition-all" />
                </div>

                <div className="md:col-span-2 space-y-1">
                    <label className="text-[9px] font-black uppercase text-[#FFD700] tracking-[0.2em] ml-1">Target Mission Allocation</label>
                    <div className="relative">
                    <select 
                        name="eventId" 
                        value={formData.eventId} 
                        onChange={handleChange} 
                        className="w-full bg-slate-950/80 border border-slate-800 p-5 rounded-2xl text-[10px] font-black uppercase tracking-widest text-white focus:border-[#FFD700]/40 outline-none appearance-none cursor-pointer" 
                        required
                    >
                        <option value="" className="bg-slate-950">-- CHOOSE ACTIVE MISSION --</option>
                        {eventsList.map(ev => (
                        <option key={ev._id} value={ev._id} className="bg-slate-900">
                            {ev.title.toUpperCase()}
                        </option>
                        ))}
                    </select>
                    <div className="absolute inset-y-0 right-6 flex items-center pointer-events-none opacity-40">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
                    </div>
                    </div>
                </div>

                <button 
                    type="submit" 
                    disabled={isSubmitting} 
                    className="md:col-span-2 py-6 rounded-2xl bg-gradient-to-r from-[#FFD700] via-[#FDB931] to-[#FFA500] text-black font-black uppercase tracking-[0.4em] text-[11px] shadow-3xl hover:brightness-110 active:scale-95 transition-all disabled:opacity-50"
                >
                    {isSubmitting ? "ENCRYPTING_PAYLOAD..." : "INITIALIZE ENROLLMENT MISSION"}
                </button>
                </form>
            )}
            </motion.div>
        )}
      </div>
    </div>
  );
}