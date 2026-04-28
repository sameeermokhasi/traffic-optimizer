import React from 'react'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, BarChart, Bar
} from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null
  return (
    <div className="bg-gray-900 border border-gray-700 rounded-lg p-3 text-xs font-mono">
      <p className="text-slate-400 mb-1">Cycle {label}</p>
      {payload.map(p => (
        <p key={p.dataKey} style={{ color: p.color }}>
          {p.name}: {typeof p.value === 'number' ? p.value.toFixed(1) : p.value}
          {p.dataKey === 'improvement' ? '%' : 's'}
        </p>
      ))}
    </div>
  )
}

export default function MetricsChart({ history }) {
  if (!history?.length) {
    return (
      <div className="flex items-center justify-center h-40 text-slate-500 text-sm">
        Charts will appear after first cycle completes
      </div>
    )
  }

  // Last 30 cycles for chart readability
  const data = history.slice(-30).map(h => ({
    cycle:       h.cycle,
    fixed:       parseFloat(h.avg_wait_fixed?.toFixed(1)),
    optimized:   parseFloat(h.avg_wait_optimized?.toFixed(1)),
    improvement: parseFloat(h.improvement_percent?.toFixed(1)),
  }))

  return (
    <div className="space-y-8">
      {/* Wait time comparison */}
      <div>
        <div className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-4">
          Average Wait Time: Fixed vs Optimized (seconds)
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis dataKey="cycle" tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'JetBrains Mono' }} />
            <YAxis domain={['dataMin - 2', 'dataMax + 2']} tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'JetBrains Mono' }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: '12px', fontFamily: 'JetBrains Mono' }} />
            <Line type="monotone" dataKey="fixed"     stroke="#ef4444" strokeWidth={2} dot={false} name="Fixed timing" />
            <Line type="monotone" dataKey="optimized" stroke="#22c55e" strokeWidth={2} dot={false} name="AI optimized" />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Improvement % bar chart */}
      <div>
        <div className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-4">
          Improvement % per Cycle
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" />
            <XAxis dataKey="cycle" tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'JetBrains Mono' }} />
            <YAxis unit="%" tick={{ fill: '#64748b', fontSize: 11, fontFamily: 'JetBrains Mono' }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="improvement" fill="#3b82f6" radius={[3, 3, 0, 0]} name="improvement" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
