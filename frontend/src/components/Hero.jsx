import React from 'react';
import { ArrowDown, ArrowRight, Cpu, Activity, Zap } from 'lucide-react';

export default function Hero({ setPage }) {
  const scrollToDashboard = () => {
    document.getElementById('dashboard-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="relative min-h-[90vh] flex flex-col items-center justify-center overflow-hidden border-b border-gray-800 bg-gray-950">

      {/* Background gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/20 blur-[120px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-0 right-0 w-[500px] h-[300px] bg-emerald-600/10 blur-[100px] rounded-full pointer-events-none"></div>

      <div className="z-10 max-w-4xl mx-auto px-6 text-center space-y-8 mt-10">

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-950/50 border border-blue-800/50 text-blue-400 text-xs font-mono mb-4">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
          </span>
          Agentic AI
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-white">
          Agentic AI <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-emerald-400">Traffic Optimizer</span>
        </h1>

        {/* Description */}
        <p className="text-lg md:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Transforming Bengaluru's Silk Board Junction. We replaced fixed-cycle timers with an autonomous AI agent pipeline that dynamically reads live traffic data, reasons about congestion, and reallocates green time to eliminate wait times.
        </p>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-8 max-w-3xl mx-auto text-left">
          <div className="bg-gray-900/50 border border-gray-800 p-4 rounded-xl">
            <Cpu className="text-blue-400 mb-3" size={24} />
            <h3 className="text-slate-200 font-semibold mb-1">LangGraph Agents</h3>
            <p className="text-slate-500 text-sm">4-stage LLM pipeline analyzes congestion autonomously.</p>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 p-4 rounded-xl">
            <Activity className="text-emerald-400 mb-3" size={24} />
            <h3 className="text-slate-200 font-semibold mb-1">Real-Time Data</h3>
            <p className="text-slate-500 text-sm">Ingests live simulation & API data every 5 seconds.</p>
          </div>
          <div className="bg-gray-900/50 border border-gray-800 p-4 rounded-xl">
            <Zap className="text-amber-400 mb-3" size={24} />
            <h3 className="text-slate-200 font-semibold mb-1">Dynamic Timers</h3>
            <p className="text-slate-500 text-sm">Math-based optimization instantly cuts wait times.</p>
          </div>
        </div>

        {/* Buttons */}
        <div className="pt-12 pb-16 flex flex-col items-center gap-4">
          <button 
            onClick={() => setPage('agents')}
            className="group inline-flex items-center gap-3 bg-gray-900 border border-blue-500/50 text-blue-400 px-8 py-4 rounded-full font-bold hover:bg-blue-950 transition-all shadow-[0_0_20px_-5px_rgba(59,130,246,0.5)]"
          >
            WANT TO SEE HOW OUR 4 AGENTS WORK TOGETHER?
            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
          </button>

          <button
            onClick={scrollToDashboard}
            className="group inline-flex items-center gap-3 bg-white text-gray-950 px-8 py-3 rounded-full font-bold hover:bg-slate-200 transition-all shadow-[0_0_40px_-10px_rgba(255,255,255,0.3)] mt-2"
          >
            Launch Live Dashboard
            <ArrowDown size={18} className="group-hover:translate-y-1 transition-transform" />
          </button>
        </div>

      </div>
    </div>
  );
}
