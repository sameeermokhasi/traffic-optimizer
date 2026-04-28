import React, { useState } from 'react';
import { AlertTriangle, X, Siren } from 'lucide-react';

const ROUTES = ['N', 'S', 'E', 'W'];
const TYPES  = ['AMBULANCE', 'FIRE', 'POLICE'];

export default function EmergencyBanner({ emergency, onTrigger, onClear }) {
  const [route, setRoute]       = useState('N');
  const [vType, setVType]       = useState('AMBULANCE');
  const [showPanel, setShowPanel] = useState(false);

  const isActive = emergency?.active;

  const handleTrigger = async () => {
    await fetch('http://localhost:8000/api/emergency/trigger', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ route, vehicle_type: vType })
    });
    setShowPanel(false);
    onTrigger?.();
  };

  const handleClear = async () => {
    await fetch('http://localhost:8000/api/emergency/clear', { method: 'DELETE' });
    onClear?.();
  };

  return (
    <>
      {/* Active Emergency Alert Banner */}
      {isActive && (
        <div className="fixed top-0 left-0 right-0 z-[9999] animate-pulse-once">
          <div className="bg-red-600 border-b-2 border-red-400 px-6 py-3 flex items-center justify-between shadow-[0_0_40px_-5px_rgba(239,68,68,0.8)]">
            <div className="flex items-center gap-3">
              <Siren className="text-white animate-bounce" size={22} />
              <span className="text-white font-bold text-sm tracking-wide">
                🚨 EMERGENCY PRE-EMPTION ACTIVE — {emergency.vehicle_type} on Route {emergency.route} — All signals overridden
              </span>
            </div>
            <button
              onClick={handleClear}
              className="ml-6 bg-white/20 hover:bg-white/30 text-white px-4 py-1.5 rounded-full text-xs font-bold flex items-center gap-2 transition-colors"
            >
              <X size={14} />
              CLEAR EMERGENCY
            </button>
          </div>
        </div>
      )}

      {/* Emergency Trigger Button (always visible in header area) */}
      <div className="relative">
        <button
          onClick={() => setShowPanel(!showPanel)}
          className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold transition-all border ${
            isActive
              ? 'bg-red-600 border-red-500 text-white animate-pulse'
              : 'bg-gray-900 border-gray-700 text-red-400 hover:bg-red-950 hover:border-red-700'
          }`}
        >
          <AlertTriangle size={13} />
          {isActive ? 'EMERGENCY ACTIVE' : 'Simulate Emergency'}
        </button>

        {/* Dropdown Panel */}
        {showPanel && !isActive && (
          <div className="absolute right-0 top-10 z-50 bg-gray-900 border border-red-800/60 rounded-xl p-4 shadow-2xl w-56 space-y-3">
            <p className="text-xs font-mono text-red-400 font-bold uppercase tracking-wider">Emergency Override</p>
            
            <div>
              <label className="text-[10px] text-slate-500 font-mono mb-1 block">Vehicle Type</label>
              <select
                value={vType}
                onChange={e => setVType(e.target.value)}
                className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-xs text-slate-200 font-mono"
              >
                {TYPES.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>

            <div>
              <label className="text-[10px] text-slate-500 font-mono mb-1 block">Emergency Route</label>
              <div className="grid grid-cols-4 gap-1">
                {ROUTES.map(r => (
                  <button
                    key={r}
                    onClick={() => setRoute(r)}
                    className={`py-1.5 rounded text-xs font-bold transition-colors ${
                      route === r ? 'bg-red-600 text-white' : 'bg-gray-800 text-slate-400 hover:bg-gray-700'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={handleTrigger}
              className="w-full bg-red-600 hover:bg-red-500 text-white py-2 rounded-lg text-xs font-bold transition-colors flex items-center justify-center gap-2"
            >
              <Siren size={13} />
              TRIGGER EMERGENCY
            </button>
          </div>
        )}
      </div>
    </>
  );
}
