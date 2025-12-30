import React, { useState, useEffect } from "react";
import TeamCard from "../components/TeamCard";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import { API_URL } from "../App"; 

/**
 * @description Personnel Registry (Team Page)
 * Hardened for real-time hierarchy synchronization.
 * Features automated rank-based sorting and industrial glassmorphism.
 */
export default function Team() {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  /**
   * @section Hierarchy Synchronization
   * Pulls the executive board registry and applies rank-based sorting.
   */
  useEffect(() => {
    const fetchTeam = async () => {
      try {
        const response = await fetch(`${API_URL}/team`); 
        const result = await response.json();
        
        // Data extraction from standardized { success, data } wrapper
        const list = result.data || (Array.isArray(result) ? result : []);
        
        if (list.length > 0) {
            // Sort Logic: Rank 1 (Command) -> Rank 99 (Council)
            const sortedData = list.sort((a, b) => a.hierarchy - b.hierarchy);
            setTeamMembers(sortedData);
        } else {
            setTeamMembers([]);
        }
      } catch (error) {
        console.error("PERSONNEL_UPLINK_FAILURE: Mainframe link unstable.");
        setTeamMembers([]);
      } finally {
        setLoading(false);
      }
    };
    fetchTeam();
  }, []);

  return (
    <div className="min-h-screen bg-[#020617] text-white overflow-x-hidden relative selection:bg-blue-500/30 font-sans">
      
      {/* --- GRID FREQUENCY INFRASTRUCTURE --- */}
      <div className="fixed inset-0 z-0 w-full h-full bg-[linear-gradient(to_right,#FFD70008_1px,transparent_1px),linear-gradient(to_bottom,#FFD70008_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Ambient Lighting Pulse Node */}
      <motion.div
        className="fixed top-0 left-1/4 w-[500px] h-[500px] rounded-full bg-blue-600/5 blur-[120px] pointer-events-none z-0"
        animate={{ y: [-20, 20, -20], opacity: [0.1, 0.2, 0.1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10 px-6 pt-32 pb-24 max-w-7xl mx-auto mt-12">
        
        {/* TERMINAL HEADER */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-24"
        >
          <div className="inline-block px-4 py-1.5 rounded-full border border-[#FFD700]/20 bg-[#FFD700]/5 text-[#FFD700] text-[9px] font-black uppercase tracking-[0.4em] mb-6">
            INSTITUTIONAL_LEADERSHIP
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none mb-6 uppercase italic">
            Society <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] to-yellow-500">Architects</span>
          </h1>
          <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.5em] max-w-2xl mx-auto italic">
            "Synchronizing elite intelligence to architect the digital future."
          </p>
        </motion.div>

        {/* PERSONNEL GRID */}
        {loading ? (
          <div className="text-center py-24 flex flex-col items-center gap-6">
             <div className="w-10 h-10 border-4 border-t-[#FFD700] border-slate-900 rounded-full animate-spin"></div>
             <p className="text-slate-800 font-black uppercase tracking-[0.4em] text-[10px] italic">Syncing Personnel Data...</p>
          </div>
        ) : teamMembers.length === 0 ? (
          <div className="text-center py-24 border border-dashed border-slate-800/50 rounded-[3rem] bg-slate-900/10">
            <p className="text-slate-700 uppercase font-black text-[10px] tracking-[0.4em] italic">The executive hierarchy is currently offline. Standby.</p>
          </div>
        ) : (
          <motion.div
            className="grid gap-10 md:grid-cols-2 lg:grid-cols-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ staggerChildren: 0.1 }}
          >
            <AnimatePresence>
              {teamMembers.map((member, index) => (
                <motion.div
                  key={member._id}
                  layout
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  whileHover={{ y: -12, borderColor: 'rgba(255, 215, 0, 0.3)', boxShadow: '0 0 40px rgba(255,215,0,0.05)' }}
                  className="group relative bg-slate-950/40 backdrop-blur-3xl p-8 rounded-[2.5rem] border border-slate-800 transition-all duration-500 shadow-2xl overflow-hidden flex flex-col h-full"
                >
                  {/* Forensic Rank Badge */}
                  <div className="absolute top-6 right-8 text-[9px] font-black uppercase tracking-[0.2em] text-slate-800 group-hover:text-[#FFD700] transition-colors font-mono">
                      RANK_0{member.hierarchy}
                  </div>

                  <div className="relative z-10 flex flex-col h-full">
                    <TeamCard
                      name={member.name}
                      role={member.role}
                      image={member.image}
                      description={member.description}
                    />
                    
                    {/* Social Uplink Module */}
                    <div className="mt-auto pt-8 border-t border-slate-800/50 flex justify-center gap-6">
                      {member.linkedin && (
                        <a href={member.linkedin} target="_blank" rel="noreferrer" className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-[9px] font-black uppercase tracking-widest text-slate-600 hover:text-blue-400 hover:border-blue-500/30 transition-all active:scale-95 shadow-lg">LinkedIn</a>
                      )}
                      {member.instagram && (
                        <a href={member.instagram} target="_blank" rel="noreferrer" className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-[9px] font-black uppercase tracking-widest text-slate-600 hover:text-pink-500 hover:border-pink-500/30 transition-all active:scale-95 shadow-lg">Instagram</a>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}

        {/* GLOBAL CTA NODE */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-40 relative overflow-hidden rounded-[3rem] border border-slate-800 bg-slate-950/40 backdrop-blur-3xl px-8 py-20 text-center shadow-3xl max-w-4xl mx-auto transition-all duration-700 hover:border-blue-500/20 group"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-blue-500/30 to-transparent opacity-50" />

          <h3 className="text-4xl md:text-6xl font-black mb-6 text-white tracking-tighter uppercase leading-none italic">
            Initialize <span className="text-[#FFD700]">Your Legacy</span>
          </h3>
          
          <p className="text-slate-500 mb-12 max-w-xl mx-auto text-lg font-medium leading-relaxed">
            Join the elite leadership of GCU Lahore's premier tech society. 
            Directly influence the campus digital landscape and build your technical frequency.
          </p>

          <Link
            to="/membership"
            className="inline-block px-14 py-5 rounded-[2rem] bg-white text-black font-black uppercase tracking-[0.3em] text-[11px] shadow-3xl hover:bg-[#FFD700] hover:shadow-[0_0_40px_rgba(255,215,0,0.3)] transition-all duration-500 active:scale-95"
          >
            Apply for Enrollment
          </Link>
        </motion.div>

      </div>
    </div>
  );
}