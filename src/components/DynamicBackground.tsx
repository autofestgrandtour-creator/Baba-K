"use client";

import React from 'react';
import { motion } from 'framer-motion';

export const DynamicBackground: React.FC = () => {
  return (
    <div id="dynamic-ambient-canvas" className="fixed inset-0 -z-10 bg-[#060608] overflow-hidden pointer-events-none select-none">
      {/* Dynamic flowing plasma circles */}
      <motion.div
        animate={{
          x: [0, 100, -80, 0],
          y: [0, -110, 80, 0],
          scale: [1, 1.25, 0.9, 1],
        }}
        transition={{
          duration: 28,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute top-[-15%] left-[-15%] w-[600px] h-[600px] rounded-full bg-gradient-to-tr from-neon-cyan/7 to-transparent blur-[140px]"
      />
      
      <motion.div
        animate={{
          x: [0, -110, 80, 0],
          y: [0, 110, -90, 0],
          scale: [1, 0.95, 1.15, 1],
        }}
        transition={{
          duration: 34,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute bottom-[-15%] right-[-15%] w-[650px] h-[650px] rounded-full bg-gradient-to-bl from-neon-pink/6 to-transparent blur-[160px]"
      />
      
      <motion.div
        animate={{
          x: [0, 90, -90, 0],
          y: [0, 90, -90, 0],
          scale: [1, 1.12, 0.92, 1],
        }}
        transition={{
          duration: 24,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
        className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-gradient-to-r from-purple-500/4 to-transparent blur-[130px]"
      />

      {/* Futuristic digital grid lining overlay */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.012)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.012)_1px,transparent_1px)] bg-[size:4.5rem_4.5rem] [mask-image:radial-gradient(ellipse_60%_60%_at_50%_50%,#000_65%,transparent_100%)] opacity-90"
      />
    </div>
  );
};

export default DynamicBackground;
