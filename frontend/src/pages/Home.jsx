import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import EventCard from "../components/EventCard";
import HeroSlider from "../components/HeroSlider";
import Skeleton from "../components/Skelton";
import { Helmet } from 'react-helmet-async';
import { fetchEvents } from "../api"; 

/**
 * @description The Mainframe Terminal (Home Page)
 * Hardened for high-impact visual identity and real-time mission telemetry.
 * FIXED: Background visibility and layer transparency.
 */
export default function Home() {
  const [featuredEvents, setFeaturedEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFeaturedMissions = async () => {
      try {
        setLoading(true);
        const res = await fetchEvents();
        const allEvents = res.data?.data || [];
        const now = new Date();

        const featured = allEvents
          .filter(event => {
             const eventDate = new Date(event.date);
             return event.status === "upcoming" && eventDate >= now;
          })
          .slice(0, 3);

        setFeaturedEvents(featured);
      } catch (err) {
        console.error("HOME_UPLINK_FAILURE: Mainframe link unstable.");
      } finally {
        setLoading(false);
      }
    };
    loadFeaturedMissions();
  }, []);

  return (
    <motion.div 
      className="min-h-screen bg-[#020617] text-white overflow-x-hidden selection:bg-blue-500/30"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      <Helmet>
        <title>Terminal | Computer Science Society GCU</title>
        <meta name="description" content="The epicenter of technical excellence at GCU Lahore." />
      </Helmet>
      
      {/* --- HERO SECTOR --- */}
      <div className="relative w-full min-h-[90vh] md:min-h-screen flex flex-col items-center justify-center pt-32 pb-20 px-4 overflow-hidden border-b border-slate-900 shadow-[0_20px_50px_rgba(0,0,0,0.5)]">
        
        {/* FIXED: Cinematic Backdrop - Increased opacity and reduced grayscale for clarity */}
        <div className="absolute inset-0 z-0 opacity-50 grayscale-[0.2] contrast-110 scale-105">
           <HeroSlider />
        </div>

        {/* FIXED: Radial Grid Mask - Lightened to let background detail through */}
        <div className="absolute inset-0 z-[1] w-full h-full bg-[linear-gradient(to_right,#FFD70008_1px,transparent_1px),linear-gradient(to_bottom,#FFD70008_1px,transparent_1px)] bg-[size:4.5rem_4.5rem] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_50%,#000_60%,transparent_100%)] pointer-events-none" />
        
        {/* FIXED: Dynamic Gradient Overlay - Reduced top-layer darkness */}
        <div className="absolute z-[2] inset-0 bg-gradient-to-b from-[#020617]/40 via-transparent to-[#020617]" />
        
        {/* Content Node */}
        <motion.div
          className="relative z-10 text-center max-w-5xl px-6 flex flex-col items-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <motion.div 
            className="mb-10 group" 
            whileHover={{ scale: 1.05 }}
          >
            <img
              src="/logo.jpg"
              alt="CSS Logo"
              className="w-24 md:w-32 rounded-full border-4 border-[#FFD700]/20 shadow-[0_0_50px_rgba(255,215,0,0.2)]"
              onError={(e) => e.target.src = "https://placehold.co/200/020617/FFD700?text=CSS"}
            />
          </motion.div>

          <h1 className="text-5xl sm:text-7xl md:text-9xl font-black leading-[0.9] tracking-tighter uppercase italic mb-8 drop-shadow-2xl">
            Computer <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] to-[#FFA500]">Science</span> Society
          </h1>

          <p className="max-w-2xl text-slate-200 text-lg md:text-2xl font-bold leading-relaxed mb-12 drop-shadow-lg">
            The epicenter of technical excellence at GCU Lahore. Empowering future leaders 
            through intensive workshops and industrial execution.
          </p>

          <div className="flex flex-col sm:flex-row justify-center gap-4 sm:gap-8 w-full sm:w-auto">
            <Link
              to="/events"
              className="px-10 py-5 rounded-2xl bg-blue-600 text-white font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl hover:bg-blue-500 hover:-translate-y-1 transition-all active:scale-95 border border-blue-400/30"
            >
              Explore Missions
            </Link>

            <Link
              to="/membership"
              className="px-10 py-5 rounded-2xl border-2 border-[#FFD700]/40 text-[#FFD700] font-black uppercase tracking-[0.2em] text-[11px] backdrop-blur-md hover:bg-[#FFD700]/10 hover:border-[#FFD700] hover:-translate-y-1 transition-all active:scale-95"
            >
              Initiate Enlistment
            </Link>
          </div>
        </motion.div>
      </div>

      {/* --- FEATURED MISSIONS SECTOR --- */}
      <div className="relative z-10 px-6 py-24 max-w-7xl mx-auto">
        
        <div className="flex flex-col items-center mb-20">
            <div className="h-px w-24 bg-gradient-to-r from-transparent via-blue-600 to-transparent mb-8" />
            <motion.h2
              className="text-4xl md:text-6xl font-black text-center uppercase tracking-tighter italic"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              Active <span className="text-slate-700">Deployments</span>
            </motion.h2>
        </div>

        {loading ? (
          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
             <Skeleton variant="card" /> <Skeleton variant="card" /> <Skeleton variant="card" />
          </div>
        ) : (
          <motion.div
            className="grid gap-8 md:gap-12 sm:grid-cols-2 lg:grid-cols-3"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            {featuredEvents.length > 0 ? (
              featuredEvents.map((item) => (
                <motion.div key={item._id} className="h-full">
                  <EventCard
                    id={item._id}
                    title={item.title}
                    description={item.description} 
                    date={item.date} 
                    photo={item.image} 
                    registrationCount={item.registrationCount || 0}
                    maxParticipants={item.maxParticipants || 0}
                    registrationOpen={item.registrationOpen}
                  />
                </motion.div>
              ))
            ) : (
               <div className="col-span-full text-center p-20 border-2 border-dashed border-slate-800/40 rounded-[3rem]">
                  <p className="text-slate-700 font-black uppercase tracking-[0.5em] text-[12px] italic">Telemetry Clear // System Idle</p>
               </div>
            )}
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}