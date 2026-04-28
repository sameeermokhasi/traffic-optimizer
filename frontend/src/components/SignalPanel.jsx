import React from 'react'

const LANE_COLORS = {
  N: { bar: 'bg-blue-500',   text: 'text-blue-400',   bg: 'bg-blue-950' },
  S: { bar: 'bg-purple-500', text: 'text-purple-400', bg: 'bg-purple-950' },
  E: { bar: 'bg-amber-500',  text: 'text-amber-400',  bg: 'bg-amber-950' },
  W: { bar: 'bg-cyan-500',   text: 'text-cyan-400',   bg: 'bg-cyan-950' },
}

export default function SignalPanel({ signalPlan, congestionReport }) {
  if (!signalPlan) return null

  const total = signalPlan.total_cycle || 130
  const lanes = ['N', 'S', 'E', 'W']

  return (
    <div className="space-y-4">
      {/* Priority order from Claude */}
      {congestionReport && (
        <div className="bg-gray-900 border border-gray-700 rounded-xl p-4">
          <div className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-2">
            Claude's Reasoning
          </div>
          <p className="text-sm text-slate-300 leading-relaxed">
            {congestionReport.reasoning}
          </p>
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs text-slate-500">Priority:</span>
            {congestionReport.priority_order?.map((lane, i) => (
              <span key={lane} className={`text-xs font-mono px-2 py-0.5 rounded ${LANE_COLORS[lane]?.bg} ${LANE_COLORS[lane]?.text}`}>
                {i + 1}. {lane}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Green time bars */}
      <div className="space-y-3">
        {lanes.map(lane => {
          const seconds = signalPlan[lane] || 0
          const pct     = Math.round((seconds / total) * 100)
          const c       = LANE_COLORS[lane]
          return (
            <div key={lane}>
              <div className="flex justify-between items-center mb-1">
                <span className={`text-sm font-mono font-semibold ${c.text}`}>
                  {lane === 'N' ? 'North' : lane === 'S' ? 'South' : lane === 'E' ? 'East' : 'West'}
                </span>
                <span className="text-sm font-mono text-slate-300">
                  {seconds}s <span className="text-slate-500">({pct}%)</span>
                </span>
              </div>
              <div className="w-full bg-gray-800 rounded-full h-2">
                <div
                  className={`${c.bar} h-2 rounded-full transition-all duration-700`}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
