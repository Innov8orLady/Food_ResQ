import React from 'react';

export default function StatusBadge({ status }) {
  const s = (status || 'AVAILABLE').toUpperCase();
  let color = 'bg-emerald-100 text-emerald-800 border-emerald-300';
  let label = s;

  if (s === 'CLAIMED') {
    color = 'bg-blue-100 text-blue-800 border-blue-300';
    label = 'Claimed';
  } else if (s === 'PICKUP_SCHEDULED') {
    color = 'bg-amber-100 text-amber-800 border-amber-300';
    label = 'Pickup Scheduled';
  } else if (s === 'COMPLETED') {
    color = 'bg-purple-100 text-purple-800 border-purple-300';
    label = 'Rescued / Done';
  } else if (s === 'EXPIRED') {
    color = 'bg-rose-100 text-rose-800 border-rose-300';
    label = 'Expired';
  } else if (s === 'CANCELLED') {
    color = 'bg-slate-100 text-slate-700 border-slate-300';
    label = 'Cancelled';
  } else {
    label = 'Available';
  }

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${color}`}>
      <span className="w-1.5 h-1.5 mr-1.5 rounded-full bg-current opacity-75"></span>
      {label}
    </span>
  );
}