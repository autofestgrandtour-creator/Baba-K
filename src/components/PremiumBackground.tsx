"use client";

import React from 'react';
import Particles, { ParticlesProvider, useParticlesProvider } from '@tsparticles/react';
import { loadSlim } from '@tsparticles/slim';

/**
 * ParticlesLoader
 * Renders the Particles component once the ParticlesProvider indicates it is loaded.
 */
const ParticlesLoader: React.FC = () => {
  const { loaded } = useParticlesProvider();
  
  if (!loaded) return null;
  
  return (
    <Particles
      id="tsparticles-premium"
      className="absolute inset-0 pointer-events-none"
      options={{
        background: {
          color: {
            value: "transparent",
          },
        },
        fpsLimit: 120,
        interactivity: {
          detectsOn: "window", 
          events: {
            onHover: {
              enable: true,
              mode: "grab",
            },
            onClick: {
              enable: false,
            },
          },
          modes: {
            grab: {
              distance: 150,
              links: {
                opacity: 0.22,
                color: "#9E7E53",
              },
            },
          },
        },
        particles: {
          color: {
            value: "#9E7E53",
          },
          links: {
            color: "#9E7E53",
            distance: 120,
            enable: true,
            opacity: 0.12,
            width: 1,
          },
          move: {
            direction: "none",
            enable: true,
            outModes: {
              default: "out",
            },
            random: true,
            speed: 0.65,
            straight: false,
          },
          number: {
            density: {
              enable: true,
            },
            value: 90,
          },
          opacity: {
            value: { min: 0.1, max: 0.25 },
          },
          shape: {
            type: "circle",
          },
          size: {
            value: { min: 1, max: 2 },
          },
        },
        detectRetina: true,
      }}
    />
  );
};

/**
 * PremiumBackground Component
 * 
 * Layer 1: Ambient deep midnight sapphire and dark charcoal gradient backstop + vintage film grain SVG overlay.
 * Layer 2: Interactive gold particle nodes connecting on hover while letting all pointer interactions pass through.
 */
export const PremiumBackground: React.FC = () => {
  const handleInit = async (engine: any) => {
    await loadSlim(engine);
  };

  return (
    <div 
      id="premium-layered-background" 
      className="fixed inset-0 -z-30 w-screen h-screen overflow-hidden select-none pointer-events-none bg-gradient-to-br from-[#161413] via-[#1E1B1A] to-[#2B2724]"
    >
      {/* Layer 1a: Soft ambient luxurious spotlights */}
      <div 
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(158,126,83,0.055),transparent_50%)]" 
        style={{ pointerEvents: 'none' }}
      />
      <div 
        className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,rgba(158,126,83,0.04),transparent_50%)]" 
        style={{ pointerEvents: 'none' }}
      />

      {/* Layer 1b: Subtle Vintage Film Grain/Noise Overlay */}
      <div 
        className="absolute inset-0 opacity-[0.025] mix-blend-overlay pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 250 250' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.75' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
          pointerEvents: 'none',
        }}
      />

      {/* Layer 2: Interactive Golden Particle System */}
      <ParticlesProvider init={handleInit}>
        <ParticlesLoader />
      </ParticlesProvider>
    </div>
  );
};

export default PremiumBackground;
