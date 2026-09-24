import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';

export default function ClaimsManagementPage() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/claims/all');
        if (res.data.success) setClaims(res.data.claims);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Claims & Logistics Audit Log</h1>
        <p className="text-xs text-slate-500">System-wide audit trail of all food reservations and handovers</p>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <p className="text-xs text-slate-400 py-8 text-center">Loading claims audit...</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-400 border-b border-slate-200">
                <tr>
                  <th className="p-3 font-bold">Listing Item</th>
                  <th className="p-3 font-bold">Donor Entity</th>
                  <th className="p-3 font-bold">Recipient Shelter</th>
                  <th className="p-3 font-bold">Qty</th>
                  <th className="p-3 font-bold">Status</th>
                  <th className="p-3 font-bold">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {claims.map((c) => (
                  <tr key={c._id || c.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-slate-800">{c.listing?.foodName || "Surplus Item"}</td>
                    <td className="p-3 text-slate-600">{c.donor?.organizationName || "Donor"}</td>
                    <td className="p-3 text-slate-600 font-semibold">{c.recipient?.organizationName || c.recipientOrg}</td>
                    <td className="p-3">{c.quantity} items</td>
                    <td className="p-3"><StatusBadge status={c.status} /></td>
                    <td className="p-3 text-slate-400">{new Date(c.claimedAt).toLocaleString()}</td>
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