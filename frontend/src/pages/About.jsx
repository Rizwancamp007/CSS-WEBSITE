import React from "react";
import { motion } from "framer-motion";

/**
 * @description The Manifest Node (About Page)
 * Hardened for visual impact and storytelling.
 */
export default function About() {
  const stats = [
    { label: "Active Members", value: "500+" },
    { label: "Events Hosted", value: "50+" },
    { label: "Years of Excellence", value: "25+" },
    { label: "Core Board", value: "15" },
  ];

  return (
    <div className="min-h-screen bg-[#020617] text-white overflow-x-hidden relative selection:bg-blue-500/30">
      
      {/* --- GRID FREQUENCY BACKGROUND --- */}
      <div className="fixed inset-0 z-0 w-full h-full bg-[linear-gradient(to_right,#FFD70008_1px,transparent_1px),linear-gradient(to_bottom,#FFD70008_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_80%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />
      
      {/* Ambient Lighting Node */}
      <motion.div
        className="fixed top-0 left-0 w-[600px] h-[600px] rounded-full bg-blue-600/5 blur-[120px] pointer-events-none z-0"
        animate={{ 
          x: [-20, 40, -20], 
          opacity: [0.1, 0.2, 0.1] 
        }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="relative z-10 px-6 pt-32 pb-24 max-w-7xl mx-auto">
        
        {/* --- SECTION 1: THE MANIFESTO --- */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center max-w-4xl mx-auto mb-24"
        >
          <div className="inline-block mb-6 px-4 py-1.5 rounded-full border border-[#FFD700]/20 bg-[#FFD700]/5 text-[#FFD700] text-[10px] font-black uppercase tracking-[0.3em]">
            Institutional Identity // GCU Lahore
          </div>
          <h1 className="text-6xl md:text-8xl font-black tracking-tighter leading-none mb-8">
            Inside the <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#FFD700] to-yellow-500 italic">Society</span>
          </h1>
          <p className="text-slate-400 text-lg md:text-xl leading-relaxed font-medium">
            The Computer Science Society (CSS) at GCU Lahore is a premier student-led 
            organization dedicated to bridging the gap between academic theory and 
            industrial execution.
          </p>
        </motion.div>

        {/* --- SECTION 2: CORE DIRECTIVES --- */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-32">
          {/* Mission Node */}
          <motion.div
            whileHover={{ y: -10, scale: 1.01, borderColor: 'rgba(37,99,235,0.4)' }}
            className="bg-slate-900/40 border border-slate-800 backdrop-blur-3xl p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden group transition-all duration-500"
          >
            <div className="absolute top-0 left-0 w-2 h-full bg-blue-600/50" />
            <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center mb-8 text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
               <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            </div>
            <h2 className="text-3xl font-black text-white mb-6 uppercase tracking-tight">Our Mission</h2>
            <p className="text-slate-400 leading-relaxed font-medium">
              To empower students with the specialized knowledge and technical 
              arsenal required to dominate the global tech landscape.
            </p>
          </motion.div>

          {/* Vision Node */}
          <motion.div
            whileHover={{ y: -10, scale: 1.01, borderColor: 'rgba(255,215,0,0.4)' }}
            className="bg-slate-900/40 border border-slate-800 backdrop-blur-3xl p-10 rounded-[2.5rem] shadow-2xl relative overflow-hidden group transition-all duration-500"
          >
            <div className="absolute top-0 left-0 w-2 h-full bg-[#FFD700]/50" />
            <div className="w-16 h-16 bg-yellow-500/10 rounded-2xl flex items-center justify-center mb-8 text-[#FFD700] group-hover:bg-[#FFD700] group-hover:text-black transition-all duration-500">
               <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
            </div>
            <h2 className="text-3xl font-black text-white mb-6 uppercase tracking-tight">Our Vision</h2>
            <p className="text-slate-400 leading-relaxed font-medium">
              To cement GCU as the epicenter of Pakistan's tech revolution — 
              cultivating a generation of leaders for a digital future.
            </p>
          </motion.div>
        </div>

        {/* --- SECTION 3: IMPACT ANALYTICS --- */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-32">
          {stats.map((stat, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05, y: -5, borderColor: 'rgba(59,130,246,0.3)' }}
              className="text-center p-8 rounded-[2rem] bg-slate-950/40 border border-slate-800/50 backdrop-blur-md transition-all shadow-xl"
            >
              <div className="text-4xl md:text-5xl font-black text-white mb-2 tracking-tighter">{stat.value}</div>
              <div className="text-[10px] font-black text-blue-500 uppercase tracking-widest">{stat.label}</div>
            </motion.div>
          ))}
        </div>

        {/* --- SECTION 4: CORE PILLARS --- */}
        <div className="mb-32">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-black text-white mb-4 uppercase tracking-tight">Core Objectives</h2>
            <div className="w-24 h-1 bg-blue-600 mx-auto rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: "Skill Forge", text: "Intensive workshops into AI, Software Development, and Cyber Security.", icon: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" },
              { title: "Network Hub", text: "Building an elite grid of tech professionals and industry mentors.", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857" },
              { title: "Innovation Lab", text: "Converting conceptual code into high-performance, scalable solutions.", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" }
            ].map((item, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.05, y: -10, borderColor: 'rgba(59,130,246,0.3)' }}
                className="bg-slate-900/40 border border-slate-800 p-10 rounded-[2rem] transition-all duration-500 shadow-2xl backdrop-blur-xl group"
              >
                <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center mb-6 text-blue-500 group-hover:bg-blue-600 group-hover:text-white transition-all">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={item.icon} /></svg>
                </div>
                <h3 className="text-xl font-black text-white mb-4 uppercase tracking-tight">{item.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed font-medium">{item.text}</p>
              </motion.div>
            ))}
          </div>
        </div>

        {/* --- SECTION 5: LEGACY BANNER --- */}
        <motion.div
          className="relative z-10 bg-slate-950/60 border border-slate-800 backdrop-blur-3xl p-12 md:p-16 rounded-[3rem] shadow-3xl text-center overflow-hidden"
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#FFD700] to-transparent opacity-40" />
          <h2 className="text-5xl font-black text-white mb-8 uppercase tracking-tighter">
            A Legacy of <span className="text-[#FFD700] italic">Excellence</span>
          </h2>
          <p className="text-slate-400 text-lg leading-relaxed max-w-4xl mx-auto font-medium">
            Since its inception, the Computer Science Society at GCU Lahore has 
            transformed from a simple student club into Pakistan’s most proactive tech 
            foundation. Our alumni are currently leading innovation at major tech giants globally.
          </p>
        </motion.div>

      </div>
    </div>
  );
}