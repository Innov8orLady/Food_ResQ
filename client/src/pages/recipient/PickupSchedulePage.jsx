import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import RouteMap from '../../components/RouteMap';
import { Truck, Navigation, Sparkles, MapPin, Clock } from 'lucide-react';

export default function PickupSchedulePage() {
  const { user } = useAuth();
  const [pickups, setPickups] = useState([]);
  const [routeOptimization, setRouteOptimization] = useState(null);
  const [loading, setLoading] = useState(true);
  const [optimizing, setOptimizing] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await api.get('/pickups');
        if (res.data.success) {
          setPickups(res.data.pickups);
          // Run AI route optimization
          runRoutePlanner(res.data.pickups);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const runRoutePlanner = async (pickupList) => {
    setOptimizing(true);
    try {
      // Build stops list from pickups or default demo stops
      const demoStops = [
        {
          name: "Green Leaf Restaurant",
          address: "14 Rajpur Road, Civil Lines",
          coordinates: [28.6750, 77.2250],
          urgency: "URGENT",
          quantity: 40
        },
        {
          name: "The Grand Artisan Bakery",
          address: "Khan Market",
          coordinates: [28.6000, 77.2270],
          urgency: "NORMAL",
          quantity: 45
        },
        {
          name: "Central Seminar Banquet",
          address: "Club Road",
          coordinates: [28.6790, 77.2210],
          urgency: "IMMEDIATE",
          quantity: 50
        }
      ];

      const stops = pickupList.length > 0 ? pickupList.map(p => ({
        name: p.donor?.organizationName || "Donor Kitchen",
        address: p.donor?.location?.address || "Address",
        coordinates: p.donor?.location?.coordinates || [28.6750, 77.2250],
        urgency: p.listing?.urgency || "NORMAL",
        quantity: p.claim?.quantity || 30
      })) : demoStops;

      const origin = {
        name: user.organizationName || user.name,
        coordinates: user.location?.coordinates || [28.6320, 77.2180]
      };

      const res = await api.post('/ai/route-optimization', { origin, stops });
      if (res.data.success) {
        setRouteOptimization(res.data.result);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setOptimizing(false);
    }
  };

  const origin = {
    name: user.organizationName || user.name,
    coordinates: user.location?.coordinates || [28.6320, 77.2180]
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
            <Truck className="w-6 h-6 text-emerald-600" /> AI Pickup Route Optimizer (Module 5)
          </h1>
          <p className="text-xs text-slate-500">Urgency-penalized traveling salesperson algorithm for minimal turnaround transit</p>
        </div>
        <button
          onClick={() => runRoutePlanner(pickups)}
          disabled={optimizing}
          className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 flex items-center gap-1.5 shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5" /> {optimizing ? 'Calculating TSP...' : 'Re-Optimize Route'}
        </button>
      </div>

      {routeOptimization && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center shadow-sm">
            <p className="text-2xl font-black text-emerald-600">{routeOptimization.totalDistanceKm} km</p>
            <p className="text-[10px] font-bold uppercase text-slate-400 mt-0.5">Roundtrip Distance</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center shadow-sm">
            <p className="text-2xl font-black text-slate-900">~{routeOptimization.estimatedDurationMin} mins</p>
            <p className="text-[10px] font-bold uppercase text-slate-400 mt-0.5">Estimated Duration</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center shadow-sm">
            <p className="text-2xl font-black text-indigo-600">{routeOptimization.orderedStops?.length || 0} Stops</p>
            <p className="text-[10px] font-bold uppercase text-slate-400 mt-0.5">Optimized Waypoints</p>
          </div>
        </div>
      )}

      {/* Map and Sequence Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Route Map (2 cols) */}
        <div className="lg:col-span-2">
          <RouteMap
            origin={origin}
            orderedStops={routeOptimization?.orderedStops || []}
            height="480px"
          />
        </div>

        {/* Ordered Stop Sequence (1 col) */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200/90 shadow-sm space-y-4">
          <h3 className="font-bold text-sm text-slate-900 pb-2 border-b border-slate-100 flex items-center gap-1.5">
            <Navigation className="w-4 h-4 text-emerald-600" /> Optimal Collection Sequence
          </h3>

          <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1">
            <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs">
              <span className="font-bold text-indigo-900">START: {origin.name}</span>
              <p className="text-[11px] text-indigo-700 mt-0.5">Logistics depot departure</p>
            </div>

            {(routeOptimization?.orderedStops || []).map((s, idx) => (
              <div key={idx} className="p-3 rounded-xl border border-slate-200 bg-slate-50 text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-extrabold text-slate-900">Stop #{idx + 1}: {s.name}</span>
                  <span className="font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded text-[10px]">
                    {s.urgency || "NORMAL"}
                  </span>
                </div>
                <p className="text-slate-500 text-[11px]">{s.address}</p>
                {s.legDistanceKm && (
                  <p className="text-[10px] text-slate-400 pt-1">Leg distance: +{s.legDistanceKm} km</p>
                )}
              </div>
            ))}

            <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-xl text-xs">
              <span className="font-bold text-indigo-900">END: Return to Hub</span>
              <p className="text-[11px] text-indigo-700 mt-0.5">Meal unboxing & community dining line</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}