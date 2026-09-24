import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import RiskBadge from '../../components/RiskBadge';
import {
  ArrowLeft, Clock, MapPin, Package, ShieldAlert, Sparkles, CheckCircle2, Phone, AlertCircle
} from 'lucide-react';

export default function FoodDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);
  const [claimedQty, setClaimedQty] = useState('');
  const [pickupNotes, setPickupNotes] = useState('Volunteer collection vehicle');
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/food/' + id);
        if (res.data.success) {
          setListing(res.data.listing);
          setClaimedQty(res.data.listing.quantity);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleClaim = async (e) => {
    e.preventDefault();
    setError('');
    setClaiming(true);
    try {
      const res = await api.post('/claims', {
        listingId: id,
        quantity: Number(claimedQty),
        pickupNotes
      });
      if (res.data.success) {
        navigate('/recipient/claims');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to claim food');
    } finally {
      setClaiming(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-xs text-slate-500">Loading food details...</div>;
  if (!listing) return <div className="p-8 text-center text-xs text-slate-500">Food listing not found.</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      <Link to="/recipient/nearby" className="inline-flex items-center gap-1 text-xs font-bold text-slate-500 hover:text-slate-800">
        <ArrowLeft className="w-4 h-4" /> Back to Nearby Food
      </Link>

      {error && (
        <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Info */}
        <div className="md:col-span-2 bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-5">
          <div className="flex items-center justify-between">
            <StatusBadge status={listing.status} />
            <RiskBadge riskLevel={listing.riskLevel} urgency={listing.urgency} riskScore={listing.riskScore} />
          </div>

          <div>
            <h1 className="text-2xl font-black text-slate-900">{listing.foodName}</h1>
            <p className="text-xs text-slate-500 mt-1">Donated by <strong className="text-slate-800">{listing.donorOrg || listing.donorName}</strong></p>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100">
            {listing.description || "Fresh surplus prepared with commercial kitchen hygiene standards."}
          </p>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-xl border border-slate-100 bg-slate-50">
              <span className="text-[10px] uppercase font-bold text-slate-400">Available Quantity</span>
              <p className="text-sm font-bold text-slate-800 mt-0.5">{listing.quantity} {listing.unit}</p>
            </div>
            <div className="p-3 rounded-xl border border-slate-100 bg-slate-50">
              <span className="text-[10px] uppercase font-bold text-slate-400">Dietary Profile</span>
              <p className="text-sm font-bold text-slate-800 mt-0.5">{listing.dietaryType}</p>
            </div>
            <div className="p-3 rounded-xl border border-slate-100 bg-slate-50">
              <span className="text-[10px] uppercase font-bold text-slate-400">Storage Condition</span>
              <p className="text-sm font-bold text-slate-800 mt-0.5">{listing.storageCondition}</p>
            </div>
            <div className="p-3 rounded-xl border border-slate-100 bg-slate-50">
              <span className="text-[10px] uppercase font-bold text-slate-400">Packaging Format</span>
              <p className="text-sm font-bold text-slate-800 mt-0.5">{listing.packagingType}</p>
            </div>
          </div>

          {/* Donor Contact & Address */}
          <div className="p-4 rounded-xl border border-slate-200 text-xs space-y-2">
            <h4 className="font-bold text-slate-800 uppercase text-[11px]">Donor Collection Address</h4>
            <p className="flex items-center gap-1.5 text-slate-600">
              <MapPin className="w-4 h-4 text-emerald-600" /> {listing.location?.address || "Civil Lines, Delhi NCR"}
            </p>
            {listing.donor?.phone && (
              <p className="flex items-center gap-1.5 text-slate-600">
                <Phone className="w-4 h-4 text-emerald-600" /> {listing.donor.phone}
              </p>
            )}
          </div>
        </div>

        {/* Right 1 Col: Claim Action Card */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/90 p-5 shadow-sm space-y-4 sticky top-20">
            <h3 className="font-bold text-sm text-slate-900 pb-2 border-b border-slate-100">
              Reserve This Surplus
            </h3>

            {listing.status === 'AVAILABLE' ? (
              <form onSubmit={handleClaim} className="space-y-3 text-xs">
                <div>
                  <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1">Claim Quantity ({listing.unit})</label>
                  <input
                    type="number"
                    required
                    min="1"
                    max={listing.quantity}
                    value={claimedQty}
                    onChange={(e) => setClaimedQty(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 uppercase text-[10px] mb-1">Pickup Notes / Driver Info</label>
                  <input
                    type="text"
                    value={pickupNotes}
                    onChange={(e) => setPickupNotes(e.target.value)}
                    placeholder="e.g. Van DL 01 AB 4321"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300"
                  />
                </div>

                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-[11px] text-emerald-800 space-y-1">
                  <p className="font-bold">Estimated Safe Consumption:</p>
                  <p>~{listing.remainingSafeHours} hours remaining before critical microbial risk threshold.</p>
                </div>

                <button
                  type="submit"
                  disabled={claiming}
                  className="w-full py-3 rounded-xl bg-emerald-600 text-white font-bold uppercase tracking-wider hover:bg-emerald-700 shadow-md transition-all disabled:opacity-50"
                >
                  {claiming ? 'Confirming Claim...' : 'Confirm & Claim Food'}
                </button>
              </form>
            ) : (
              <div className="p-4 bg-slate-50 rounded-xl text-center text-xs font-semibold text-slate-500">
                This food listing is currently {listing.status}.
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
}