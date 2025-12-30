import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

/**
 * @description Site Footer Node
 * Final terminal anchor for all pages. Hardened with responsive layouts
 * and institutional branding.
 */
export default function Footer() {
  const currentYear = new Date().getFullYear();

  const socials = [
    {
      icon: "M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z",
      label: "Facebook",
      link: "https://web.facebook.com/CSSGCU",
      hoverColor: "hover:bg-[#1877F2]",
    },
    {
      icon: "M16 8a6 6 0 016 6v7h-4v-7a2 2 0 00-2-2 2 2 0 00-2 2v7h-4v-7a6 6 0 016-6zM2 9h4v12H2z",
      circle: "M4 4a2 2 0 11-2 2 2 2 0 012-2z",
      label: "LinkedIn",
      link: "https://www.linkedin.com/in/css-gcu-lahore",
      hoverColor: "hover:bg-[#0077B5]",
    },
    {
      icon: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zm0 10.162a3.997 3.997 0 110-7.994 3.997 3.997 0 010 7.994zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z",
      label: "Instagram",
      link: "https://www.instagram.com/css.gcu",
      hoverColor: "hover:bg-gradient-to-tr hover:from-[#f9ce34] hover:via-[#ee2a7b] hover:to-[#6228d7]",
    },
  ];

  return (
    <footer className="relative bg-[#020617] pt-20 pb-10 overflow-hidden border-t border-slate-800">
      
      {/* Background Polish */}
      <div className="absolute inset-0 z-0 w-full h-full bg-[linear-gradient(to_right,#FFD70005_1px,transparent_1px),linear-gradient(to_bottom,#FFD70005_1px,transparent_1px)] bg-[size:4.5rem_4.5rem] pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50" />
      <div className="absolute -top-[200px] left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-blue-600/5 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">
          
          {/* COLUMN 1: BRAND IDENTITY */}
          <div className="lg:col-span-5 space-y-6">
            <div className="flex items-center gap-4">
              <motion.div 
                whileHover={{ scale: 1.05, borderColor: '#FFD700' }}
                className="w-12 h-12 rounded-full border border-[#FFD700]/30 p-0.5 shadow-[0_0_15px_rgba(255,215,0,0.2)] transition-all duration-300"
              >
                <img src="/logo.jpg" alt="CSS Logo" className="w-full h-full object-cover rounded-full" />
              </motion.div>
              <div>
                <h2 className="text-xl font-black text-white tracking-tight uppercase leading-none">Computer Science Society</h2>
                <p className="text-[10px] font-black text-[#FFD700] uppercase tracking-[0.3em] mt-1">GCU Lahore</p>
              </div>
            </div>

            <p className="text-slate-500 leading-relaxed text-sm max-w-sm font-medium">
              Empowering future tech leaders through intensive workshops, competitive programming, and mainframe excellence.
            </p>

            <div className="flex gap-4 pt-2">
              {socials.map((social, i) => (
                <motion.a
                  key={i}
                  href={social.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  whileHover={{ scale: 1.1, y: -2 }}
                  className={`w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 hover:text-white hover:border-transparent transition-all duration-300 ${social.hoverColor}`}
                  aria-label={social.label}
                >
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d={social.icon} />
                    {social.circle && <circle cx="4" cy="4" r="2" />}
                  </svg>
                </motion.a>
              ))}
            </div>
          </div>

          {/* COLUMN 2: INTERNAL FREQUENCIES */}
          <div className="lg:col-span-3">
            <h3 className="text-sm font-black text-white mb-8 flex items-center gap-3 uppercase tracking-widest">
              <span className="w-8 h-px bg-[#FFD700] opacity-50"></span>
              Navigation
            </h3>
            <ul className="space-y-4">
              {["Home", "Events", "Team", "Announcements", "Contact", "About"].map((name) => (
                <li key={name}>
                  <Link to={name === "Home" ? "/" : `/${name.toLowerCase().replace(" ", "")}`} 
                        className="group flex items-center text-slate-500 hover:text-[#FFD700] transition-colors duration-200 font-bold uppercase text-[10px] tracking-widest">
                    <span className="w-0 group-hover:w-2 h-px bg-[#FFD700] mr-0 group-hover:mr-2 transition-all duration-300 opacity-0 group-hover:opacity-100"></span>
                    {name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* COLUMN 3: COMMUNICATIONS */}
          <div className="lg:col-span-4">
            <h3 className="text-sm font-black text-white mb-8 flex items-center gap-3 uppercase tracking-widest">
              <span className="w-8 h-px bg-[#FFD700] opacity-50"></span>
              Contact Node
            </h3>
            <ul className="space-y-6">
              <li>
                <motion.a 
                  href="mailto:css@gcu.edu.pk" 
                  whileHover={{ x: 5 }}
                  className="flex items-start gap-4 text-slate-500 hover:text-white transition-colors group"
                >
                  <div className="mt-1 bg-slate-900 border border-slate-800 p-2 rounded-lg text-blue-500 group-hover:bg-blue-600 group-hover:text-white group-hover:border-transparent transition-all shadow-xl">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <span className="block text-white font-black text-[10px] uppercase tracking-widest leading-none mb-1">Email Terminal</span>
                    <span className="text-xs font-bold font-mono">css@gcu.edu.pk</span>
                  </div>
                </motion.a>
              </li>
              <li>
                <motion.a 
                  href="https://maps.google.com/?q=GCU+Lahore+Computer+Science+Department" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  whileHover={{ x: 5 }}
                  className="flex items-start gap-4 text-slate-500 hover:text-white transition-colors group"
                >
                  <div className="mt-1 bg-slate-900 border border-slate-800 p-2 rounded-lg text-blue-500 group-hover:bg-red-600 group-hover:text-white group-hover:border-transparent transition-all shadow-xl">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <div>
                    <span className="block text-white font-black text-[10px] uppercase tracking-widest leading-none mb-1">Physical Sector</span>
                    <span className="text-xs font-bold uppercase">GCU Lahore, CS Dept</span>
                  </div>
                </motion.a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-900 flex flex-col items-center gap-4 text-center">
          <p className="text-slate-600 text-[10px] font-black uppercase tracking-[0.2em]">
            © {currentYear} Computer Science Society — GCU Lahore. Terminal Active // Secure Handshake.
          </p>
        </div>
      </div>
    </footer>
  );
}