import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuth } from "../context/AuthContext"; // FIXED: Integrated Auth State
import { API_URL } from "../App"; 

/**
 * @description Authority Manager (Personnel Control)
 * Restricted to Level 0 (Master Admin) clearance.
 * Features Permission Matrix toggling and secure activation link generation.
 */
export default function AdminMemberships() {
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth(); // FIXED: Reading identity from context
  const navigate = useNavigate();
  const token = localStorage.getItem("token"); // Standardized token key

  /**
   * @section Registry Synchronization
   * Fetches all applicants and board members from the administrative ledger.
   */
  const fetchMemberships = async () => {
    try {
      const response = await fetch(`${API_URL}/memberships/admin/all`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await response.json();
      
      const list = result.data || (Array.isArray(result) ? result : []);
      setMemberships(list);
    } catch (error) {
      toast.error("Telemetry Sync Failure: Ledger Unreachable.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // SECURITY GUARD: Redirect non-master operators
    if (user && user.email !== "css@gmail.com") {
      toast.error("ACCESS DENIED: Clearance Level 0 Required.");
      navigate("/admin-dashboard");
      return;
    }
    
    if (!token) navigate("/admin");
    else fetchMemberships();
  }, [token, user, navigate]);

  /**
   * @section Authority Sync Protocol
   * Updates RBAC permissions and approval status in the mainframe.
   */
  const updateMemberStatus = async (id, isApproved, updatedPermissions) => {
    const loadToast = toast.loading("Syncing Authority Parameters...");
    try {
      const response = await fetch(`${API_URL}/admin/permissions/${id}`, {
        method: "PATCH",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ 
          approved: isApproved, 
          role: "Executive Board", 
          permissions: { ...updatedPermissions, isAdmin: true } 
        })
      });

      const result = await response.json();

      if (response.ok) {
        setMemberships(prev => prev.map((m) =>
          m._id === id ? { ...m, approved: isApproved, permissions: result.data?.permissions || updatedPermissions } : m
        ));

        // Copy activation uplink to clipboard for easy distribution
        if (result.activationLink) {
          const fullLink = `${window.location.origin}${result.activationLink}`;
          navigator.clipboard.writeText(fullLink);
          toast.success("Identity Authorized. Activation Link Copied!", { id: loadToast });
        } else {
          toast.success("Authority Matrix Synced.", { id: loadToast });
        }
      } else {
        throw new Error(result.message || "Mainframe rejected parameters.");
      }
    } catch (error) {
      toast.error("Sync Failure: " + error.message, { id: loadToast });
    }
  };

  const togglePermission = (member, field) => {
    const currentPerms = member.permissions || {};
    const newPermissions = { 
      ...currentPerms, 
      [field]: !currentPerms[field],
      isAdmin: true 
    };
    updateMemberStatus(member._id, member.approved, newPermissions);
  };

  const deleteMembership = async (id) => {
    if(!window.confirm("CRITICAL: Permanent wipe requested. Purge this record?")) return;
    try {
      const response = await fetch(`${API_URL}/memberships/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        toast.success("Record Purged from Registry.");
        setMemberships(prev => prev.filter((m) => m._id !== id));
      }
    } catch (error) {
      toast.error("Purge Protocol Failed.");
    }
  };

  const permissionMeta = [
    { key: 'canManageEvents', label: 'Missions', desc: 'Ops' },
    { key: 'canManageAnnouncements', label: 'Broadcasts', desc: 'Intel' },
    { key: 'canViewRegistrations', label: 'Registry', desc: 'Data' }
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-white overflow-x-hidden relative font-sans selection:bg-yellow-500/30">
      
      {/* Background Polish */}
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
            {/* Legend Header */}
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
                  
                  {/* IDENTITY SECTION */}
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

                  {/* PERMISSION MATRIX GRID */}
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
                             } ${!m.approved ? 'cursor-not-allowed' : ''}`}
                           >
                             <span className={`text-[9px] font-black uppercase tracking-tighter ${m.permissions?.[perm.key] ? 'text-blue-400' : 'text-slate-600'}`}>
                               {perm.label}
                             </span>
                             <span className="text-[7px] font-black uppercase tracking-widest opacity-30">
                               {m.permissions?.[perm.key] ? 'AUTHORIZED' : 'LOCKED'}
                             </span>
                           </button>
                        ))}
                    </div>
                  </div>

                  {/* OPERATION CONSOLE */}
                  <div className="lg:col-span-2 flex justify-end items-center gap-4">
                    {!m.approved ? (
                      <button 
                        onClick={() => updateMemberStatus(m._id, true, m.permissions)}
                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-[#FFD700] to-yellow-600 text-black text-[10px] font-black uppercase tracking-widest hover:brightness-110 active:scale-95 shadow-xl"
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
                    <button onClick={() => deleteMembership(m._id)} className="p-4 rounded-2xl bg-red-500/5 text-red-500 border border-red-500/10 hover:bg-red-600 hover:text-white transition-all shadow-lg" title="Purge Record">
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