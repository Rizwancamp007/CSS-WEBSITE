import React from "react";

/**
 * @description Phantom Node (Skeleton Loader)
 * Prevents layout shifts during high-frequency data retrieval.
 * Hardened with custom shimmer animations and glassmorphism placeholders.
 */
export default function Skeleton({ variant = "card" }) {
  
  /**
   * @section List Variant
   * Used for Announcements or Admin Ledger rows.
   */
  if (variant === "list") {
    return (
      <div className="w-full bg-slate-900/40 border border-slate-800 p-6 flex items-center gap-6 animate-pulse mb-4 rounded-2xl relative overflow-hidden">
        {/* Shimmer Effect: Golden Frequency */}
        <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_25%,rgba(255,215,0,0.05)_50%,transparent_75%)] bg-[length:200%_100%] animate-shimmer" />
        
        <div className="w-14 h-14 bg-slate-800 rounded-2xl shrink-0 border border-slate-700/50"></div>
        <div className="flex-grow space-y-3">
          <div className="h-3 bg-slate-800 rounded-full w-1/3"></div>
          <div className="h-2 bg-slate-800 rounded-full w-1/2 opacity-40"></div>
        </div>
        <div className="h-10 bg-slate-800 rounded-xl w-28 border border-slate-700/50"></div>
      </div>
    );
  }

  /**
   * @section Card Variant
   * Default state for Event or Team Member profiles.
   */
  return (
    <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-[2.5rem] animate-pulse h-full relative overflow-hidden">
      {/* Shimmer Effect: Cyber Blue Frequency */}
      <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_25%,rgba(59,130,246,0.05)_50%,transparent_75%)] bg-[length:200%_100%] animate-shimmer" />
      
      {/* Image Node Placeholder */}
      <div className="w-full h-56 bg-slate-800/60 rounded-3xl mb-8 border border-slate-700/30"></div>
      
      {/* Identifier Placeholder */}
      <div className="h-7 bg-slate-800 rounded-full w-3/4 mb-6"></div>
      
      {/* Data Buffer Placeholders */}
      <div className="space-y-4 mb-10">
        <div className="h-2.5 bg-slate-800 rounded-full w-full opacity-50"></div>
        <div className="h-2.5 bg-slate-800 rounded-full w-full opacity-50"></div>
        <div className="h-2.5 bg-slate-800 rounded-full w-4/5 opacity-30"></div>
      </div>

      {/* Terminal Footer Placeholder */}
      <div className="flex justify-between items-center pt-8 border-t border-slate-800">
        <div className="h-3.5 bg-slate-800 rounded-full w-1/4"></div>
        <div className="h-11 bg-slate-800 rounded-xl w-1/3 border border-slate-700/50"></div>
      </div>

      {/* Internal CSS for the Shimmer Physics */}
      <style jsx>{`
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .animate-shimmer {
          animation: shimmer 2.5s infinite linear;
        }
      `}</style>
    </div>
  );
}