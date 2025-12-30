import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext";
// FIXED: Use centralized API functions
import { fetchAllMemberships, syncPermissions, deleteMembership as deleteApi } from "../api"; 

/**
 * @description Authority Manager (Personnel Control)
 * Restricted to Level 0 (Master Admin) clearance.
 * Manages the Permission Matrix and Identity Authorization.
 */
export default function AdminMemberships() {
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  const loadMemberships = async () => {
    try {
      const res = await fetchAllMemberships();
      // Synchronized with backend { success: true, data: [...] } structure
      const list = res.data?.data || [];
      setMemberships(list);
    } catch (error) {
      toast.error("Telemetry Sync Failure: Ledger Unreachable.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // SECURITY GUARD: Direct environment-sync for Master Admin
    const MASTER_EMAIL = import.meta.env.VITE_MASTER_ADMIN_EMAIL || "css@gmail.com";
    if (user && user.email?.toLowerCase() !== MASTER_EMAIL.toLowerCase()) {
      toast.error("ACCESS DENIED: Clearance Level 0 Required.");
      navigate("/admin-dashboard");
      return;
    }
    loadMemberships();
  }, [user, navigate]);

  /**
   * @section Authority Sync Protocol
   */
  const handleUpdateStatus = async (id, isApproved, updatedPermissions) => {
    const loadToast = toast.loading("Syncing Authority Parameters...");
    try {
      // BACKEND HANDSHAKE: PATCH /api/memberships/permissions/:id
      const res = await syncPermissions(id, { 
        approved: isApproved, 
        role: "Executive Board", 
        permissions: { ...updatedPermissions, isAdmin: true } 
      });

      if (res.data?.success) {
        setMemberships(prev => prev.map((m) =>
          m._id === id ? { ...m, approved: isApproved, permissions: res.data.data?.permissions || updatedPermissions } : m
        ));

        // SECURITY: Link generation for onboarding
        if (res.data.activationLink) {
          const fullLink = `${window.location.origin}${res.data.activationLink}`;
          navigator.clipboard.writeText(fullLink);
          toast.success("Identity Authorized. Activation Link Copied!", { id: loadToast });
        } else {
          toast.success("Authority Matrix Synced.", { id: loadToast });
        }
      }
    } catch (error) {
      const msg = error.response?.data?.message || "Mainframe refused parameters.";
      toast.error("Sync Failure: " + msg, { id: loadToast });
    }
  };

  const togglePermission = (member, field) => {
    const currentPerms = member.permissions || {};
    const newPermissions = { 
      ...currentPerms, 
      [field]: !currentPerms[field],
      isAdmin: true 
    };
    handleUpdateStatus(member._id, member.approved, newPermissions);
  };

  const handleDeleteRecord = async (id) => {
    if(!window.confirm("CRITICAL: Permanent wipe requested. Purge this record?")) return;
    try {
      await deleteApi(id);
      toast.success("Record Purged from Registry.");
      setMemberships(prev => prev.filter((m) => m._id !== id));
    } catch (error) {
      toast.error("Purge Protocol Failed.");
    }
  };

  const permissionMeta = [
    { key: 'canManageEvents', label: 'Missions' },
    { key: 'canManageAnnouncements', label: 'Broadcasts' },
    { key: 'canViewRegistrations', label: 'Registry' }
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-white overflow-x-hidden relative font-sans selection:bg-yellow-500/30">
      
      <div className="fixed inset-0 z-0 bg-[linear-gradient(to_right,#FFD70008_1px,transparent_1px),linear-gradient(to_bottom,#FFD70008_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />
      
      <div className="relative z-10 px-6 pt-32 pb-24 max-w-7xl mx-auto mt-12">
        
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-20 gap-8">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-6xl font-black tracking-tighter uppercase leading-none mb-4 italic">
              Authority <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] to-yellow-500">Manager</span>
            </h1>
            <p className="text-[10px] text-slate-600 font-black uppercase tracking-[0.5em] flex items-center gap-4">
               <span className="w-12 h-px bg-slate-800"></span> Personnel Clearance Terminal
            </p>
          </motion.div>
          <button onClick={() => navigate("/admin-dashboard")} className="px-8 py-4 rounded-2xl bg-slate-900 border border-slate-800 text-[10px] font-black uppercase tracking-widest hover:border-blue-500/40 transition-all shadow-xl">
            Return to Dashboard
          </button>
        </div>

        {loading ? (
            <div className="p-24 text-center text-[10px] font-black uppercase tracking-widest text-slate-800 animate-pulse">Synchronizing Personnel Records...</div>
        ) : (
          <div className="space-y-6">
            <div className="hidden lg:grid grid-cols-12 gap-6 px-10 py-4 text-[10px] font-black text-slate-700 uppercase tracking-[0.3em]">
              <div className="col-span-4">Candidate Identification</div>
              <div className="col-span-6 text-center">Permission Matrix // Access Levels</div>
              <div className="col-span-2 text-right">Operations</div>
            </div>

            <AnimatePresence>
            {memberships.map((m) => (
              <motion.div 
                key={m._id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }}
                className={`bg-slate-900/40 backdrop-blur-3xl border border-slate-800 p-8 rounded-[3rem] transition-all duration-500 group relative ${m.isActivated ? 'border-l-4 border-l-emerald-500' : 'hover:border-blue-500/30'}`}
              >
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                  
                  <div className="lg:col-span-4 flex items-center gap-6">
                    <div className={`w-16 h-16 rounded-[1.5rem] flex items-center justify-center font-black border-2 transition-all duration-500 ${m.approved ? 'bg-blue-600/10 border-blue-500/40 text-blue-400' : 'bg-slate-950 border-slate-800 text-slate-700'}`}>
                      {m.fullName?.charAt(0)}
                    </div>
                    <div className="overflow-hidden">
                      <h3 className="text-xl font-black text-white uppercase tracking-tight truncate mb-1">{m.fullName}</h3>
                      <div className="flex flex-col gap-1">
                        <span className="text-[11px] text-blue-500 font-mono font-black">{m.rollNo}</span>
                        <span className="text-[10px] text-slate-600 font-medium truncate italic">{m.gmail}</span>
                      </div>
                    </div>
                  </div>

                  <div className="lg:col-span-6">
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                        {permissionMeta.map((perm) => (
                           <button 
                             key={perm.key} 
                             disabled={!m.approved}
                             onClick={() => togglePermission(m, perm.key)}
                             className={`p-4 rounded-2xl border transition-all duration-300 flex flex-col items-center justify-center text-center gap-1 ${
                               m.permissions?.[perm.key] 
                               ? 'bg-blue-600/10 border-blue-500/50 shadow-lg' 
                               : 'bg-slate-950 border-slate-800/50 opacity-20 hover:opacity-100'
                             } ${!m.approved ? 'cursor-not-allowed opacity-10' : ''}`}
                           >
                             <span className={`text-[9px] font-black uppercase tracking-tighter ${m.permissions?.[perm.key] ? 'text-blue-400' : 'text-slate-600'}`}>
                               {perm.label}
                             </span>
                           </button>
                        ))}
                    </div>
                  </div>

                  <div className="lg:col-span-2 flex justify-end items-center gap-4">
                    {!m.approved ? (
                      <button 
                        onClick={() => handleUpdateStatus(m._id, true, m.permissions)}
                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#FFD700] to-yellow-600 text-black text-[10px] font-black uppercase tracking-widest shadow-xl"
                      >
                        Approve
                      </button>
                    ) : (
                      <div className={`w-full text-center py-4 border rounded-2xl bg-slate-950/50 ${m.isActivated ? 'border-emerald-500/20' : 'border-blue-500/20'}`}>
                         <span className={`text-[9px] font-black uppercase tracking-widest ${m.isActivated ? 'text-emerald-500' : 'text-blue-500'}`}>
                            {m.isActivated ? 'NODE_ACTIVE' : 'INVITED'}
                         </span>
                      </div>
                    )}
                    <button onClick={() => handleDeleteRecord(m._id)} className="p-4 rounded-2xl bg-red-500/5 text-red-500 border border-red-500/10 hover:bg-red-600 hover:text-white transition-all">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}