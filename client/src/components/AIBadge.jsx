import React from 'react';
import { Sparkles } from 'lucide-react';

export default function AIBadge({ label = "AI Powered", variant = "emerald" }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[11px] font-bold tracking-wide uppercase bg-emerald-100 text-emerald-900 border border-emerald-300">
      <Sparkles className="w-3 h-3 text-emerald-600 animate-spin-slow" />
      {label}
    </span>
  );
}