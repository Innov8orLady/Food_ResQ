import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMap } from 'react-leaflet';
import L from 'leaflet';

const depotIcon = L.divIcon({
  className: 'depot-pin',
  html: `<div style="background-color: #6366F1; width: 30px; height: 30px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 12px rgba(99,102,241,0.5); display: flex; align-items: center; justify-content: center; color: white; font-size: 13px; font-weight: bold;">HQ</div>`,
  iconSize: [30, 30],
  iconAnchor: [15, 15]
});

const createStopIcon = (index, urgency) => {
  let color = '#10B981';
  if (urgency === 'IMMEDIATE' || urgency === 'CRITICAL') color = '#EF4444';
  else if (urgency === 'URGENT') color = '#F59E0B';

  return L.divIcon({
    className: 'stop-pin',
    html: `<div style="background-color: ${color}; width: 28px; height: 28px; border-radius: 50%; border: 3px solid white; box-shadow: 0 4px 10px rgba(0,0,0,0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: 800; font-size: 12px;">${index}</div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 14]
  });
};

function AutoFitBounds({ points }) {
  const map = useMap();
  useEffect(() => {
    if (points && points.length > 0) {
      const bounds = L.latLngBounds(points);
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [points, map]);
  return null;
}

export default function RouteMap({ origin, orderedStops = [], height = "450px" }) {
  const originCoord = origin?.coordinates || [28.6320, 77.2180];
  
  const pathPoints = [originCoord];
  orderedStops.forEach(s => {
    if (s.coordinates) pathPoints.push(s.coordinates);
  });
  if (orderedStops.length > 0) pathPoints.push(originCoord);

  return (
    <div className="rounded-2xl overflow-hidden border border-slate-200 shadow-sm relative" style={{ height }}>
      <MapContainer center={originCoord} zoom={13} style={{ height: '100%', width: '100%' }}>
        <TileLayer
          attribution='&copy; OpenStreetMap contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <AutoFitBounds points={pathPoints} />

        <Marker position={originCoord} icon={depotIcon}>
          <Popup>
            <div className="text-xs">
              <p className="font-bold text-indigo-700">{origin?.name || "Hub"}</p>
              <p className="text-slate-500">Route Origin</p>
            </div>
          </Popup>
        </Marker>

        {orderedStops.map((stop, idx) => {
          const coord = stop.coordinates || originCoord;
          return (
            <Marker key={idx} position={coord} icon={createStopIcon(idx + 1, stop.urgency)}>
              <Popup>
                <div className="text-xs p-1">
                  <p className="font-bold text-emerald-700">Stop #{idx + 1}: {stop.name}</p>
                  <p className="text-slate-600 font-medium">{stop.address}</p>
                  <p className="text-[11px] text-slate-400 mt-1">Priority: {stop.urgency || "NORMAL"}</p>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {pathPoints.length > 1 && (
          <Polyline positions={pathPoints} color="#059669" weight={4} dashArray="6, 6" opacity={0.8} />
        )}
      </MapContainer>
    </div>
  );
}