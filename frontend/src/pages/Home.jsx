import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import EventCard from "../components/EventCard";
import HeroSlider from "../components/HeroSlider";
import Skeleton from "../components/Skelton";
import { Helmet } from 'react-helmet-async';
import { API_URL } from "../App";

export default function Home() {
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  const formatDate = (dateString) => {
    if (!dateString) return "NODE_TBD";
    try {
      return new Date(dateString).toLocaleDateString('en-GB', { 
        day: 'numeric', month: 'short', year: 'numeric' 
      });
    } catch (e) { return "DATE_PENDING"; }
  };

  useEffect(() => {
    const fetchFeaturedEvents = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/events`);
        const json = await res.json();
        const allEvents = json.data || (Array.isArray(json) ? json : []);
        const featured = allEvents.filter(event => event.status === "upcoming").slice(0, 3);
        setFeaturedEvents(featured);
      } catch (err) {
        console.error("HOME_UPLINK_FAILURE: Mainframe link unstable.");
      } finally { setLoading(false); }
    };
    fetchFeaturedEvents();
  }, []);

  return (
    <motion.div 
      className="min-h-screen bg-[#020617] text-white overflow-x-hidden selection:bg-blue-500/30"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Helmet>
        <title>Home | Computer Science Society GCU</title>
        <meta name="description" content="The premier tech organization at GCU Lahore." />
      </Helmet>
      
      {/* --- HERO SECTOR (Refined Spacing) --- */}
      <div className="relative w-full min-h-screen flex flex-col items-center justify-center pt-32 pb-20 px-4 overflow-hidden border-b border-slate-900 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        
        {/* Cinematic Backdrop Layers */}
        <div className="absolute inset-0 z-0 opacity-30 grayscale-[0.5] contrast-125">
           <HeroSlider />
        </div>
        <div className="absolute inset-0 z-[1] w-full h-full bg-[linear-gradient(to_right,#FFD70008_1px,transparent_1px),linear-gradient(to_bottom,#FFD70008_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />
        <div className="absolute z-[2] inset-0 bg-gradient-to-b from-[#020617]/60 via-transparent to-[#020617]" />
        
        {/* Content Node */}
        <motion.div
          className="relative z-10 text-center max-w-5xl px-6 flex flex-col items-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {/* Logo */}
          <motion.div className="mb-8 group" whileHover={{ scale: 1.05 }}>
            <img
              src="/logo.jpg"
              alt="CSS Logo"
              className="w-24 md:w-28 rounded-full border-4 border-[#FFD700]/30 shadow-[0_0_40px_rgba(255,215,0,0.2)]"
            />
          </motion.div>

          <h1 className="text-4xl sm:text-6xl md:text-8xl font-black leading-[1] tracking-tighter uppercase italic mb-6">
            Computer <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] to-[#FFA500] drop-shadow-[0_0_15px_rgba(255,215,0,0.3)]">Science</span> Society
          </h1>

          <p className="max-w-2xl text-slate-300 text-base md:text-xl font-medium leading-relaxed mb-10">
            The epicenter of technical excellence at GCU Lahore. Empowering future leaders 
            through intensive workshops, competitive programming, and industrial execution.
          </p>

          {/* Buttons with proper flex-wrap and gap */}
          <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-6 w-full sm:w-auto">
            <Link
              to="/events"
              className="px-8 py-4 rounded-2xl bg-blue-600 text-white font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl hover:bg-blue-500 hover:-translate-y-1 transition-all active:scale-95"
            >
              Explore Missions
            </Link>

            <Link
              to="/membership"
              className="px-8 py-4 rounded-2xl border border-[#FFD700]/40 text-[#FFD700] font-black uppercase tracking-[0.2em] text-[10px] backdrop-blur-md hover:bg-[#FFD700]/10 hover:border-[#FFD700] hover:-translate-y-1 transition-all active:scale-95 shadow-xl"
            >
              Initiate Enlistment
            </Link>
          </div>
        </motion.div>
      </div>

      {/* --- FEATURED MISSIONS SECTOR --- */}
      <div className="relative z-10 px-6 py-24 max-w-7xl mx-auto">
        
        <div className="flex flex-col items-center mb-16">
            <div className="h-px w-24 bg-gradient-to-r from-transparent via-blue-500 to-transparent mb-8" />
            <motion.h2
              className="text-4xl md:text-6xl font-black text-center uppercase tracking-tighter italic"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Featured <span className="text-slate-800">Missions</span>
            </motion.h2>
        </div>

        {loading ? (
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
             <Skeleton /> <Skeleton /> <Skeleton />
          </div>
        ) : (
          <motion.div
            className="grid gap-8 md:gap-10 sm:grid-cols-2 lg:grid-cols-3"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ staggerChildren: 0.2 }}
          >
            {featuredEvents.length > 0 ? (
              featuredEvents.map((item, index) => (
                <motion.div key={item._id || index} whileHover={{ scale: 1.02 }} className="h-full">
                  <EventCard
                    id={item._id}
                    title={item.title}
                    description={item.description} 
                    date={formatDate(item.date)}
                    photo={item.image || item.photo} 
                    registrationCount={item.registrationCount || 0}
                    maxParticipants={item.maxParticipants || 0}
                  />
                </motion.div>
              ))
            ) : (
               <div className="col-span-full text-center p-16 border-2 border-dashed border-slate-800/40 rounded-[3rem]">
                  <p className="text-slate-700 font-black uppercase tracking-[0.3em] text-[11px] italic">Telemetry Clear // No active signals</p>
               </div>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}