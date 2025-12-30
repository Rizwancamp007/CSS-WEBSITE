import React from "react";
import { motion } from "framer-motion";

/**
 * @description Executive Personnel Card
 * Hardened to reflect the society's hierarchy. Features "Node Activation" 
 * hover effects and robust image fallback protocols.
 */
export default function TeamCard({ 
  name, 
  role, 
  image, 
  photo, 
  description, 
  linkedin, 
  instagram 
}) {
  
  /**
   * @section Asset Handshake
   * Logic: Priority to 'image' (Backend field) -> 'photo' (Legacy Prop) -> Fallback Asset
   */
  const imageSrc = (image || photo) && (image || photo).trim() !== "" 
    ? (image || photo) 
    : "/assets/images/member-placeholder.jpg"; // Internal localized fallback

  return (
    <motion.div
      className="group relative flex flex-col items-center text-center h-full w-full"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      {/* --- BOX IGNITION: CARD FRAME --- */}
      <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-xl border border-slate-800 rounded-[2.5rem] transition-all duration-500 group-hover:border-[#FFD700]/30 group-hover:shadow-[0_0_40px_rgba(255,215,0,0.05)]" />

      <div className="relative z-10 p-8 flex flex-col items-center h-full w-full">
        
        {/* --- IMAGE RADIUS (IDENTITY NODE) --- */}
        <div className="relative mb-6">
          {/* Node Activation Glow: Blue/Gold Aura */}
          <div className="absolute -inset-3 rounded-full bg-gradient-to-tr from-blue-600 via-transparent to-[#FFD700] opacity-0 group-hover:opacity-40 blur-xl transition-opacity duration-700" />

          <div className="relative w-36 h-36 rounded-full overflow-hidden border-4 border-slate-800 group-hover:border-[#FFD700]/50 transition-all duration-500 shadow-2xl bg-slate-950">
            <img
              src={imageSrc}
              alt={`${name} - ${role}`}
              loading="lazy"
              className="w-full h-full object-cover transform transition-transform duration-1000 group-hover:scale-110 grayscale group-hover:grayscale-0"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "https://via.placeholder.com/150?text=Node+Inactive";
              }}
            />
          </div>
        </div>

        {/* --- PERSONNEL INTEL --- */}
        <h3 className="text-2xl font-black text-white mb-2 group-hover:text-[#FFD700] transition-colors duration-300 uppercase tracking-tighter">
          {name}
        </h3>

        <div className="mb-6">
          <span className="px-5 py-1.5 rounded-full text-[9px] font-black uppercase tracking-[0.3em] bg-blue-500/10 text-blue-400 border border-blue-500/20 shadow-lg shadow-blue-900/20">
            {role}
          </span>
        </div>

        <p className="text-slate-500 text-sm leading-relaxed line-clamp-3 mb-8 font-medium">
          {description || "Active member of the GCU Computer Science Society leadership terminal."}
        </p>

        {/* --- SOCIAL UPLINKS --- */}
        <div className="mt-auto flex gap-6">
          {linkedin && (
            <motion.a 
              whileHover={{ scale: 1.2, y: -2 }}
              href={linkedin} 
              target="_blank" 
              rel="noreferrer" 
              className="text-slate-600 hover:text-[#0077B5] transition-colors"
              aria-label={`${name} LinkedIn Profile`}
            >
               <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.238 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
            </motion.a>
          )}
          {instagram && (
            <motion.a 
              whileHover={{ scale: 1.2, y: -2 }}
              href={instagram} 
              target="_blank" 
              rel="noreferrer" 
              className="text-slate-600 hover:text-[#E4405F] transition-colors"
              aria-label={`${name} Instagram Profile`}
            >
               <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zm0 10.162a3.997 3.997 0 110-7.994 3.997 3.997 0 010 7.994zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
            </motion.a>
          )}
        </div>
      </div>
    </motion.div>
  );
}