import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation, EffectFade } from "swiper/modules";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import "swiper/css/effect-fade";

/**
 * @description Hardened Slide Data
 * Institutional titles and subtitles aligned with the Mainframe aesthetic.
 */
const slides = [
  {
    image: "/assets/images/university-main.jpg",
    
  },
  {
    image: "/assets/images/society-event.jpg",
    
  },
  {
    image: "/assets/images/pg-block.jpg",
   
  },
];

/**
 * @description Refined Hero carousel with Gold/Blue branding and Glassmorphism.
 * Hardened for visual performance and cinematic transitions.
 */
export default function HeroSlider() {
  return (
    <div className="w-full h-[450px] md:h-[650px] relative overflow-hidden rounded-[2.5rem] border border-slate-800 shadow-[0_30px_60px_rgba(0,0,0,0.6)] bg-slate-950">
      <Swiper
        effect={"fade"}
        speed={1500}
        autoplay={{ delay: 8000, disableOnInteraction: false }}
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
            <div 
              className="relative w-full h-full bg-cover bg-center transition-transform duration-[8000ms] ease-out transform scale-110 animate-ken-burns"
              style={{ backgroundImage: `url(${slide.image})` }}
            >
              {/* Overlay: Multi-layer gradient for depth and readability */}
              <div className="absolute inset-0 bg-gradient-to-tr from-[#020617] via-[#020617]/40 to-black/20" />
              <div className="absolute inset-0 bg-black/10" />
              
              {/* Content Box: Industrial Glassmorphism */}
              <div className="absolute bottom-12 left-8 md:bottom-24 md:left-20 z-10 max-w-2xl">
                <div className="bg-slate-950/60 backdrop-blur-xl border-l-[6px] border-[#FFD700] p-8 md:p-10 rounded-r-3xl shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
                  <h2 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tighter uppercase italic leading-none">
                    {slide.title}
                  </h2>
                  <div className="flex items-center gap-4">
                    <div className="h-px w-10 bg-[#FFD700]/50" />
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

      {/* Global CSS for Terminal Styling */}
      <style jsx global>{`
        @keyframes ken-burns {
          from { transform: scale(1.1); }
          to { transform: scale(1.2); }
        }
        .animate-ken-burns {
          animation: ken-burns 8000ms ease-out infinite alternate;
        }
        .swiper-button-next, .swiper-button-prev {
          color: #FFD700 !important;
          background: rgba(2, 6, 23, 0.7);
          width: 55px !important;
          height: 55px !important;
          border-radius: 50%;
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 215, 0, 0.3);
          transform: scale(0.6);
          transition: all 0.3s ease;
        }
        .swiper-button-next:hover, .swiper-button-prev:hover {
          background: #FFD700;
          color: #000 !important;
          transform: scale(0.7);
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
          width: 30px !important;
          border-radius: 10px !important;
        }
      `}</style>
    </div>
  );
}