import React from 'react'
import { MapContainer, TileLayer, Polyline, Marker } from 'react-leaflet'
import L from 'leaflet'
import { renderToStaticMarkup } from 'react-dom/server'

// The paths leading TO the intersection center
const ROAD_PATHS = {
  N: [ [12.9230, 77.6232], [12.9178, 77.6234] ], // Hosur Rd North
  S: [ [12.9120, 77.6236], [12.9168, 77.6234] ], // Hosur Rd South
  E: [ [12.9176, 77.6290], [12.9174, 77.6240] ], // ORR East
  W: [ [12.9172, 77.6180], [12.9174, 77.6225] ], // BTM West
}

// Center points for placing the count labels
const LABEL_POSITIONS = {
  N: [12.9204, 77.6233],
  S: [12.9144, 77.6235],
  E: [12.9175, 77.6265],
  W: [12.9173, 77.6202],
}

// Helper to determine the color based on traffic volume
const getLaneColor = (count) => {
  if (count === undefined) return '#22c55e'; // Default Green
  if (count > 50) return '#ef4444'; // Red (Severe)
  if (count > 20) return '#f59e0b'; // Amber (Medium)
  return '#22c55e'; // Green (Clear)
}

// Helper to create the floating number badge
const createCountIcon = (count, colorHex) => {
  const isRed = colorHex === '#ef4444';
  const displayCount = count || 0;
  
  const iconHtml = renderToStaticMarkup(
    <div className={`
      flex items-center gap-2 px-2 py-1 rounded shadow-xl border
      bg-gray-950 font-mono text-xs font-bold
      ${isRed ? 'border-red-500/50 text-red-400' : 'border-gray-800 text-slate-200'}
    `}>
      <div className="w-2 h-2 rounded-full" style={{ backgroundColor: colorHex }}></div>
      {displayCount} Vehicles
    </div>
  );

  return L.divIcon({
    html: iconHtml,
    className: 'bg-transparent border-0',
    iconSize: [110, 28],
    iconAnchor: [55, 14], // Center the label
  });
}

// Sub-component to render the polylines inside MapContainer
function TrafficOverlays({ vehicleCounts }) {
  if (!vehicleCounts) return null;

  return (
    <>
      {['N', 'S', 'E', 'W'].map((lane) => {
        const count = vehicleCounts[lane];
        const color = getLaneColor(count);
        
        return (
          <React.Fragment key={lane}>
            {/* The thick colored road line */}
            <Polyline 
              positions={ROAD_PATHS[lane]} 
              pathOptions={{ color, weight: 8, opacity: 0.8 }} 
            />
            {/* The floating text label */}
            <Marker 
              position={LABEL_POSITIONS[lane]} 
              icon={createCountIcon(count, color)} 
            />
          </React.Fragment>
        );
      })}
    </>
  );
}

export default function LiveTrafficMap({ vehicleCounts, isLiveData }) {
  const CENTER = [12.9174, 77.6234]

  return (
    <div className="relative w-full h-full min-h-[500px] rounded-xl overflow-hidden border border-gray-700 bg-gray-900">
      
      {/* Leaflet Map Engine */}
      <div className="absolute inset-0 w-full h-full filter contrast-125 saturate-150 brightness-75">
        <MapContainer 
          center={CENTER} 
          zoom={17} 
          scrollWheelZoom={false} 
          style={{ height: '100%', width: '100%', backgroundColor: '#111827' }}
          zoomControl={false}
        >
          <TileLayer
            attribution='&copy; OpenStreetMap contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <TrafficOverlays vehicleCounts={vehicleCounts} />
        </MapContainer>
      </div>
      
      {/* Dynamic Data Source Badge */}
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-2">
        
        {/* Tracker Badge */}
        {isLiveData ? (
          <div className="bg-emerald-950/90 p-2 rounded-lg border border-emerald-800 backdrop-blur-md shadow-xl flex items-center gap-3">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </div>
            <span className="text-xs font-mono text-emerald-300 uppercase tracking-widest font-semibold">
              Live Data Source: TomTom Traffic API
            </span>
          </div>
        ) : (
          <div className="bg-amber-950/90 p-2 rounded-lg border border-amber-800 backdrop-blur-md shadow-xl flex items-center gap-3">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </div>
            <span className="text-xs font-mono text-amber-300 uppercase tracking-widest font-semibold">
              Data Source: Internal Simulation Fallback
            </span>
          </div>
        )}

        <div className="bg-gray-950/90 p-2 rounded-lg border border-gray-800 backdrop-blur-md shadow-xl text-[10px] font-mono text-slate-400 w-fit">
          Geographic Coordinates: {CENTER.join(', ')}
        </div>
      </div>

    </div>
  )
}
