import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { History, Heart, CheckCircle2 } from 'lucide-react';

export default function ClaimHistoryPage() {
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/claims/my');
        if (res.data.success) {
          setHistory(res.data.claims.filter(c => c.status === 'COMPLETED'));
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const totalMeals = history.reduce((acc, c) => acc + (c.quantity || 0), 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Claim History & Impact</h1>
        <p className="text-xs text-slate-500">Record of all received surplus meals served to community beneficiaries</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 text-center shadow-sm">
          <p className="text-3xl font-black text-emerald-600">{totalMeals}</p>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-1">Meals Served</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 text-center shadow-sm">
          <p className="text-3xl font-black text-slate-800">{Math.round(totalMeals * 0.5)} kg</p>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-1">Food Waste Diverted</p>
        </div>
        <div className="bg-white p-5 rounded-2xl border border-slate-200 text-center shadow-sm">
          <p className="text-3xl font-black text-emerald-600">{Math.round(totalMeals * 1.25)} kg</p>
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mt-1">CO₂ Averted</p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm">
        {loading ? (
          <p className="text-xs text-slate-400 py-6 text-center">Loading records...</p>
        ) : history.length === 0 ? (
          <p className="text-xs text-slate-400 py-6 text-center">No completed claims in archive.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-100">
                <tr>
                  <th className="py-2.5 font-bold">Food Description</th>
                  <th className="py-2.5 font-bold">Donor Partner</th>
                  <th className="py-2.5 font-bold">Quantity</th>
                  <th className="py-2.5 font-bold">Delivered Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {history.map((h) => (
                  <tr key={h._id || h.id} className="hover:bg-slate-50">
                    <td className="py-3 font-semibold text-slate-800">{h.listing?.foodName || "Surplus Food"}</td>
                    <td className="py-3 text-slate-600">{h.donor?.organizationName || "Commercial Donor"}</td>
                    <td className="py-3 font-bold text-slate-800">{h.quantity} meals</td>
                    <td className="py-3 text-slate-500">
                      {h.completedAt ? new Date(h.completedAt).toLocaleDateString() : new Date(h.claimedAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}