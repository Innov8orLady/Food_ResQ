import React from 'react';

export default function StatCard({ title, value, unit = '', change, icon: Icon, color = 'emerald' }) {
  return (
    <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</span>
        {Icon && (
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>
      <div className="mt-2 flex items-baseline gap-2">
        <span className="text-3xl font-extrabold text-slate-900">{value}</span>
        {unit && <span className="text-sm font-semibold text-slate-500">{unit}</span>}
      </div>
      {change && (
        <p className="mt-1 text-xs text-emerald-600 font-medium flex items-center gap-1">
          <span>?</span> {change}
        </p>
      )}
    </div>
  );
}