import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import { CalendarCheck, Phone, CheckCircle2, XCircle, Clock } from 'lucide-react';

export default function ClaimsPickupPage() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchClaims = async () => {
    try {
      const res = await api.get('/claims/donor');
      if (res.data.success) {
        setClaims(res.data.claims);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  const handleUpdateStatus = async (claimId, newStatus) => {
    try {
      await api.put('/claims/' + claimId, { status: newStatus });
      fetchClaims();
    } catch (e) {
      alert("Failed to update status");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black text-slate-900">Claims & Handover Management</h1>
        <p className="text-xs text-slate-500">Confirm pickups and record successful rescue handovers</p>
      </div>

      {loading ? (
        <p className="text-xs text-slate-400 py-8 text-center">Loading claims...</p>
      ) : claims.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-slate-200">
          <CalendarCheck className="w-8 h-8 text-slate-300 mx-auto mb-2" />
          <p className="text-xs font-semibold text-slate-500">No surplus claims submitted yet.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {claims.map((c) => (
            <div key={c._id || c.id} className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
                <div>
                  <h3 className="font-bold text-base text-slate-900">{c.listing?.foodName || "Surplus Food"}</h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Claimed by <strong className="text-slate-800">{c.recipient?.organizationName || c.recipientOrg}</strong> ({c.quantity} items)
                  </p>
                </div>
                <StatusBadge status={c.status} />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400">NGO Contact</span>
                  <p className="font-bold text-slate-800 mt-0.5">{c.recipientName}</p>
                  <p className="text-slate-500">{c.recipientPhone || "N/A"}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Scheduled Pickup Time</span>
                  <p className="font-bold text-slate-800 mt-0.5">
                    {c.pickupTime ? new Date(c.pickupTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' }) : 'Pending Confirmation'}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Pickup Notes</span>
                  <p className="font-semibold text-slate-700 mt-0.5">{c.pickupNotes || "Standard collection vehicle"}</p>
                </div>
              </div>

              {/* Status Action Buttons */}
              <div className="pt-2 flex flex-wrap items-center gap-2">
                {c.status === 'CONFIRMED' && (
                  <button
                    onClick={() => handleUpdateStatus(c._id || c.id, 'PICKUP_SCHEDULED')}
                    className="px-4 py-2 rounded-xl bg-amber-600 text-white font-bold text-xs hover:bg-amber-700"
                  >
                    Confirm & Schedule Pickup
                  </button>
                )}
                {c.status === 'PICKUP_SCHEDULED' && (
                  <button
                    onClick={() => handleUpdateStatus(c._id || c.id, 'COMPLETED')}
                    className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700"
                  >
                    Mark Handover as Completed (Delivered)
                  </button>
                )}
                {c.status !== 'COMPLETED' && c.status !== 'CANCELLED' && (
                  <button
                    onClick={() => handleUpdateStatus(c._id || c.id, 'CANCELLED')}
                    className="px-3 py-2 rounded-xl border border-rose-200 text-rose-600 font-semibold text-xs hover:bg-rose-50"
                  >
                    Cancel Claim
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}