"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface CowrieRatingProps {
  rating: number;
  interactive?: boolean;
  onChange?: (rating: number) => void;
  size?: 'sm' | 'md' | 'lg' | number;
  className?: string;
  id?: string;
}

// Detailed, stylized custom Cowrie Shell SVG Component
// It highlights a historic, cultural African vibe with the distinct central slit and teeth ridges.
export const CowrieShellSVG: React.FC<{
  filled: boolean;
  hovered?: boolean;
  sizePx: number;
}> = ({ filled, hovered, sizePx }) => {
  // Color configuration:
  // - Filled / Selected: Futuristic neon-cyan
  // - Unfilled / Deselected: Faded, desaturated zinc outline
  const strokeColor = filled
    ? '#00F2FF' // neon-cyan
    : hovered
    ? '#FF00E5' // neon-pink preview
    : '#3F3F46'; // zinc-700

  const fillColor = filled
    ? 'rgba(0, 242, 255, 0.15)' // subtle neon-cyan fill glow
    : hovered
    ? 'rgba(255, 0, 229, 0.1)' // subtle neon-pink fill glow
    : 'rgba(24, 24, 27, 0.4)'; // zinc-900/40 background

  const teethColor = filled
    ? '#002C30' // deep cyan contrast
    : hovered
    ? '#30002B' // deep pink contrast
    : '#18181B'; // dark background

  return (
    <svg
      width={sizePx}
      height={sizePx}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="transition-all duration-300 transform"
      style={{ display: 'inline-block', verticalAlign: 'middle' }}
    >
      {/* Outer Shell shadow/glow */}
      {filled && (
        <circle cx="32" cy="32" r="26" fill="rgba(0, 242, 255, 0.08)" className="animate-pulse" />
      )}

      {/* Main Oval Body of the Cowrie Shell */}
      <path
        d="M32 6C18.5 6 12 17 12 32C12 47 18.5 58 32 58C45.5 58 52 47 52 32C52 17 45.5 6 32 6Z"
        fill={fillColor}
        stroke={strokeColor}
        strokeWidth="3.5"
        strokeLinejoin="round"
      />

      {/* Stylized rounded back hump highlight of the cowrie structure */}
      <path
        d="M20 32C20 20 25 10 32 10C39 10 44 20 44 32C44 44 39 54 32 54C25 54 20 44 20 32Z"
        stroke={strokeColor}
        strokeWidth="1.2"
        strokeDasharray="3 3"
        opacity="0.65"
      />

      {/* Custom center slit mimicking the natural opening of the cowrie */}
      <path
        d="M32 14C30 18 31 24 29 32C27 39 30 46 32 50C34 46 37 39 35 32C33 24 34 18 32 14Z"
        fill={teethColor}
        stroke={strokeColor}
        strokeWidth="2"
        strokeLinejoin="round"
      />

      {/* Distinct left and right outer teeth-lines */}
      {/* Left side transverse teeth ridges */}
      <line x1="28" y1="22" x2="21" y2="22" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" />
      <line x1="26" y1="27" x2="19" y2="27" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" />
      <line x1="25" y1="32" x2="18" y2="32" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" />
      <line x1="26" y1="37" x2="19" y2="37" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" />
      <line x1="28" y1="42" x2="21" y2="42" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" />

      {/* Right side transverse teeth ridges */}
      <line x1="36" y1="22" x2="43" y2="22" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" />
      <line x1="38" y1="27" x2="45" y2="27" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" />
      <line x1="39" y1="32" x2="46" y2="32" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" />
      <line x1="38" y1="37" x2="45" y2="37" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" />
      <line x1="36" y1="42" x2="43" y2="42" stroke={strokeColor} strokeWidth="2" strokeLinecap="round" />

      {/* Core narrow center slit teeth inside the opening */}
      <path d="M29.5 24H32.5M29 30H32M28.5 36H32M29.5 42H32.5" stroke={strokeColor} strokeWidth="1.5" />
      <path d="M31.5 24H34.5M32 30H35M32 36H35.5M31.5 42H34.5" stroke={strokeColor} strokeWidth="1.5" />
    </svg>
  );
};

