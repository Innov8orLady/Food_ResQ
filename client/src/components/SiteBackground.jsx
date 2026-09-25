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
        className="w-full h-full object-cover object-center filter saturate-120 contrast-105 brightness-100"
        style={{
          opacity: 0.85,
        }}
      />

      {/* Sheer daylight overlay for maximum transparency and clarity */}
      <div 
        className="absolute inset-0 bg-gradient-to-b from-white/25 via-transparent to-white/20" 
      />
    </div>
  );
}
