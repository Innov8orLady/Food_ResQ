import React from 'react';

/**
 * SiteBackground Component
 * Renders the humanitarian food rescue background image across the entire website
 * with auto-adjusted visibility, soft ambient lighting, and backdrop filters
 * ensuring all text, charts, and buttons remain 100% sharp and readable.
 */
export default function SiteBackground() {
  return (
    <div 
      className="fixed inset-0 pointer-events-none -z-10 overflow-hidden select-none"
      aria-hidden="true"
    >
      {/* High-Definition Background Image Layer */}
      <img
        src="/background.jpeg"
        alt=""
        className="w-full h-full object-cover object-center filter saturate-[1.15] contrast-[1.08] brightness-[0.98]"
        style={{
          opacity: 0.52,
          imageRendering: '-webkit-optimize-contrast',
          transform: 'translateZ(0)',
        }}
      />

      {/* Balanced daylight ambient wash ensuring high contrast for all foreground text */}
      <div 
        className="absolute inset-0 bg-gradient-to-b from-white/70 via-white/50 to-slate-100/70" 
      />
    </div>
  );
}
