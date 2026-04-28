import React, { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import { renderToStaticMarkup } from 'react-dom/server';

// Sleek, top-down SVG car icon
const createCarIcon = (colorClass, rotation) => {
  const iconHtml = renderToStaticMarkup(
    <div style={{ transform: `rotate(${rotation}deg)`, transformOrigin: 'center center' }}>
      <svg className={`drop-shadow-lg ${colorClass}`} width="20" height="34" viewBox="0 0 24 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="4" width="18" height="32" rx="4" fill="currentColor" />
        <rect x="5" y="10" width="14" height="6" rx="1" fill="#0f172a" />
        <rect x="5" y="26" width="14" height="4" rx="1" fill="#0f172a" />
        <rect x="4" y="2" width="4" height="3" rx="1" fill="#fef08a" />
        <rect x="16" y="2" width="4" height="3" rx="1" fill="#fef08a" />
        <rect x="4" y="35" width="4" height="3" rx="1" fill="#ef4444" />
        <rect x="16" y="35" width="4" height="3" rx="1" fill="#ef4444" />
      </svg>
    </div>
  );

  return L.divIcon({
    html: iconHtml,
    className: 'bg-transparent border-0',
    iconSize: [20, 34],
    iconAnchor: [10, 17],
  });
};

const ICONS = {
  'N-green': createCarIcon('text-green-500', 180),
  'N-amber': createCarIcon('text-amber-500', 180),
  'N-red': createCarIcon('text-red-500', 180),
  
  'S-green': createCarIcon('text-green-500', 0),
  'S-amber': createCarIcon('text-amber-500', 0),
  'S-red': createCarIcon('text-red-500', 0),
  
  'E-green': createCarIcon('text-green-500', -90),
  'E-amber': createCarIcon('text-amber-500', -90),
  'E-red': createCarIcon('text-red-500', -90),
  
  'W-green': createCarIcon('text-green-500', 90),
  'W-amber': createCarIcon('text-amber-500', 90),
  'W-red': createCarIcon('text-red-500', 90),
};

// Paths that cross the entire intersection
const PATHS = {
  N: { start: [12.9230, 77.6232], end: [12.9120, 77.6232] }, // Driving South
  S: { start: [12.9120, 77.6236], end: [12.9230, 77.6236] }, // Driving North
  E: { start: [12.9176, 77.6290], end: [12.9176, 77.6180] }, // Driving West
  W: { start: [12.9172, 77.6180], end: [12.9172, 77.6290] }, // Driving East
};

export default function AnimatedTraffic({ vehicleCounts }) {
  const map = useMap();
  const markersRef = useRef([]);
  const vehiclesRef = useRef([]);

  useEffect(() => {
    if (!vehicleCounts) return;

    // Clear old markers from the map cleanly
    markersRef.current.forEach((m) => map.removeLayer(m));
    markersRef.current = [];
    
    const newVehicles = [];

    // Helper to spawn a queue of cars for a lane
    const spawnLane = (lane, count) => {
      let color = 'green';
      if (count > 20) color = 'amber';
      if (count > 50) color = 'red';

      const renderCount = Math.min(count, 15);
      const iconKey = `${lane}-${color}`;
      const path = PATHS[lane];

      // Distance between cars to form a neat line
      const SPACING = 0.04; 

      for (let i = 0; i < renderCount; i++) {
        // Cars spawn off-screen by starting with negative progress based on their index in the queue
        const initialProgress = -(i * SPACING);
        
        // Initial position computation
        const lat = path.start[0] + (path.end[0] - path.start[0]) * initialProgress;
        const lng = path.start[1] + (path.end[1] - path.start[1]) * initialProgress;
        
        // Add marker with 0 opacity if it's off the starting line (handled by CSS if needed, or just let Leaflet render it off-screen)
        const marker = L.marker([lat, lng], { icon: ICONS[iconKey] }).addTo(map);
        markersRef.current.push(marker);

        newVehicles.push({
          marker: marker,
          startPos: path.start,
          endPos: path.end,
          progress: initialProgress,
          speed: 0.0012 + (Math.random() * 0.0002), // Very consistent speed to keep the queue neat
        });
      }
    };

    spawnLane('N', vehicleCounts.N);
    spawnLane('S', vehicleCounts.S);
    spawnLane('E', vehicleCounts.E);
    spawnLane('W', vehicleCounts.W);

    vehiclesRef.current = newVehicles;

  }, [vehicleCounts, map]);

  // Animation Loop (High Performance)
  useEffect(() => {
    let animationFrameId;

    const animate = () => {
      vehiclesRef.current.forEach((v) => {
        v.progress += v.speed;
        
        // Loop back to the start of the queue when they reach the end of the road
        if (v.progress >= 1) {
          v.progress = -0.2; // Start slightly offscreen again
        }

        const lat = v.startPos[0] + (v.endPos[0] - v.startPos[0]) * v.progress;
        const lng = v.startPos[1] + (v.endPos[1] - v.startPos[1]) * v.progress;
        
        v.marker.setLatLng([lat, lng]);
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return null;
}
