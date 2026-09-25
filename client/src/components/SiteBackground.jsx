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
      {/* Background Image Layer */}
      <img
        src="/background.jpeg"
        alt=""
        className="w-full h-full object-cover object-center filter saturate-110 contrast-105 brightness-[0.96]"
        style={{
          opacity: 0.35,
        }}
      />

      {/* Auto-Adjusted Daylight Ambient Gradient Overlay */}
      <div 
        className="absolute inset-0 bg-gradient-to-b from-white/70 via-slate-50/60 to-slate-100/75" 
      />

      {/* Subtle Radial Vignette to keep content area crisp */}
      <div 
        className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_40%,rgba(241,245,249,0.5)_100%)]" 
      />
    </div>
  );
}
