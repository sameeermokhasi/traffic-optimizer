import React, { useState, useEffect, useCallback } from 'react'
import { Activity, Wifi, WifiOff, RefreshCw } from 'lucide-react'
import { useWebSocket } from './hooks/useWebSocket'
import IntersectionMap from './components/IntersectionMap'
import SignalPanel from './components/SignalPanel'
import MetricsChart from './components/MetricsChart'
import StatsCards from './components/StatsCards'
import LiveTrafficMap from './components/LiveTrafficMap'
import HistoryPanel from './components/HistoryPanel'
import Hero from './components/Hero'
import AgentPipeline from './components/AgentPipeline'
import AgentDetailsPage from './components/AgentDetailsPage'
import EmergencyBanner from './components/EmergencyBanner'

const SEVERITY_COLORS = {
  low:      'text-green-400  bg-green-950  border-green-800',
  medium:   'text-amber-400  bg-amber-950  border-amber-800',
  high:     'text-orange-400 bg-orange-950 border-orange-800',
  critical: 'text-red-400    bg-red-950    border-red-800',
}

export default function App() {
  const { lastMessage, connected } = useWebSocket()

  const [currentPage, setCurrentPage] = useState('dashboard') // 'dashboard' or 'agents'
  
  const [liveData,   setLiveData]   = useState(null)
  const [history,    setHistory]    = useState([])
  const [lastUpdate, setLastUpdate] = useState(null)
  const [emergency,  setEmergency]  = useState(null)

  // Fetch historical data on mount
  useEffect(() => {
    fetch('/api/metrics/history?limit=50')
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setHistory(data) })
      .catch(() => {})
  }, [])

  // Handle incoming WebSocket messages
  useEffect(() => {
    if (!lastMessage) return
    // Handle emergency events separately
    if (lastMessage.type === 'emergency_alert') { setEmergency(lastMessage.emergency); return }
    if (lastMessage.type === 'emergency_cleared') { setEmergency(null); return }
    if (lastMessage.type !== 'cycle_update') return
    setLiveData(lastMessage)
    setLastUpdate(new Date())
    // Keep emergency state in sync with cycle broadcasts
    if ('emergency' in lastMessage) setEmergency(lastMessage.emergency)

    // Append to history for charts
    setHistory(prev => {
      const entry = {
        cycle:               lastMessage.cycle,
        avg_wait_fixed:      lastMessage.metrics?.avg_wait_fixed,
        avg_wait_optimized:  lastMessage.metrics?.avg_wait_optimized,
        improvement_percent: lastMessage.metrics?.improvement_percent,
        severity:            lastMessage.congestion_report?.severity,
        total_vehicles:      Object.values(lastMessage.vehicle_counts || {}).reduce((a, b) => a + b, 0),
        timestamp:           new Date().toLocaleTimeString(),
      }
      const updated = [...prev, entry]
      return updated.slice(-100)   // keep last 100 cycles
    })
  }, [lastMessage])

  const severity = liveData?.congestion_report?.severity || 'low'

  if (currentPage === 'agents') {
    return (
      <AgentDetailsPage 
        liveData={liveData} 
        lastUpdate={lastUpdate} 
        setPage={setCurrentPage} 
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-950 text-slate-200">

      {/* Header */}
      <header className="border-b border-gray-800 bg-gray-900 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Activity size={20} className="text-blue-400" />
            <span className="font-display font-bold text-lg tracking-tight">
              Traffic Signal Optimizer
            </span>
            <span className="text-xs font-mono text-slate-500 hidden sm:block">
              — Agentic AI Dashboard
            </span>
          </div>
          <div className="flex items-center gap-4">
            {/* Connection status */}
            <div className={`flex items-center gap-2 text-xs font-mono px-3 py-1 rounded-full border ${
              connected
                ? 'text-green-400 bg-green-950 border-green-800'
                : 'text-red-400 bg-red-950 border-red-800'
            }`}>
              {connected ? <Wifi size={12} /> : <WifiOff size={12} />}
              {connected ? 'Live' : 'Disconnected'}
            </div>

            {/* Severity badge */}
            {liveData && (
              <div className={`text-xs font-mono px-3 py-1 rounded-full border capitalize ${SEVERITY_COLORS[severity]}`}>
                {severity}
              </div>
            )}

            {/* Last update */}
            {lastUpdate && (
              <span className="text-xs font-mono text-slate-600 hidden md:block">
                {lastUpdate.toLocaleTimeString()}
              </span>
            )}

            {/* Emergency Simulator Button */}
            <EmergencyBanner
              emergency={emergency}
              onTrigger={() => {}}
              onClear={() => setEmergency(null)}
            />
          </div>
        </div>
      </header>

      {/* Landing Page Hero Section */}
      <Hero setPage={setCurrentPage} />

      {/* Live Dashboard Section */}
      <main id="dashboard-section" className="max-w-7xl mx-auto p-6 space-y-6 pt-12">

        {/* Stats row */}
        <StatsCards
          metrics={liveData?.metrics}
          vehicleCounts={liveData?.vehicle_counts}
          cycleNumber={liveData?.cycle}
        />

        {/* Live Traffic Map row */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
          <div className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-4">
            Live Traffic Region — Silk Board Junction
          </div>
          <LiveTrafficMap 
            vehicleCounts={liveData?.vehicle_counts} 
            isLiveData={liveData?.is_live_data} 
          />
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Left Column (Main App - 3 cols) */}
          <div className="lg:col-span-3 grid grid-cols-1 lg:grid-cols-3 gap-6 h-fit">
            
            {/* Intersection visualization */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
              <div className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-4">
                Intersection View
              </div>
              <IntersectionMap
                signalPlan={liveData?.signal_plan}
                vehicleCounts={liveData?.vehicle_counts}
              />
            </div>

            {/* Signal panel */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 col-span-1 lg:col-span-2">
              <div className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-4">
                Signal Timing Plan — Current Cycle
              </div>
              {liveData ? (
                <SignalPanel
                  signalPlan={liveData.signal_plan}
                  congestionReport={liveData.congestion_report}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-48 gap-3 text-slate-500">
                  <RefreshCw size={24} className="animate-spin opacity-40" />
                  <p className="text-sm">Waiting for simulation to start...</p>
                  <p className="text-xs font-mono">Run: python simulation/traffic_sim.py</p>
                </div>
              )}
            </div>

            {/* Charts */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 col-span-1 lg:col-span-3">
              <div className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-4">
                Performance History
              </div>
              <MetricsChart history={history} />
            </div>

          </div>

          {/* Right Column (History Feed - 1 col) */}
          <div className="lg:col-span-1 h-full">
            <HistoryPanel history={history} />
          </div>

        </div>

        {/* Raw data inspector */}
        {liveData && (
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6">
            <div className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-4">
              Raw Agent Output — Cycle {liveData.cycle}
            </div>
            <pre className="text-xs font-mono text-slate-400 overflow-x-auto leading-relaxed">
              {JSON.stringify(liveData, null, 2)}
            </pre>
          </div>
        )}

      </main>
    </div>
  )
}
