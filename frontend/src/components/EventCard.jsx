import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

/**
 * @description Mission Profile Card
 * Synchronized with backend capacity safeguards and manual registration toggles.
 */
export default function EventCard({
  id,
  title,
  date,
  description,
  photo, 
  isPast = false,
  registrationCount = 0,
  maxParticipants = 0,
  registrationOpen = true // NEW: Supports manual admin closure
}) {
  
  // Normalizing Asset Source with Production Fallback
  const imageSrc = photo && photo.trim() !== "" ? photo : "/assets/images/placeholder.jpg";
  
  /**
   * @section Logic Protocol: Capacity & Status Check
   */
  const isFull = maxParticipants > 0 && registrationCount >= maxParticipants;
  const isRegistrationLocked = !registrationOpen || isFull;

  return (
    <motion.article
      className={`group relative flex flex-col h-full bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-[2.5rem] overflow-hidden shadow-2xl transition-all duration-500 ${
        isPast
          ? "opacity-60 grayscale-[0.4]"
          : "hover:shadow-blue-500/10 hover:border-blue-500/30"
      }`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: isPast ? 0 : -8, borderColor: isPast ? 'rgba(30,41,59,1)' : 'rgba(59,130,246,0.4)' }}
    >
      {/* --- IMAGE SECTION (THE SCANNER) --- */}
      <div className="relative w-full h-56 overflow-hidden bg-slate-800">
        <img
          src={imageSrc} 
          alt={title}
          className={`w-full h-full object-cover transform transition-transform duration-1000 ${
            isPast ? "" : "group-hover:scale-110"
          }`}
          loading="lazy"
          onError={(e) => {
            e.target.onerror = null; 
            e.target.src = "https://placehold.co/600x400/020617/FFD700?text=Asset+Offline"; 
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent opacity-90" />

        {/* Date Badge */}
        {date && (
          <div
            className={`absolute top-5 right-5 flex items-center gap-2 px-4 py-1.5 rounded-full backdrop-blur-md border shadow-2xl z-20 ${
              isPast
                ? "bg-slate-800/90 border-slate-600 text-slate-500"
                : "bg-slate-950/80 border-[#FFD700]/20 text-[#FFD700]"
            }`}
          >
            <span className="text-[10px] font-black uppercase tracking-[0.2em]">
              {new Date(date).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}
            </span>
          </div>
        )}
        
        {/* Capacity Indicator: Live Uplink Status */}
        {!isPast && (
            <div className="absolute bottom-4 left-6 z-20">
                <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-md border ${
                  isRegistrationLocked 
                  ? 'bg-red-500/10 border-red-500/30 text-red-400' 
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                }`}>
                    {isFull 
                      ? "Capacity Reached" 
                      : !registrationOpen 
                      ? "Registrations Closed" 
                      : `Uplinks: ${registrationCount} / ${maxParticipants > 0 ? maxParticipants : '∞'}`}
                </span>
            </div>
        )}
      </div>

      {/* --- CONTENT SECTION --- */}
      <div className="flex flex-col flex-grow p-6 pt-4">
        <h3
          className={`text-2xl font-black mb-3 leading-none tracking-tighter transition-colors duration-300 uppercase ${
            isPast ? "text-slate-500" : "text-white group-hover:text-blue-400"
          }`}
        >
          {title}
        </h3>

        <p className="text-slate-500 text-sm leading-relaxed mb-8 flex-grow line-clamp-3 font-medium">
          {description}
        </p>

        {/* --- FOOTER ACTIONS --- */}
        <div className="flex items-center justify-center mt-auto pt-6 border-t border-slate-800/50">

          {isPast ? (
            <button
              disabled
              className="px-6 py-2.5 rounded-xl bg-slate-800/50 text-slate-600 text-[10px] font-black uppercase tracking-widest border border-slate-800 cursor-not-allowed select-none"
            >
              Mission Completed
            </button>
          ) : isRegistrationLocked ? (
            <button
              disabled
              className="px-6 py-2.5 rounded-xl bg-red-900/20 text-red-500 text-[10px] font-black uppercase tracking-widest border border-red-900/30 cursor-not-allowed"
            >
              {isFull ? "Slots Depleted" : "Entry Suspended"}
            </button>
          ) : (
            <Link
              to={`/register/${id}`}
              className="relative overflow-hidden px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#FFD700] to-[#FFA500] text-black text-[10px] font-black uppercase tracking-[0.15em] shadow-xl hover:shadow-yellow-500/30 transition-all duration-300 active:scale-95"
            >
              Initiate Enrollment
            </Link>
          )}
        </div>
      </div>
    </motion.article>
  );
}