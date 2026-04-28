import React from 'react'

const LANE_LABELS = { N: 'North', S: 'South', E: 'East', W: 'West' }

function SignalLight({ green, label, count, seconds }) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">{label}</span>
      {/* Traffic light housing */}
      <div className="bg-gray-900 border border-gray-700 rounded-xl p-3 flex flex-col gap-2 w-16">
        {/* Red */}
        <div className={`w-8 h-8 rounded-full mx-auto transition-all duration-500 ${
          !green ? 'bg-red-500 signal-red' : 'bg-red-950 opacity-30'
        }`} />
        {/* Yellow */}
        <div className="w-8 h-8 rounded-full mx-auto bg-yellow-950 opacity-30" />
        {/* Green */}
        <div className={`w-8 h-8 rounded-full mx-auto transition-all duration-500 ${
          green ? 'bg-green-500 signal-green' : 'bg-green-950 opacity-30'
        }`} />
      </div>
      <span className={`text-sm font-mono font-semibold ${green ? 'text-green-400' : 'text-red-400'}`}>
        {seconds}s
      </span>
      <span className="text-xs text-slate-500">{count} vehicles</span>
    </div>
  )
}

export default function IntersectionMap({ signalPlan, vehicleCounts, activeDirection }) {
  if (!signalPlan || !vehicleCounts) {
    return (
      <div className="flex items-center justify-center h-64 text-slate-500 text-sm">
        Waiting for simulation data...
      </div>
    )
  }

  // The lane with most time = currently green (simplified for demo)
  const maxLane = Object.entries(signalPlan)
    .filter(([k]) => k !== 'total_cycle')
    .sort(([,a],[,b]) => b - a)[0][0]

  return (
    <div className="relative">
      {/* Road grid */}
      <div className="relative w-full aspect-square max-w-xs mx-auto mt-4">

        {/* Roads */}
        <div className="absolute inset-0 flex items-center justify-center">
          {/* Vertical road */}
          <div className="absolute w-1/3 h-full bg-gray-800 border-x border-gray-700 flex flex-col">
            <div className="flex-1 border-b-2 border-dashed border-gray-600 m-auto w-px" />
          </div>
          {/* Horizontal road */}
          <div className="absolute h-1/3 w-full bg-gray-800 border-y border-gray-700" />
          {/* Intersection center */}
          <div className="absolute w-1/3 h-1/3 bg-gray-750 border border-gray-600 z-10 flex items-center justify-center">
            <div className="text-gray-600 text-xs font-mono">⊕</div>
          </div>
        </div>

        {/* Signal lights at each arm */}
        {/* North */}
        <div className="absolute top-1 left-1/2 -translate-x-1/2 z-20">
          <SignalLight
            green={maxLane === 'N'}
            label="N"
            count={vehicleCounts.N}
            seconds={signalPlan.N}
          />
        </div>
        {/* South */}
        <div className="absolute bottom-1 left-1/2 -translate-x-1/2 z-20">
          <SignalLight
            green={maxLane === 'S'}
            label="S"
            count={vehicleCounts.S}
            seconds={signalPlan.S}
          />
        </div>
        {/* West */}
        <div className="absolute left-1 top-1/2 -translate-y-1/2 z-20">
          <SignalLight
            green={maxLane === 'W'}
            label="W"
            count={vehicleCounts.W}
            seconds={signalPlan.W}
          />
        </div>
        {/* East */}
        <div className="absolute right-1 top-1/2 -translate-y-1/2 z-20">
          <SignalLight
            green={maxLane === 'E'}
            label="E"
            count={vehicleCounts.E}
            seconds={signalPlan.E}
          />
        </div>
      </div>
    </div>
  )
}
