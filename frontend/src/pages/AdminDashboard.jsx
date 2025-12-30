import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { useAuth } from "../context/AuthContext";
import { 
  fetchAdminEvents, 
  fetchAdminAnnouncements, 
  fetchAdminTeam, 
  fetchAllMemberships, 
  fetchInquiries, 
  getActivityLogs 
} from "../api";

export default function AdminDashboard() {
  const { user, logout, hasPermission } = useAuth();
  const [stats, setStats] = useState({ events: 0, memberships: 0, announcements: 0, team: 0, messages: 0, logs: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const MASTER_EMAIL = import.meta.env.VITE_MASTER_ADMIN_EMAIL || "css@gmail.com";
  const isMaster = user?.email?.toLowerCase() === MASTER_EMAIL.toLowerCase();

  useEffect(() => {
    const fetchTelemetry = async () => {
      try {
        setLoading(true);
        const [events, announce, team, members, messages, logs] = await Promise.all([
          fetchAdminEvents().catch(() => ({ data: { data: [] } })),
          fetchAdminAnnouncements().catch(() => ({ data: { data: [] } })),
          fetchAdminTeam().catch(() => ({ data: { data: [] } })),
          isMaster ? fetchAllMemberships().catch(() => ({ data: { data: [] } })) : Promise.resolve({ data: { data: [] } }),
          isMaster ? fetchInquiries().catch(() => ({ data: { data: [] } })) : Promise.resolve({ data: { data: [] } }),
          isMaster ? getActivityLogs().catch(() => ({ data: { data: [] } })) : Promise.resolve({ data: { data: [] } })
        ]);

        setStats({
          events: events.data?.data?.length || 0,
          announcements: announce.data?.data?.length || 0,
          team: team.data?.data?.length || 0,
          memberships: members.data?.data?.length || 0,
          messages: messages.data?.data?.length || 0,
          logs: logs.data?.data?.length || 0
        });
      } catch (err) {
        setError("Core synchronization failure.");
      } finally {
        setLoading(false);
      }
    };
    fetchTelemetry();
  }, [isMaster]);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#020617] border border-slate-800 p-3 rounded-xl shadow-2xl">
          <p className="text-[10px] font-black uppercase text-[#FFD700]">{`${payload[0].name}: ${payload[0].value}`}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white overflow-x-hidden relative flex flex-col selection:bg-blue-500/30">
      <div className="fixed inset-0 z-0 w-full h-full bg-[linear-gradient(to_right,#FFD70008_1px,transparent_1px),linear-gradient(to_bottom,#FFD70008_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />
      
      <div className="relative z-10 w-full max-w-7xl mx-auto px-6 pt-32 pb-20 flex-grow">
        
        {/* HEADER TERMINAL */}
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <h1 className="text-4xl md:text-5xl font-black tracking-tighter uppercase leading-none italic">Command <span className="text-[#FFD700]">Center</span></h1>
            <p className="text-slate-600 mt-3 text-[10px] font-black uppercase tracking-[0.4em]">Operator: {user?.name || "UNIDENTIFIED"} // Access: {isMaster ? "LEVEL_0" : "BOARD_MEMBER"}</p>
          </motion.div>
          
          <div className="flex items-center gap-3">
            {/* RESTORED: PUBLIC SITE BRIDGE */}
            <a href="/" target="_blank" className="px-6 py-2.5 rounded-xl bg-blue-600/10 border border-blue-500/30 text-blue-400 text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all">
              Live Terminal
            </a>
            
            <Link to="/admin/profile" className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-[#FFD700] transition-all">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              </svg>
            </Link>
            <button onClick={() => { logout(); navigate("/admin"); }} className="px-6 py-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-500 text-[10px] font-black uppercase hover:bg-red-600 transition-all">Logout</button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-20 flex flex-col items-center gap-4">
            <div className="w-10 h-10 border-4 border-t-[#FFD700] border-slate-900 rounded-full animate-spin"></div>
            <p className="text-slate-800 font-black uppercase text-[9px]">Decrypting Core Telemetry...</p>
          </div>
        ) : (
          <div className="grid gap-8 grid-cols-1 lg:grid-cols-4">
            <div className="lg:col-span-3 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[
                { title: "Missions", count: stats.events, link: "/admin/events", icon: "📅", perm: "canManageEvents" },
                { title: "Broadcasts", count: stats.announcements, link: "/admin/announcements", icon: "📢", perm: "canManageAnnouncements" },
                { title: "Enrollments", count: "LIST", link: "/all-registrations", icon: "📝", perm: "canViewRegistrations" },
                { title: "Staff Node", count: stats.team, link: "/admin/team", icon: "🎖️", perm: "canManageTeams" },
                { title: "Inquiry Node", count: stats.messages, link: "/admin/messages", icon: "📩", isMasterOnly: true },
                { title: "Authority Mgr", count: stats.memberships, link: "/admin/memberships", icon: "👥", isMasterOnly: true },
                { title: "Forensic Logs", count: stats.logs, link: "/admin/logs", icon: "📜", isMasterOnly: true },
              ]
                .filter(item => item.isMasterOnly ? isMaster : hasPermission(item.perm))
                .map((item, index) => (
                  <Link to={item.link} key={index} className="block group">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="h-full relative overflow-hidden rounded-[2.5rem] bg-slate-900/40 border border-slate-800 hover:border-[#FFD700]/40 p-8 transition-all duration-500">
                      <div className="flex justify-between items-start h-full">
                        <div className="flex flex-col h-full justify-between">
                          <div className="text-5xl mb-8 grayscale group-hover:grayscale-0 transition-all">{item.icon}</div>
                          <h2 className="text-lg font-black text-white group-hover:text-[#FFD700] uppercase">{item.title}</h2>
                        </div>
                        <div className="text-right">
                          <span className="block text-4xl font-black text-white italic group-hover:text-blue-400 transition-colors">{item.count}</span>
                        </div>
                      </div>
                    </motion.div>
                  </Link>
                ))}
            </div>

            <div className="lg:col-span-1 bg-slate-950/60 backdrop-blur-3xl border border-slate-800 rounded-[2.5rem] p-8 h-full flex flex-col">
              <h3 className="text-[10px] font-black text-slate-600 uppercase tracking-[0.3em] mb-8">Node Distribution</h3>
              <div className="flex-grow w-full" style={{ minHeight: '300px' }}>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={[
                    { name: 'Events', count: stats.events, fill: '#3b82f6' }, 
                    { name: 'News', count: stats.announcements, fill: '#f59e0b' },
                    { name: 'Staff', count: stats.team, fill: '#FFD700' },
                    ...(isMaster ? [
                        { name: 'Inbox', count: stats.messages, fill: '#10b981' },
                        { name: 'Members', count: stats.memberships, fill: '#a855f7' },
                        { name: 'Logs', count: stats.logs, fill: '#ef4444' }
                    ] : [])
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                    <XAxis dataKey="name" hide />
                    <Tooltip content={<CustomTooltip />} />
                    <Bar dataKey="count" radius={[10, 10, 0, 0]} barSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-800 text-center">
                  <p className="text-[9px] text-slate-700 font-black uppercase tracking-[0.2em] italic">System Status: NOMINAL</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}