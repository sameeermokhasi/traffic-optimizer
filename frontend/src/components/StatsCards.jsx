import React from 'react'
import { TrendingUp, Car, Clock, Zap } from 'lucide-react'

function StatCard({ icon: Icon, label, value, unit, color }) {
  return (
    <div className="bg-gray-900 border border-gray-800 rounded-xl p-4 fade-in">
      <div className="flex items-center gap-2 mb-3">
        <Icon size={16} className={color} />
        <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">{label}</span>
      </div>
      <div className="flex items-baseline gap-1">
        <span className={`text-2xl font-display font-bold ${color}`}>{value}</span>
        <span className="text-sm text-slate-500">{unit}</span>
      </div>
    </div>
  )
}

export default function StatsCards({ metrics, vehicleCounts, cycleNumber }) {
  const totalVehicles = vehicleCounts
    ? Object.values(vehicleCounts).reduce((a, b) => a + b, 0)
    : 0

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <StatCard
        icon={TrendingUp}
        label="Improvement"
        value={metrics?.improvement_percent?.toFixed(1) ?? '--'}
        unit="%"
        color="text-green-400"
      />
      <StatCard
        icon={Clock}
        label="Optimized Wait"
        value={metrics?.avg_wait_optimized?.toFixed(1) ?? '--'}
        unit="sec"
        color="text-blue-400"
      />
      <StatCard
        icon={Car}
        label="This Cycle"
        value={totalVehicles}
        unit="vehicles"
        color="text-amber-400"
      />
      <StatCard
        icon={Zap}
        label="Cycle #"
        value={cycleNumber ?? '--'}
        unit=""
        color="text-purple-400"
      />
    </div>
  )
}
