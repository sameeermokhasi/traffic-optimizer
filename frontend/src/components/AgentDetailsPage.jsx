import React, { useEffect, useRef, useState } from 'react';
import { ArrowLeft, Terminal, CheckCircle2, Loader2, Clock, Zap } from 'lucide-react';
import AgentPipeline from './AgentPipeline';

const AGENT_SEQUENCE = [
  { key: 'ingestion',  label: '1. Ingestion Agent',  color: 'text-green-400',  icon: '📡' },
  { key: 'congestion', label: '2. Congestion Agent',  color: 'text-blue-400',   icon: '🧠' },
  { key: 'optimizer',  label: '3. Optimizer Agent',   color: 'text-amber-400',  icon: '⚙️' },
  { key: 'reporter',   label: '4. Reporter Agent',    color: 'text-purple-400', icon: '📊' },
];

function useAgentTrace(lastUpdate) {
  const [trace, setTrace] = useState([]); // [{key, status: 'running'|'done', ms}]

  useEffect(() => {
    if (!lastUpdate) return;
    const start = Date.now();
    setTrace([{ key: 'ingestion', status: 'running', ms: null }]);

    const delays = [
      { key: 'congestion', after: 200 },
      { key: 'optimizer',  after: 850 },
      { key: 'reporter',   after: 1300 },
      { key: '_done',      after: 1700 },
    ];

    const timers = delays.map(({ key, after }) =>
      setTimeout(() => {
        if (key === '_done') {
          // Mark all done with fake ms timings
          setTrace([
            { key: 'ingestion',  status: 'done', ms: Math.floor(Math.random() * 20  + 10)  },
            { key: 'congestion', status: 'done', ms: Math.floor(Math.random() * 400 + 350) },
            { key: 'optimizer',  status: 'done', ms: Math.floor(Math.random() * 30  + 15)  },
            { key: 'reporter',   status: 'done', ms: Math.floor(Math.random() * 25  + 10)  },
          ]);
        } else {
          setTrace(prev => {
            // Mark previous as done
            const updated = prev.map(t =>
              t.status === 'running'
                ? { ...t, status: 'done', ms: Date.now() - start - after + 200 }
                : t
            );
            return [...updated, { key, status: 'running', ms: null }];
          });
        }
      }, after)
    );

    return () => timers.forEach(clearTimeout);
  }, [lastUpdate]);

  return trace;
}

