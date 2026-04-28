import React, { useState, useEffect } from 'react';
import { Database, BrainCircuit, Calculator, BarChart4, ArrowRight } from 'lucide-react';

export default function AgentPipeline({ liveData, lastUpdate }) {
  const [activeStep, setActiveStep] = useState(0);

  // Trigger the sequential animation whenever a new cycle arrives
  useEffect(() => {
    if (!lastUpdate) return;
    
    // Start sequence
    setActiveStep(1);
    
    const timers = [
      setTimeout(() => setActiveStep(2), 600),   // Ingestion -> Congestion
      setTimeout(() => setActiveStep(3), 1600),  // Congestion -> Optimizer (takes longer to simulate LLM thinking)
      setTimeout(() => setActiveStep(4), 2200),  // Optimizer -> Reporter
      setTimeout(() => setActiveStep(0), 3500)   // Back to idle
    ];

    return () => timers.forEach(clearTimeout);
  }, [lastUpdate]);

  // Derived data for the snippets
  const totalVehicles = liveData?.vehicle_counts 
    ? Object.values(liveData.vehicle_counts).reduce((a,b) => a+b, 0) 
    : '--';
  const severity = liveData?.congestion_report?.severity || '--';
  const totalCycle = liveData?.signal_plan?.total_cycle || '--';
  const improvement = liveData?.metrics?.improvement_percent || '--';

  const agents = [
    {
      id: 1,
      title: "1. Ingestion Agent",
      icon: <Database size={24} />,
      snippet: `Ingested ${totalVehicles} vehicles`,
      color: "border-green-500",
      glow: "shadow-[0_0_20px_-5px_rgba(34,197,94,0.6)]",
      textColor: "text-green-400"
    },
    {
      id: 2,
      title: "2. Congestion Agent",
      icon: <BrainCircuit size={24} />,
      snippet: `AI Reasoning: ${severity}`,
      color: "border-blue-500",
      glow: "shadow-[0_0_20px_-5px_rgba(59,130,246,0.6)]",
      textColor: "text-blue-400"
    },
    {
      id: 3,
      title: "3. Optimizer Agent",
      icon: <Calculator size={24} />,
      snippet: `Calculated ${totalCycle}s cycle`,
      color: "border-amber-500",
      glow: "shadow-[0_0_20px_-5px_rgba(245,158,11,0.6)]",
      textColor: "text-amber-400"
    },
    {
      id: 4,
      title: "4. Reporter Agent",
      icon: <BarChart4 size={24} />,
      snippet: `${improvement}% Faster`,
      color: "border-purple-500",
      glow: "shadow-[0_0_20px_-5px_rgba(168,85,247,0.6)]",
      textColor: "text-purple-400"
    }
  ];

  return (
    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 relative overflow-hidden">
      <div className="text-xs font-mono text-slate-500 uppercase tracking-wider mb-8 flex items-center justify-between">
        <span>Live LangGraph Agent Pipeline</span>
        {activeStep !== 0 && (
          <span className="text-blue-400 animate-pulse font-bold">Processing Cycle {liveData?.cycle}...</span>
        )}
      </div>

      <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-2 w-full max-w-5xl mx-auto">
        {agents.map((agent, idx) => {
          const isActive = activeStep === agent.id;
          const isDone = activeStep > agent.id || activeStep === 0;

          return (
            <React.Fragment key={agent.id}>
              {/* Agent Node */}
              <div 
                className={`
                  relative flex flex-col items-center p-4 w-48 rounded-xl border-2 transition-all duration-300
                  ${isActive ? `bg-gray-800 scale-105 ${agent.color} ${agent.glow}` : 'bg-gray-950/50 border-gray-800'}
                  ${isDone && liveData ? 'border-gray-700' : ''}
                `}
              >
                <div className={`mb-3 ${isActive ? agent.textColor : 'text-slate-500'}`}>
                  {agent.icon}
                </div>
                <h3 className="text-xs font-bold text-slate-200 mb-1 text-center">{agent.title}</h3>
                
                {/* Live Snippet Box */}
                <div className={`
                  mt-2 px-2 py-1 rounded text-[10px] font-mono text-center w-full transition-opacity duration-300
                  ${(isActive || isDone) && liveData ? 'opacity-100 bg-gray-900 text-slate-300' : 'opacity-0'}
                `}>
                  {agent.snippet}
                </div>
              </div>

              {/* Connecting Arrow */}
              {idx < agents.length - 1 && (
                <div className="hidden md:flex items-center justify-center flex-1">
                  <div className={`
                    h-0.5 w-full max-w-[40px] relative transition-colors duration-300
                    ${activeStep > agent.id ? agent.color.replace('border-', 'bg-') : 'bg-gray-800'}
                  `}>
                    {activeStep === agent.id + 1 && (
                      <div className={`absolute top-1/2 -translate-y-1/2 w-2 h-2 rounded-full ${agent.color.replace('border-', 'bg-')} animate-ping`}></div>
                    )}
                  </div>
                  <ArrowRight size={16} className={`ml-1 ${activeStep > agent.id ? agent.textColor : 'text-gray-800'}`} />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
