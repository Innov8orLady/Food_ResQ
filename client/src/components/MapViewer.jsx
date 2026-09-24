import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import RiskBadge from './RiskBadge';
import StatusBadge from './StatusBadge';
import { Clock, MapPin, Package } from 'lucide-react';
import { Link } from 'react-router-dom';

const createCustomIcon = (urgency, status) => {
  let color = '#10B981';
  if (urgency === 'IMMEDIATE' || urgency === 'CRITICAL') color = '#EF4444';
  else if (urgency === 'URGENT') color = '#F59E0B';
  else if (urgency === 'ELEVATED') color = '#EAB308';
  if (status === 'CLAIMED' || status === 'PICKUP_SCHEDULED') color = '#3B82F6';

  return L.divIcon({
    className: 'custom-map-pin',
    html: `<div style="background-color: ${color}; width: 28px; height: 28px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 14px;">🍲</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14]
  });
};

const userIcon = L.divIcon({
  className: 'user-map-pin',
  html: `<div style="background-color: #6366F1; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 12px rgba(99,102,241,0.5); display: flex; align-items: center; justify-content: center; color: white; font-size: 14px;">🏢</div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 15]
});

function RecenterMap({ center }) {
  const map = useMap();
  useEffect(() => {
    if (center && center[0] && center[1]) {
      map.setView(center, 13);
    }
  }, [center, map]);
  return null;
}

export default function MapViewer({ listings = [], userLocation, height = "520px" }) {
  const defaultCenter = userLocation || [28.6250, 77.2150];

  return (
    <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative" style={{ height }}>
      <MapContainer center={defaultCenter} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <RecenterMap center={defaultCenter} />

        {userLocation && (
          <Marker position={userLocation} icon={userIcon}>
            <Popup>
              <div className="p-1 text-xs">
                <p className="font-bold text-indigo-700">Your Organization Hub</p>
                <p className="text-slate-500">Center point for spatial calculations.</p>
              </div>
            </Popup>
          </Marker>
        )}

        {listings.map((item) => {
          const coords = item.location?.coordinates || [28.6139, 77.2090];
          return (
            <Marker key={item._id || item.id} position={coords} icon={createCustomIcon(item.urgency, item.status)}>
              <Popup>
                <div className="p-1 max-w-[220px] text-xs">
                  <div className="flex items-center justify-between gap-2 mb-1.5">
                    <StatusBadge status={item.status} />
                    <RiskBadge riskLevel={item.riskLevel} urgency={item.urgency} showScore={false} />
                  </div>
                  <h4 className="font-bold text-sm text-slate-900 leading-snug">{item.foodName}</h4>
                  <p className="text-slate-500 font-medium mt-0.5">{item.donorOrg || item.donorName}</p>
                  
                  <div className="my-2 space-y-1 text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <div className="flex items-center gap-1.5">
                      <Package className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.quantity} {item.unit}</span>
                    </div>
                    {item.distanceKm !== undefined && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-slate-400" />
                        <span>{item.distanceKm} km away</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>Safe window: ~{item.remainingSafeHours}h</span>
                    </div>
                  </div>

                  {item.status === 'AVAILABLE' ? (
                    <Link
                      to={`/recipient/food/${item._id || item.id}`}
                      className="block w-full py-1.5 px-2 text-center rounded-lg bg-emerald-600 text-white font-bold hover:bg-emerald-700"
                    >
                      View & Claim
                    </Link>
                  ) : (
                    <p className="text-center font-bold text-slate-400 py-1">{item.status}</p>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
}