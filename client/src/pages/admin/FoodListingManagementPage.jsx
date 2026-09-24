import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import RiskBadge from '../../components/RiskBadge';
import { Trash2 } from 'lucide-react';

export default function FoodListingManagementPage() {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchListings = async () => {
    try {
      const res = await api.get('/food');
      if (res.data.success) setListings(res.data.listings);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this listing as admin?")) return;
    try {
      await api.delete('/food/' + id);
      fetchListings();
    } catch (e) {
      alert("Failed to delete");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Food Listing Moderation</h1>
        <p className="text-xs text-slate-500">Live directory of all surplus food postings across all registered donors</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <p className="text-xs text-slate-400 py-8 text-center">Loading listings...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-200">
                <tr>
                  <th className="p-3 font-bold">Food Description</th>
                  <th className="p-3 font-bold">Donor</th>
                  <th className="p-3 font-bold">Category</th>
                  <th className="p-3 font-bold">Quantity</th>
                  <th className="p-3 font-bold">AI Risk</th>
                  <th className="p-3 font-bold">Status</th>
                  <th className="p-3 font-bold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {listings.map((l) => (
                  <tr key={l._id || l.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-800">{l.foodName}</td>
                    <td className="p-3 text-slate-600">{l.donorOrg || l.donorName}</td>
                    <td className="p-3 text-slate-500">{l.category}</td>
                    <td className="p-3 font-semibold text-slate-800">{l.quantity} {l.unit}</td>
                    <td className="p-3">
                      <RiskBadge riskLevel={l.riskLevel} urgency={l.urgency} riskScore={l.riskScore} />
                    </td>
                    <td className="p-3"><StatusBadge status={l.status} /></td>
                    <td className="p-3">
                      <button
                        onClick={() => handleDelete(l._id || l.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
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