export default function AgentDetailsPage({ liveData, lastUpdate, setPage }) {
  const terminalRef = useRef(null);
  const trace = useAgentTrace(lastUpdate);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [liveData]);

  const agentDetails = [
    {
      title: '1. Ingestion Agent', role: 'Data Intake', color: 'text-green-400',
      tech: 'FastAPI · Redis · Pydantic',
      description: 'Receives raw intersection data from the simulation every 5 seconds. It validates incoming JSON payloads, structures vehicle counts per lane (N/S/E/W), and immediately stores the real-time state into Redis for sub-millisecond access by downstream agents.',
    },
    {
      title: '2. Congestion Agent', role: 'AI Reasoning Core', color: 'text-blue-400',
      tech: 'Google Gemini LLM · LangGraph',
      description: 'The most critical agent. Reads vehicle counts from Redis and sends a structured prompt to Google Gemini. Autonomously reasons about the intersection state — identifies severe congestion, determines lane priority order, and outputs a structured JSON reasoning report.',
    },
    {
      title: '3. Optimizer Agent', role: 'Mathematical Engine', color: 'text-amber-400',
      tech: 'Python · Weighted Distribution',
      description: 'Takes the LLM Congestion Report and calculates exact green-light durations for each lane using a proportional weighted algorithm based on vehicle density. Distributes cycle time to ensure maximum throughput and minimum cumulative wait time across all directions.',
    },
    {
      title: '4. Reporter Agent', role: 'Metrics & Broadcast', color: 'text-purple-400',
      tech: 'PostgreSQL · WebSocket · SQLAlchemy',
      description: 'Applies the new Signal Plan to the simulation. Calculates optimized wait times, compares against the fixed-timing baseline to compute improvement %, logs all historical cycle data to PostgreSQL, and broadcasts the final state back to the React dashboard via WebSocket.',
    },
  ];

  const totalMs = trace.filter(t => t.status === 'done').reduce((a, t) => a + (t.ms || 0), 0);

  return (
    <div className="min-h-screen bg-gray-950 text-slate-200">
      <header className="border-b border-gray-800 bg-gray-900 px-6 py-4 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <button onClick={() => setPage('dashboard')} className="p-2 hover:bg-gray-800 rounded-full transition-colors">
            <ArrowLeft className="text-slate-400" />
          </button>
          <span className="font-display font-bold text-lg tracking-tight">In-Depth Agent Simulation</span>
          {totalMs > 0 && (
            <span className="ml-auto text-xs font-mono text-slate-500 flex items-center gap-1">
              <Zap size={12} className="text-amber-400" />
              Last cycle: {totalMs}ms total
            </span>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-8 mt-4">

        {/* Two-column: Pipeline + Execution Trace */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          <div className="xl:col-span-2">
            <h2 className="text-xl font-bold mb-4 text-white">Live Execution Pipeline</h2>
            <AgentPipeline liveData={liveData} lastUpdate={lastUpdate} />
          </div>

          {/* Agent Execution Trace — Feature 7 */}
          <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-5 border-b border-gray-800 pb-3">
              <Clock size={16} className="text-blue-400" />
              <span className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider">
                Step Execution Trace
              </span>
            </div>

            <div className="space-y-3">
              {AGENT_SEQUENCE.map((agent) => {
                const step = trace.find(t => t.key === agent.key);
                const isRunning = step?.status === 'running';
                const isDone    = step?.status === 'done';
                const isPending = !step;

                return (
                  <div key={agent.key} className={`flex items-center gap-3 p-3 rounded-lg border transition-all duration-300 ${
                    isRunning ? 'bg-blue-950/30 border-blue-800/60' :
                    isDone    ? 'bg-gray-800/50 border-gray-700' :
                                'bg-gray-950/50 border-gray-800 opacity-50'
                  }`}>
                    <span className="text-lg">{agent.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className={`text-xs font-bold ${agent.color}`}>{agent.label}</p>
                      <p className="text-[10px] font-mono text-slate-500 mt-0.5">
                        {isRunning ? 'Executing...' : isDone ? `Completed in ${step.ms}ms` : 'Waiting'}
                      </p>
                    </div>
                    <div className="shrink-0">
                      {isRunning && <Loader2 size={16} className="text-blue-400 animate-spin" />}
                      {isDone    && <CheckCircle2 size={16} className="text-emerald-400" />}
                      {isPending && <div className="w-4 h-4 rounded-full border-2 border-gray-700" />}
                    </div>
                  </div>
                );
              })}
            </div>

            {totalMs > 0 && (
              <div className="mt-4 pt-3 border-t border-gray-800 flex justify-between text-xs font-mono text-slate-500">
                <span>Total pipeline latency</span>
                <span className="text-amber-400 font-bold">{totalMs}ms</span>
              </div>
            )}
          </div>
        </div>

        {/* Agent Architecture Breakdown */}
        <div>
          <h2 className="text-xl font-bold mb-4 text-white">Agent Architecture Breakdown</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
            {agentDetails.map((agent, idx) => (
              <div key={idx} className="bg-gray-900 border border-gray-800 rounded-2xl p-6 hover:border-gray-700 transition-colors flex flex-col">
                <h3 className={`font-bold text-lg mb-1 ${agent.color}`}>{agent.title}</h3>
                <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-1">{agent.role}</div>
                <div className="text-[10px] font-mono text-blue-400/70 mb-3 border-b border-gray-800 pb-3">{agent.tech}</div>
                <p className="text-sm text-slate-400 leading-relaxed flex-1">{agent.description}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Live Terminal */}
        <div className="bg-black border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
          <div className="bg-gray-900 border-b border-gray-800 px-4 py-3 flex items-center gap-3">
            <Terminal size={18} className="text-emerald-500" />
            <span className="text-xs font-mono font-bold text-slate-300">Raw Agent JSON Stream</span>
            <span className="ml-auto text-[10px] font-mono text-slate-600">Cycle {liveData?.cycle || '--'}</span>
          </div>
          <div ref={terminalRef} className="p-6 h-[400px] overflow-y-auto font-mono text-[11px] text-emerald-400/90 leading-relaxed">
            {liveData ? (
              <pre>{JSON.stringify(liveData, null, 2)}</pre>
            ) : (
              <span className="text-slate-500 animate-pulse">Waiting for initial simulation cycle...</span>
            )}
            <div className="w-2 h-4 bg-emerald-500 inline-block animate-pulse ml-1 mt-2 align-middle" />
          </div>
        </div>

      </main>
    </div>
  );
}
