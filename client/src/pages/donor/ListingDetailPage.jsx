import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../services/api';
import StatusBadge from '../../components/StatusBadge';
import RiskBadge from '../../components/RiskBadge';
import {
  Sparkles, ArrowLeft, GitMerge, MapPin, Package, Clock, ShieldAlert, CheckCircle2, Phone
} from 'lucide-react';

export default function ListingDetailPage() {
  const { id } = useParams();
  const [listing, setListing] = useState(null);
  const [matchingData, setMatchingData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [matchingLoading, setMatchingLoading] = useState(false);

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const res = await api.get('/food/' + id);
        if (res.data.success) {
          setListing(res.data.listing);
          // Run AI Matching
          runMatching(res.data.listing);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchListing();
  }, [id]);

  const runMatching = async (listingDoc) => {
    setMatchingLoading(true);
    try {
      const res = await api.post('/ai/matching', {
        listingId: listingDoc._id || listingDoc.id,
        listingData: listingDoc
      });
      if (res.data.success) {
        setMatchingData(res.data.result);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setMatchingLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-xs text-slate-500">Loading surplus record...</div>;
  if (!listing) return <div className="p-8 text-center text-xs text-slate-500">Listing not found.</div>;

  return (
    <div className="space-y-6">
      
      <div className="flex items-center justify-between">
        <Link to="/donor/listings" className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-800">
          <ArrowLeft className="w-4 h-4" /> Back to My Listings
        </Link>
        <StatusBadge status={listing.status} />
      </div>

      {/* Main Details Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <div className="flex flex-wrap items-center gap-2">
            <RiskBadge riskLevel={listing.riskLevel} urgency={listing.urgency} riskScore={listing.riskScore} />
            <span className="text-xs font-bold text-slate-500 px-2.5 py-0.5 rounded bg-slate-100">
              {listing.category}
            </span>
            <span className="text-xs font-bold text-emerald-700 px-2.5 py-0.5 rounded bg-emerald-50 border border-emerald-200">
              {listing.dietaryType}
            </span>
          </div>

          <h1 className="text-2xl font-black text-slate-900">{listing.foodName}</h1>
          <p className="text-xs text-slate-600 leading-relaxed">{listing.description || "No custom description provided."}</p>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 font-semibold uppercase text-[10px]">Available Quantity</span>
              <p className="text-sm font-bold text-slate-800 mt-0.5">{listing.quantity} {listing.unit}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 font-semibold uppercase text-[10px]">Storage Condition</span>
              <p className="text-sm font-bold text-slate-800 mt-0.5">{listing.storageCondition}</p>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 font-semibold uppercase text-[10px]">Safe Consumption Window</span>
              <p className="text-sm font-bold text-slate-800 mt-0.5">~{listing.remainingSafeHours} hours</p>
            </div>
          </div>
        </div>

        {/* AI Recognition Info Box */}
        <div className="bg-emerald-50/60 rounded-xl border border-emerald-200/80 p-4 text-xs space-y-2">
          <div className="flex items-center gap-1.5 text-emerald-800 font-bold uppercase text-[10px]">
            <Sparkles className="w-3.5 h-3.5" /> AI Vision Classification
          </div>
          <p className="font-bold text-slate-900 text-sm">{listing.aiRecognition?.detectedItem || listing.foodName}</p>
          <p className="text-slate-600 text-[11px]">
            Confidence Score: <strong className="text-emerald-700">{listing.aiRecognition?.confidence || 92}%</strong>
          </p>
          <div className="pt-2 flex flex-wrap gap-1">
            {(listing.aiRecognition?.tags || ['Cooked', 'Staple']).map((t, idx) => (
              <span key={idx} className="px-2 py-0.5 rounded bg-white text-emerald-800 text-[10px] font-semibold border border-emerald-200">
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* AI MODULE 3: INTELLIGENT RECIPIENT MATCHING SECTION */}
      <div className="bg-white rounded-2xl border border-slate-200/90 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <GitMerge className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">AI Recipient Matching Engine (Module 3)</h3>
              <p className="text-xs text-slate-500">Multi-attribute algorithm: Distance (35%), Capacity (25%), Dietary Fit (20%), Urgency (10%), Reliability (10%)</p>
            </div>
          </div>
          <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-md border border-indigo-200">
            Weighted Score 0-100
          </span>
        </div>

        {matchingLoading ? (
          <p className="text-xs text-slate-400 py-6 text-center">Calculating spatial & capacity match scores...</p>
        ) : !matchingData || matchingData.rankedMatches?.length === 0 ? (
          <p className="text-xs text-slate-400 py-4 text-center">No active recipients evaluated.</p>
        ) : (
          <div className="space-y-3">
            {matchingData.rankedMatches.map((m, idx) => (
              <div key={m.recipientId || idx} className="p-4 rounded-xl border border-slate-200/80 bg-slate-50/50 hover:bg-white transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-sm text-slate-900">{m.name}</span>
                    <span className="text-[10px] uppercase font-bold text-slate-500 px-2 py-0.5 rounded bg-slate-200/70">
                      {m.organizationType || "NGO"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-slate-400" /> {m.distanceKm} km away • Intake Capacity: {m.capacity} meals
                  </p>
                  <p className="text-[11px] text-emerald-700 font-medium">{m.recommendationReason}</p>
                </div>

                {/* Match Score Display */}
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right">
                    <p className="text-2xl font-black text-emerald-600">{m.matchScore}%</p>
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400">AI Match Score</p>
                  </div>
                  {m.phone && (
                    <a
                      href={`tel:${m.phone}`}
                      className="p-2.5 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-100"
                      title="Contact NGO"
                    >
                      <Phone className="w-4 h-4" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}