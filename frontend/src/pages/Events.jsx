import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import EventCard from "../components/EventCard";
import Skeleton from "../components/Skelton";
import { fetchEvents } from "../api"; // FIXED: Centralized API uplink

/**
 * @description Mission Catalog (Events Page)
 * Hardened for real-time telemetry synchronization with automated mission categorization.
 */
export default function Events() {
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [pastEvents, setPastEvents] = useState([]); 
  const [loading, setLoading] = useState(true);

  /**
   * @section Mainframe Synchronization
   */
  useEffect(() => {
    const loadAllEvents = async () => {
      try {
        const res = await fetchEvents();
        const allData = res.data?.data || [];
        
        const now = new Date();

        /**
         * @section Auto-Categorization Protocol
         * Logic: Upcoming if status is 'upcoming' AND date is in the future.
         * Otherwise, it's moved to Archives for historical integrity.
         */
        const upcoming = allData.filter(e => {
          const eventDate = new Date(e.date);
          return e.status === "upcoming" && eventDate >= now;
        });

        const history = allData.filter(e => {
          const eventDate = new Date(e.date);
          return e.status !== "upcoming" || eventDate < now;
        });

        setUpcomingEvents(upcoming);
        setPastEvents(history);
        
      } catch (error) {
        console.error("MISSION_UPLINK_FAILURE: Connection interrupted.");
      } finally {
        setLoading(false);
      }
    };
    loadAllEvents();
  }, []);

  const formatDate = (dateString) => {
    if (!dateString) return "NODE_TBD";
    return new Date(dateString).toLocaleDateString('en-GB', { 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-[#020617] text-white overflow-x-hidden relative selection:bg-blue-500/30 font-sans">
      
      {/* --- GRID INFRASTRUCTURE --- */}
      <div className="fixed inset-0 z-0 w-full h-full bg-[linear-gradient(to_right,#FFD70008_1px,transparent_1px),linear-gradient(to_bottom,#FFD70008_1px,transparent_1px)] bg-[size:4.5rem_4.5rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="relative z-10 px-6 pt-32 pb-24 max-w-7xl mx-auto mt-12">
        
        {/* OPERATIONAL HEADER */}
        <div className="text-center mb-24">
          <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="inline-block px-4 py-1.5 rounded-full border border-blue-500/20 bg-blue-500/5 text-blue-400 text-[9px] font-black uppercase tracking-[0.4em] mb-8 shadow-xl">
            Protocol: Mission Deployment 
          </motion.div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-[0.85] mb-8 uppercase italic">
            Upcoming <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] to-yellow-500 drop-shadow-[0_0_20px_rgba(255,215,0,0.2)]">Events</span>
          </h1>
          <p className="mt-4 text-slate-500 max-w-3xl mx-auto font-medium text-lg md:text-xl leading-relaxed">
            Synchronizing with the board to provide specialized technical 
            symposiums, elite hackathons, and high-intensity workshops.
          </p>
        </div>

        {/* ACTIVE MISSIONS GRID */}
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-2 mb-40">
          {loading ? (
            Array(2).fill(0).map((_, i) => <Skeleton key={i} variant="card" />)
          ) : upcomingEvents.length > 0 ? (
            <AnimatePresence>
              {upcomingEvents.map((event) => (
                <motion.div
                  key={event._id}
                  layout
                  initial={{ opacity: 0, y: 40 }} 
                  animate={{ opacity: 1, y: 0 }} 
                  className="h-full"
                >
                  <EventCard
                    id={event._id}
                    title={event.title}
                    date={event.date}
                    description={event.description}
                    photo={event.image || event.photo}
                    isPast={false}
                    registrationCount={event.registrationCount || 0}
                    maxParticipants={event.maxParticipants || 0}
                    registrationOpen={event.registrationOpen}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          ) : (
            <div className="col-span-full text-center py-32 border border-dashed border-slate-800 rounded-[3rem] bg-slate-900/10">
              <p className="text-slate-700 font-black uppercase tracking-[0.5em] text-[11px] italic">TRANSMISSION_IDLE // NO_ACTIVE_MISSIONS_FOUND</p>
            </div>
          )}
        </div>

        {/* --- ARCHIVES DIVIDER --- */}
        <div className="my-40 relative flex items-center justify-center">
          <div className="absolute w-full h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent opacity-50"></div>
          <div className="relative px-12 bg-[#020617] border border-slate-800 rounded-full py-4 shadow-3xl z-10">
            <span className="text-blue-500 font-black tracking-[0.3em] uppercase text-[10px] flex items-center gap-4">
              <span className="w-2 h-2 bg-blue-500 rounded-full animate-ping" />
              Archives // Decrypted Logs
            </span>
          </div>
        </div>

        {/* HISTORICAL GRID */}
        <div className="text-center mb-20">
          <h2 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter leading-none mb-6 italic">Society <span className="text-slate-800">History</span></h2>
        </div>

        <motion.div 
            className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 mb-24" 
            initial={{ opacity: 0 }} 
            whileInView={{ opacity: 1 }} 
            viewport={{ once: true }}
        >
          {loading ? (
             Array(3).fill(0).map((_, i) => <Skeleton key={i} variant="card" />)
          ) : pastEvents.length > 0 ? (
            pastEvents.map((event) => (
              <motion.div
                key={event._id}
                className="h-full"
              >
                <EventCard
                  id={event._id}
                  title={event.title}
                  date={event.date}
                  description={event.description}
                  photo={event.image || event.photo}
                  isPast={true}
                />
              </motion.div>
            ))
          ) : (
            <div className="col-span-full text-center py-20 opacity-30 uppercase text-[10px] font-black tracking-[0.5em] italic text-slate-700">Historical registry empty.</div>
          )}
        </motion.div>
      </div>
    </div>
  );
}