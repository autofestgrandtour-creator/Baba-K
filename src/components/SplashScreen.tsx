"use client";

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
interface SplashScreenProps {
  onComplete?: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onComplete }) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Check session storage to see if the luxury entry has already premium-rendered
    const hasVisited = typeof window !== 'undefined' && sessionStorage.getItem('babak_splash_viewed') === 'true';
    if (hasVisited) {
      setIsVisible(false);
      if (onComplete) onComplete();
      return;
    }

    // Lock scrolling on the body while splash is running
    document.body.style.overflow = 'hidden';

    const timer = setTimeout(() => {
      setIsVisible(false);
      // Re-enable document scrolling
      document.body.style.overflow = '';
      sessionStorage.setItem('babak_splash_viewed', 'true');
      if (onComplete) onComplete();
    }, 2800); // 2.8 seconds total duration (2.5s display + intro rhythm)

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = '';
    };
  }, [onComplete]);

  // Brand Name letters for staggered reveal: "BABA • K"
  const titleLetters = ["B", "A", "B", "A", " ", "•", " ", "K"];

  // Tagline words for organic stagger
  const taglineWords = ["WEST", "AFRICAN", "CULTURAL", "LEDGER", "&", "ELITE", "GATHERINGS"];

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          id="luxury-splash-screen"
          initial={{ y: 0, opacity: 1 }}
          exit={{ 
            y: '-100%', 
            opacity: 0,
            transition: { 
              duration: 0.85, 
              ease: [0.16, 1, 0.3, 1], // Smooth custom cubic-bezier
              when: "afterChildren"
            } 
          }}
          className="fixed inset-0 z-[10000] flex flex-col items-center justify-center bg-[#09090B] select-none text-zinc-100 overflow-hidden" 
        >
          {/* Subtle Golden Ray particle in background */}
          <div className="absolute inset-0 opacity-15 mix-blend-screen pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-amber-500/5 rounded-full blur-[140px] pointer-events-none" />
          </div>

          <div className="relative flex flex-col items-center text-center max-w-xl px-6">
            
            {/* Custom Luxury SVG Cowrie Shell */}
            <motion.div
              initial={{ scale: 0.82, opacity: 0 }}
              animate={{ 
                scale: 1, 
                opacity: 1,
                rotate: [0, 2, -2, 0]
              }}
              transition={{
                scale: { duration: 1.6, ease: [0.16, 1, 0.3, 1] },
                opacity: { duration: 1.2, ease: "easeOut" },
                rotate: { repeat: Infinity, duration: 6, ease: "easeInOut" }
              }}
              className="w-28 h-28 md:w-36 md:h-36 mb-8 flex items-center justify-center filter drop-shadow-[0_0_20px_rgba(245,158,11,0.25)]"
            >
              <svg 
                viewBox="0 0 100 120" 
                fill="none" 
                xmlns="http://www.w3.org/2000/svg"
                className="w-full h-full"
              >
                <defs>
                  {/* Luxury Amber Gold metallic gradients */}
                  <linearGradient id="cowrieGrad" x1="10%" y1="0%" x2="90%" y2="100%">
                    <stop offset="0%" stopColor="#FFF2D4" />
                    <stop offset="35%" stopColor="#DFB36C" />
                    <stop offset="70%" stopColor="#9C7132" />
                    <stop offset="100%" stopColor="#41290C" />
                  </linearGradient>
                  
                  <linearGradient id="slitGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#120c04" />
                    <stop offset="50%" stopColor="#2D1D09" />
                    <stop offset="100%" stopColor="#120c04" />
                  </linearGradient>

                  <filter id="premiumGlow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="4" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Outer Shell Mound */}
                <path 
                  d="M50 5 C78 5, 88 35, 88 65 C88 92, 70 115, 50 115 C30 115, 12 92, 12 65 C12 35, 22 5, 50 5 Z" 
                  fill="url(#cowrieGrad)" 
                  stroke="#FFE4A0"
                  strokeWidth="0.75"
                />

                {/* Shading/Depth Ribs around the outer dome */}
                <path d="M22 65 C22 45, 30 20, 50 16" stroke="#5E431B" strokeWidth="0.5" strokeDasharray="1 2" opacity="0.4" />
                <path d="M78 65 C78 45, 70 20, 50 16" stroke="#5E431B" strokeWidth="0.5" strokeDasharray="1 2" opacity="0.4" />
                <path d="M18 75 C18 90, 32 108, 50 110" stroke="#FFF2D4" strokeWidth="0.5" opacity="0.3" />
                <path d="M82 75 C82 90, 68 108, 50 110" stroke="#FFF2D4" strokeWidth="0.5" opacity="0.3" />

                {/* Inner Slit (The Iconic indented Cowrie groove) */}
                <path 
                  d="M50 18 C46 30, 44 48, 44 65 C44 82, 47 100, 50 112 C54 100, 56 82, 56 65 C56 48, 54 30, 50 18 Z" 
                  fill="url(#slitGrad)" 
                />

                {/* Left Ridge Teeth */}
                <path d="M44 32 L37 34" stroke="#FFF2D4" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M44 41 L36 43" stroke="#FFF2D4" strokeWidth="1.7" strokeLinecap="round" />
                <path d="M43 50 L35 52" stroke="#FFF2D4" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M43 59 L35 61" stroke="#FFF2D4" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M43 68 L34 69" stroke="#FFF2D4" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M44 77 L35 78" stroke="#FFF2D4" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M44 86 L37 87" stroke="#FFF2D4" strokeWidth="1.7" strokeLinecap="round" />
                <path d="M46 95 L40 95" stroke="#FFF2D4" strokeWidth="1.5" strokeLinecap="round" />

                {/* Right Ridge Teeth */}
                <path d="M56 32 L63 34" stroke="#FFF2D4" strokeWidth="1.5" strokeLinecap="round" />
                <path d="M56 41 L64 43" stroke="#FFF2D4" strokeWidth="1.7" strokeLinecap="round" />
                <path d="M57 50 L65 52" stroke="#FFF2D4" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M57 59 L65 61" stroke="#FFF2D4" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M57 68 L66 69" stroke="#FFF2D4" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M56 77 L65 78" stroke="#FFF2D4" strokeWidth="1.8" strokeLinecap="round" />
                <path d="M56 86 L63 87" stroke="#FFF2D4" strokeWidth="1.7" strokeLinecap="round" />
                <path d="M54 95 L60 95" stroke="#FFF2D4" strokeWidth="1.5" strokeLinecap="round" />

                {/* Central Specular highlight highlighting curvature */}
                <ellipse cx="50" cy="12" rx="3" ry="1.5" fill="#FFFFFF" opacity="0.4" />
                <ellipse cx="50" cy="111" rx="2" ry="1" fill="#FFFFFF" opacity="0.3" />
              </svg>
            </motion.div>

            {/* Letter-by-Letter Staggered Brand Name */}
            <h1 className="text-3xl md:text-5xl font-display font-extrabold tracking-[0.35em] text-white flex justify-center items-center gap-1">
              {titleLetters.map((letter, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 0.95, y: 0 }}
                  transition={{
                    duration: 0.8,
                    delay: 0.35 + (i * 0.08),
                    ease: [0.16, 1, 0.3, 1]
                  }}
                  className={letter === '•' ? "text-amber-500 scale-110 px-1 font-sans" : "font-display"}
                >
                  {letter}
                </motion.span>
              ))}
            </h1>

            {/* Premium Gold Accent bar */}
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: '80px', opacity: 0.5 }}
              transition={{ delay: 1.1, duration: 1, ease: 'easeInOut' }}
              className="h-[1px] bg-gradient-to-r from-transparent via-amber-500 to-transparent mt-5 mb-5"
            />

            {/* Staggered Tagline Word reveal */}
            <div className="flex flex-wrap items-center justify-center gap-x-1.5 gap-y-1">
              {taglineWords.map((word, index) => (
                <span key={index} className="overflow-hidden inline-flex">
                  <motion.span
                    initial={{ y: '100%', opacity: 0 }}
                    animate={{ y: '0%', opacity: 0.55 }}
                    transition={{
                      duration: 0.6,
                      delay: 1.1 + (index * 0.09),
                      ease: "easeOut"
                    }}
                    className="text-[9.5px] md:text-[10px] font-sans tracking-[0.25em] font-bold"
                  >
                    {word}
                  </motion.span>
                </span>
              ))}
            </div>

            {/* Fine print sandbox loader accent */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.2 }}
              transition={{ delay: 1.8, duration: 0.8 }}
              className="mt-14 flex items-center justify-center gap-2"
            >
              <div className="flex gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500/80" />
              </div>
              <span className="text-[7.5px] font-sans tracking-[0.3em] font-black uppercase text-zinc-300">ESTABLISHING TICKETING TRUST</span>
            </motion.div>

          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

