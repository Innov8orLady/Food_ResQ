import React from 'react';
import { AlertTriangle, CheckCircle2, Flame, Clock } from 'lucide-react';

export default function RiskBadge({ riskLevel, urgency, riskScore, showScore = true }) {
  const level = (riskLevel || 'LOW').toUpperCase();
  let bg = 'bg-emerald-50 text-emerald-700 border-emerald-200';
  let Icon = CheckCircle2;

  if (level === 'CRITICAL' || urgency === 'IMMEDIATE') {
    bg = 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse';
    Icon = Flame;
  } else if (level === 'HIGH' || urgency === 'URGENT') {
    bg = 'bg-amber-50 text-amber-800 border-amber-200';
    Icon = AlertTriangle;
  } else if (level === 'MEDIUM' || urgency === 'ELEVATED') {
    bg = 'bg-yellow-50 text-yellow-800 border-yellow-200';
    Icon = Clock;
  }

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold ${bg}`}>
      <Icon className="w-3.5 h-3.5" />
      <span>AI Risk: {level}</span>
      {showScore && riskScore !== undefined && (
        <span className="opacity-75 font-normal">({riskScore}/100)</span>
      )}
    </div>
  );
}