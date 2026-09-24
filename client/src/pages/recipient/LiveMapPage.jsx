import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import MapViewer from '../../components/MapViewer';
import { Map, Filter, RefreshCw } from 'lucide-react';

export default function LiveMapPage() {
  const { user } = useAuth();
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchFood = async () => {
    setLoading(true);
    try {
      const res = await api.get('/food/nearby?maxDistance=50');
      if (res.data.success) {
        setListings(res.data.listings);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFood();
  }, []);

  const userCoord = user?.location?.coordinates || [28.6320, 77.2180];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Map className="w-6 h-6 text-emerald-600" /> Live Surplus Rescue Map
          </h1>
          <p className="text-xs text-slate-500">OpenStreetMap view of active food listings with urgency color-coded pins</p>
        </div>
        <button
          onClick={fetchFood}
          disabled={loading}
          className="px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-1.5"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} /> Refresh Map
        </button>
      </div>

      {/* Map Legend */}
      <div className="flex flex-wrap items-center gap-4 text-xs bg-white p-3 rounded-xl border border-slate-200">
        <span className="font-bold text-slate-400 uppercase text-[10px]">Pins Legend:</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500"></span> Safe / Normal</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-yellow-500"></span> Elevated (3-6h)</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-amber-500"></span> Urgent (1-3h)</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-rose-500"></span> Critical (&lt;1h)</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-full bg-indigo-500"></span> Your Shelter Hub</span>
      </div>

      <MapViewer listings={listings} userLocation={userCoord} height="580px" />
    </div>
  );
}