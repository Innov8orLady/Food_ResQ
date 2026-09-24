import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell
} from 'recharts';
import { BarChart3, TrendingUp, Sparkles, CheckCircle2 } from 'lucide-react';

const COLORS = ['#10B981', '#065F46', '#34D399', '#6EE7B7', '#A7F3D0'];

export default function DonorAnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/analytics/donor');
        if (res.data.success) {
          setData(res.data.data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) return <div className="p-8 text-center text-xs text-slate-500">Loading donor intelligence graphs...</div>;

  const d = data || {
    totalMealsRescued: 420,
    wastePreventedKg: 210,
    co2OffsetKg: 525,
    monthlyTrends: [],
    categoryBreakdown: []
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Waste Intelligence & Analytics</h1>
        <p className="text-xs text-slate-500">Quantitative environmental savings and surplus distribution patterns</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 text-center shadow-sm">
          <p className="text-3xl font-black text-emerald-600">{d.totalMealsRescued}</p>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-1">Total Rescued Meals</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 text-center shadow-sm">
          <p className="text-3xl font-black text-slate-900">{d.wastePreventedKg} kg</p>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-1">Direct Landfill Diversion</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 text-center shadow-sm">
          <p className="text-3xl font-black text-emerald-600">{d.co2OffsetKg} kg</p>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-1">CO₂ Equivalent Offset</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Monthly Trend Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900">Monthly Meals Rescued</h3>
          <div className="h-64 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={d.monthlyTrends}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="month" stroke="#64748B" />
                <YAxis stroke="#64748B" />
                <Tooltip />
                <Bar dataKey="mealsRescued" fill="#10B981" radius={[6, 6, 0, 0]} name="Meals Rescued" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Pie Chart */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900">Food Surplus by Category</h3>
          <div className="h-64 w-full text-xs flex items-center justify-center">
            {d.categoryBreakdown.length === 0 ? (
              <p className="text-slate-400">No category breakdown data.</p>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={d.categoryBreakdown}
                    dataKey="count"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label
                  >
                    {d.categoryBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}