export const CowrieRating: React.FC<CowrieRatingProps> = ({
  rating,
  interactive = false,
  onChange,
  size = 'md',
  className = '',
  id = 'cowrie-rating-display',
}) => {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  // Determine size in pixels
  const getSizePx = (): number => {
    if (typeof size === 'number') return size;
    switch (size) {
      case 'sm':
        return 18;
      case 'lg':
        return 36;
      case 'md':
      default:
        return 26;
    }
  };

  const sizePx = getSizePx();

  // Ratings range
  const starsArray = [1, 2, 3, 4, 5];

  // Logic to determine if shell is filled or temporarily previewed via hover
  const isFilled = (indexValue: number): boolean => {
    if (interactive && hoverRating !== null) {
      return indexValue <= hoverRating;
    }
    return indexValue <= rating;
  };

  // Keyboard accessibility helper
  const handleKeyDown = (e: React.KeyboardEvent, indexValue: number) => {
    if (!interactive || !onChange) return;
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      // Toggle value - if clicking current set value, clear/reset it
      onChange(rating === indexValue ? 0 : indexValue);
    } else if (e.key === 'ArrowRight' && indexValue < 5) {
      e.preventDefault();
      const nextEl = document.getElementById(`${id}-item-${indexValue + 1}`);
      nextEl?.focus();
    } else if (e.key === 'ArrowLeft' && indexValue > 1) {
      e.preventDefault();
      const prevEl = document.getElementById(`${id}-item-${indexValue - 1}`);
      prevEl?.focus();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onChange(0);
    }
  };

  return (
    <div
      id={id}
      className={`flex flex-row flex-nowrap items-center gap-1 sm:gap-1.5 shrink-0 select-none ${className}`}
      role="img"
      aria-label={`Rating: ${rating} out of 5 Cowrie Shells${interactive ? '. Interactive rating component.' : ''}`}
    >
      {starsArray.map((num) => {
        const filled = isFilled(num);
        const activeHover = interactive && hoverRating !== null && num <= hoverRating;

        if (interactive) {
          return (
            <button
              key={num}
              id={`${id}-item-${num}`}
              type="button"
              className="p-0.5 sm:p-1 rounded-lg focus:outline-none focus:ring-1 focus:ring-[#00F2FF] focus:ring-opacity-50 transition-transform hover:scale-110 active:scale-95 cursor-pointer relative group"
              onClick={() => {
                if (onChange) {
                  // If clicking the current exact rating, clear it!
                  onChange(rating === num ? 0 : num);
                }
              }}
              onMouseEnter={() => setHoverRating(num)}
              onMouseLeave={() => setHoverRating(null)}
              onKeyDown={(e) => handleKeyDown(e, num)}
              aria-label={`Rate ${num} Cowrie ${num === 1 ? 'Shell' : 'Shells'}`}
              aria-pressed={rating === num}
            >
              <motion.div
                layout
                transition={{ type: 'spring', stiffness: 350, damping: 25 }}
              >
                <CowrieShellSVG filled={filled} hovered={activeHover} sizePx={sizePx} />
              </motion.div>

              {/* Minimal tooltip guide explaining rating significance */}
              <span className="absolute -top-7 left-1/2 transform -translate-x-1/2 bg-black/90 text-[8px] text-white/80 font-mono py-0.5 px-2.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none tracking-tight border border-white/5 z-20">
                {num === 1
                  ? 'Ok'
                  : num === 2
                  ? 'Good'
                  : num === 3
                  ? 'Great'
                  : num === 4
                  ? 'Superb'
                  : 'Legendary vibe'}
              </span>
            </button>
          );
        }

        // Static Read-only Rating Item
        return (
          <div
            key={num}
            id={`${id}-item-${num}`}
            className="p-0.5"
            title={`${rating}/5 Cowrie shells`}
          >
            <CowrieShellSVG filled={filled} sizePx={sizePx} />
          </div>
        );
      })}
    </div>
  );
};

