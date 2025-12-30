import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation, EffectFade } from "swiper/modules";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/effect-fade";

const slides = [
  {
    image: "/assets/images/university-main.jpg",
    title: "The Mainframe of Excellence",
    subtitle: "GCU Lahore Campus"
  },
  {
    image: "/assets/images/society-event.jpg",
    title: "Future-Proofing Leaders",
    subtitle: "Tech Symposium 2025"
  },
  {
    image: "/assets/images/pg-block.jpg",
    title: "Innovate. Code. Execute.",
    subtitle: "Research & Development Hub"
  },
];

/**
 * @description Refined Hero Slider
 * Synchronized with society branding. Features 'Ken Burns' animation
 * and industrial glassmorphism overlays.
 */
export default function HeroSlider() {
  return (
    <div className="w-full h-[450px] md:h-[650px] relative overflow-hidden rounded-[2.5rem] border border-slate-800 shadow-[0_20px_50px_rgba(0,0,0,0.6)] bg-slate-950">
      <Swiper
        effect={"fade"}
        speed={1200}
        autoplay={{ delay: 7000, disableOnInteraction: false }}
        pagination={{ 
          clickable: true,
          dynamicBullets: true 
        }}
        navigation={true}
        modules={[Autoplay, Pagination, Navigation, EffectFade]}
        className="h-full w-full"
      >
        {slides.map((slide, index) => (
          <SwiperSlide key={index} className="overflow-hidden">
            {/* Background with Ken Burns Effect */}
            <div 
              className="relative w-full h-full bg-cover bg-center animate-kenburns"
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              {/* Dual-Tone Overlay */}
              <div className="absolute inset-0 bg-gradient-to-r from-[#020617] via-[#020617]/40 to-transparent" />
              <div className="absolute inset-0 bg-black/20" />
              
              {/* Content Terminal */}
              <div className="absolute bottom-12 left-8 md:bottom-24 md:left-20 z-10 max-w-2xl">
                <div className="bg-slate-950/60 backdrop-blur-xl border-l-[6px] border-[#FFD700] p-8 md:p-10 rounded-r-3xl shadow-[0_0_40px_rgba(0,0,0,0.5)]">
                  <h2 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tighter uppercase italic">
                    {slide.title}
                  </h2>
                  <div className="flex items-center gap-4">
                    <div className="h-px w-12 bg-[#FFD700]/50" />
                    <p className="text-[#FFD700] text-sm md:text-xl font-black uppercase tracking-[0.4em]">
                      {slide.subtitle}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {/* Institutional Style Overrides */}
      <style jsx global>{`
        .animate-kenburns {
          animation: kenburns 20s infinite alternate;
        }
        @keyframes kenburns {
          from { transform: scale(1); }
          to { transform: scale(1.15); }
        }
        .swiper-button-next, .swiper-button-prev {
          color: #FFD700 !important;
          background: rgba(2, 6, 23, 0.7);
          width: 55px !important;
          height: 55px !important;
          border-radius: 50%;
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 215, 0, 0.3);
          transition: all 0.3s ease;
        }
        .swiper-button-next:hover, .swiper-button-prev:hover {
          background: #FFD700;
          color: #000 !important;
        }
        .swiper-button-next:after, .swiper-button-prev:after {
          font-size: 18px !important;
          font-weight: 900;
        }
        .swiper-pagination-bullet {
          background: rgba(255, 215, 0, 0.3) !important;
        }
        .swiper-pagination-bullet-active {
          background: #FFD700 !important;
          width: 25px !important;
          border-radius: 10px !important;
        }
      `}</style>
    </div>
  );
}