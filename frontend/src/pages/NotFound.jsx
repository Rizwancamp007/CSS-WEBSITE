import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

/**
 * @description The Void Terminal (404 Page)
 * Hardened for user retention during navigational failure.
 * Features deep-space lighting nodes and institutional grid synchronization.
 */
export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#020617] text-white flex flex-col items-center justify-center relative overflow-hidden text-center px-6 selection:bg-blue-500/30 font-sans">
      
      {/* --- GRID FREQUENCY INFRASTRUCTURE --- */}
      <div className="fixed inset-0 z-0 w-full h-full bg-[linear-gradient(to_right,#FFD70008_1px,transparent_1px),linear-gradient(to_bottom,#FFD70008_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* Deep Space Lighting Node */}
      <motion.div
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/5 rounded-full blur-[150px] pointer-events-none z-0"
        animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
        transition={{ duration: 10, repeat: Infinity }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="relative z-10"
      >
        <h1 className="text-[10rem] md:text-[15rem] font-black text-transparent bg-clip-text bg-gradient-to-b from-slate-100 to-slate-800 drop-shadow-3xl tracking-tighter italic leading-none opacity-40">
          404
        </h1>
        
        <div className="-mt-10 md:-mt-20">
            <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter italic mb-4">
              Lost in the <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] to-yellow-500">Void?</span>
            </h2>
            <p className="text-slate-600 max-w-md mx-auto font-black uppercase text-[10px] tracking-[0.5em] leading-relaxed mb-12">
              The requested data node has drifted into deep space. Re-establish encrypted connection with Mission Control.
            </p>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Link
                to="/"
                className="inline-block px-12 py-5 rounded-[2rem] bg-gradient-to-r from-[#FFD700] via-yellow-500 to-yellow-600 text-black font-black uppercase text-[11px] tracking-[0.3em] shadow-3xl hover:shadow-[0_0_30px_rgba(255,215,0,0.2)] transition-all duration-300 active:scale-95"
              >
                Return to Command Hub
              </Link>
            </motion.div>
        </div>
      </motion.div>

      {/* Foreground Drifting Node */}
      <motion.div
        className="absolute bottom-20 right-10 md:right-32 w-48 h-48 bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"
        animate={{ x: [-20, 20, -20], y: [-20, 20, -20] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
      />
    </div>
  );
}