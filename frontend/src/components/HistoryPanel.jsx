import React from 'react';
import { Clock, TrendingDown, TrendingUp } from 'lucide-react';

export default function HistoryPanel({ history }) {
  // Show most recent first
  const reversedHistory = [...history].reverse();

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl flex flex-col h-[800px]">
      <div className="p-4 border-b border-gray-800 sticky top-0 bg-gray-900/95 backdrop-blur-md rounded-t-2xl z-10">
        <div className="text-xs font-mono text-slate-500 uppercase tracking-wider flex items-center gap-2">
          <Clock size={14} className="text-blue-400" />
          Live Cycle History
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {reversedHistory.length === 0 ? (
          <div className="text-slate-500 text-xs font-mono text-center mt-10">
            Waiting for cycle data...
          </div>
        ) : (
          reversedHistory.map((entry, idx) => {
            const isImproved = entry.improvement_percent > 0;
            
            return (
              <div key={idx} className="bg-gray-950 border border-gray-800 rounded-xl p-4 flex flex-col gap-3 shadow-md hover:border-gray-700 transition-colors">
                <div className="flex justify-between items-center border-b border-gray-800/50 pb-2">
                  <span className="text-xs font-mono font-bold text-slate-300">
                    Cycle {entry.cycle}
                  </span>
                  <span className="text-[10px] font-mono text-slate-500">
                    {entry.timestamp || '--:--:--'}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="flex flex-col">
                    <span className="text-slate-500 text-[10px] uppercase">Vehicles</span>
                    <span className="text-slate-200">{entry.total_vehicles || 0} Cars</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-slate-500 text-[10px] uppercase">Severity</span>
                    <span className={`capitalize ${
                      entry.severity === 'critical' ? 'text-red-400' :
                      entry.severity === 'high' ? 'text-orange-400' :
                      entry.severity === 'medium' ? 'text-amber-400' : 'text-green-400'
                    }`}>
                      {entry.severity || 'low'}
                    </span>
                  </div>
                </div>

                <div className="bg-gray-900/50 rounded p-2 text-xs font-mono border border-gray-800/50">
                  <div className="flex justify-between mb-1">
                    <span className="text-slate-500">Regular Wait:</span>
                    <span className="text-slate-400">{entry.avg_wait_fixed || 0}s</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-blue-400 font-semibold">Optimized:</span>
                    <span className="text-blue-300 font-semibold">{entry.avg_wait_optimized || 0}s</span>
                  </div>
                </div>

                <div className={`flex items-center gap-1 text-[11px] font-mono font-bold mt-1 ${isImproved ? 'text-emerald-400' : 'text-slate-400'}`}>
                  {isImproved ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
                  {entry.improvement_percent || 0}% Faster
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
