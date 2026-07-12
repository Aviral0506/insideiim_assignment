import { useState, useEffect } from "react";
import CompanyForm from "./components/CompanyForm.jsx";
import ProgressTimeline from "./components/ProgressTimeline.jsx";
import DashboardReport from "./components/DashboardReport.jsx";
import { useResearchStream } from "./hooks/useResearchStream.js";

export default function App() {
  const { stages, result: streamResult, error, isRunning, start } = useResearchStream();
  const [selectedHistoryResult, setSelectedHistoryResult] = useState(null);
  
  // Load history from local storage
  const [history, setHistory] = useState(() => {
    try {
      const saved = localStorage.getItem("research_history");
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Sync finished streaming results to history list
  useEffect(() => {
    if (streamResult) {
      setHistory((prev) => {
        const filtered = prev.filter(
          (item) => item.company?.companyName?.toLowerCase() !== streamResult.company?.companyName?.toLowerCase()
        );
        const next = [streamResult, ...filtered].slice(0, 8);
        localStorage.setItem("research_history", JSON.stringify(next));
        return next;
      });
      setSelectedHistoryResult(streamResult);
    }
  }, [streamResult]);

  // Clear history function
  const handleClearHistory = () => {
    localStorage.removeItem("research_history");
    setHistory([]);
    setSelectedHistoryResult(null);
  };

  const handleStartSearch = (companyName) => {
    setSelectedHistoryResult(null);
    start(companyName);
  };

  const hasStarted = stages.some((s) => s.status !== "pending");
  const activeResult = isRunning ? null : (selectedHistoryResult || streamResult);

  // Quick start suggestions
  const SUGGESTIONS = [
    { name: "Apple Inc.", exchange: "NASDAQ", symbol: "AAPL", desc: "Consumer Tech Giant" },
    { name: "Nvidia Corp.", exchange: "NASDAQ", symbol: "NVDA", desc: "AI Hardware Leader" },
    { name: "Tesla Inc.", exchange: "NASDAQ", symbol: "TSLA", desc: "EV & AI Automation" },
    { name: "Reliance Industries", exchange: "NSE", symbol: "RELIANCE", desc: "Energy & Telecom Conglomerate" },
  ];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row text-slate-100 font-sans antialiased overflow-x-hidden relative">
      
      {/* 1. FUTURISTIC SIDEBAR */}
      <aside className="w-full lg:w-80 lg:shrink-0 bg-[#03060a]/80 backdrop-blur-xl border-b lg:border-b-0 lg:border-r border-white/5 p-6 flex flex-col justify-between z-30 transition-all duration-300">
        <div className="space-y-8">
          
          {/* Logo & Platform Info */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand to-accent-violet flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-brand/20 glow-ring animate-pulse-slow">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h1 className="text-sm font-extrabold tracking-tight text-white leading-none font-mono">
                  AETHER RESEARCH
                </h1>
                <span className="text-[9px] text-brand-neon font-mono font-bold tracking-widest uppercase block mt-1">
                  AI Investment Agent
                </span>
              </div>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed font-sans font-light">
              Multi-agent reasoning workflow exploring fundamentals, news archives, and risk critique vectors.
            </p>
          </div>

          {/* History / Recent Dossiers */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-white/5 pb-2">
              <h3 className="text-[9px] font-bold uppercase tracking-widest text-slate-500 font-mono">
                Recent Dossiers
              </h3>
              {history.length > 0 && (
                <button
                  onClick={handleClearHistory}
                  disabled={isRunning}
                  className="text-[9px] font-mono uppercase font-bold text-slate-400 hover:text-rose-400 transition-colors disabled:opacity-40"
                >
                  Clear All
                </button>
              )}
            </div>

            {history.length === 0 ? (
              <div className="border border-dashed border-white/5 rounded-xl p-5 text-center bg-white/[0.005]">
                <span className="text-xs text-slate-500 font-mono">No reports cached.</span>
              </div>
            ) : (
              <div className="space-y-2 max-h-[220px] lg:max-h-[380px] overflow-y-auto pr-1">
                {history.map((item, i) => {
                  const isSelected = activeResult?.company?.companyName === item.company?.companyName;
                  return (
                    <button
                      key={i}
                      onClick={() => !isRunning && setSelectedHistoryResult(item)}
                      disabled={isRunning}
                      className={`w-full text-left p-3.5 rounded-xl border transition-all duration-300 flex flex-col gap-1.5 ${
                        isSelected
                          ? "bg-brand/10 border-brand-neon text-white shadow-[0_0_15px_rgba(99,102,241,0.08)]"
                          : "bg-white/[0.01] border-white/5 hover:border-white/10 hover:bg-white/[0.02] text-slate-300"
                      }`}
                    >
                      <div className="flex items-center justify-between w-full gap-2">
                        <span className="text-xs font-bold truncate max-w-[130px]">
                          {item.company?.companyName}
                        </span>
                        <span className={`text-[8px] font-mono px-2 py-0.5 rounded font-bold uppercase ${
                          item.decision === "Invest" 
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" 
                            : item.decision === "Pass" 
                            ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" 
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        }`}>
                          {item.decision}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-[9px] text-slate-500 font-mono">
                        <span>{item.company?.likelyTicker || "PRVT"}</span>
                        <span>{item.confidence}% confidence</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar Footer Info */}
        <div className="pt-6 border-t border-white/5 mt-6 hidden lg:block">
          <div className="flex items-center gap-2 text-[10px] text-slate-500 font-mono">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Agent Engine v1.2 Active</span>
          </div>
        </div>
      </aside>

      {/* 2. MAIN WORKSPACE */}
      <main className="flex-1 flex flex-col min-w-0 z-20">
        
        {/* Dynamic Header (hidden on landing page layout) */}
        {(hasStarted || activeResult || isRunning) && (
          <header className="glass-panel border-b border-white/5 px-6 py-4 flex flex-col md:flex-row items-stretch md:items-center gap-4 justify-between sticky top-0 z-30 bg-[#020408]/85 backdrop-blur-xl">
            <div className="flex-1 max-w-xl">
              <CompanyForm onSubmit={handleStartSearch} isRunning={isRunning} />
            </div>
            {activeResult && (
              <button
                onClick={() => handleStartSearch(activeResult.company?.companyName)}
                disabled={isRunning}
                className="text-xs font-mono font-bold uppercase tracking-wider text-slate-400 hover:text-white border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] px-4 py-2.5 rounded-xl transition flex items-center justify-center gap-2 self-start md:self-auto disabled:opacity-40"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 8H18" />
                </svg>
                Re-Analyze
              </button>
            )}
          </header>
        )}

        {/* Content Body Area */}
        <div className="flex-1 p-6 md:p-8 max-w-5xl w-full mx-auto space-y-8">
          
          {error && (
            <div className="rounded-xl border border-rose-500/20 bg-rose-500/[0.02] p-4.5 flex gap-3.5 text-sm text-rose-400 shadow-xl animate-fadeIn">
              <svg className="w-5 h-5 flex-shrink-0 mt-0.5 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <div>
                <span className="font-bold font-mono text-xs uppercase tracking-wider block text-rose-300">Crawler Stream Failure</span>
                <p className="mt-1 font-mono text-xs opacity-90">{error}</p>
              </div>
            </div>
          )}

          {/* ACTIVE PIPELINE RUNNING */}
          {isRunning && (
            <div className="grid gap-8 md:grid-cols-[1fr_320px] items-start animate-fadeIn">
              {/* Left node graph */}
              <div className="space-y-4">
                <ProgressTimeline stages={stages} />
              </div>

              {/* Right premium visual status details */}
              <div className="glass-panel rounded-2xl p-6 flex flex-col items-center justify-center text-center space-y-6 h-[340px] relative overflow-hidden bg-gradient-to-b from-surface-raised/30 to-surface/10 border-white/5">
                <div className="absolute inset-0 bg-grid-pattern opacity-10" />
                
                <div className="relative">
                  <div className="w-20 h-20 rounded-full border-[3px] border-brand/20 border-t-brand-neon animate-spin" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-extrabold text-brand-neon font-mono animate-pulse">AETHER</span>
                  </div>
                </div>
                
                <div className="space-y-2 z-10">
                  <h4 className="text-md font-bold text-white font-mono uppercase tracking-widest">Generating Dossier</h4>
                  <p className="text-xs text-slate-400 max-w-xs leading-relaxed font-sans font-light">
                    Our agent graph is querying fundamental spreadsheets, indexing sentiment tickers, and running devil's advocate checks.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ACTIVE RESEARCH REPORT DOSSIER */}
          {activeResult && !isRunning && (
            <DashboardReport result={activeResult} />
          )}

          {/* INITIAL IDLE LANDING PAGE CONTAINER */}
          {!hasStarted && !activeResult && !isRunning && (
            <div className="space-y-12 py-10 animate-slideUp max-w-4xl mx-auto">
              
              {/* Hero branding */}
              <div className="space-y-4 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand/10 border border-brand/20 text-[10px] font-mono font-bold tracking-widest text-brand-light uppercase mb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-neon animate-pulse" />
                  Aether multi-agent research core
                </div>
                <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white leading-tight font-sans">
                  Autonomous Investment <br />
                  <span className="bg-gradient-to-r from-brand-neon to-accent-cyan bg-clip-text text-transparent">
                    Research Dossier Core
                  </span>
                </h2>
                <p className="text-slate-400 text-sm md:text-base leading-relaxed max-w-2xl mx-auto font-sans font-light">
                  Input an enterprise entity name. Our multi-agent graphs fetch key balance metrics, index recent media coverage, synthesize recommendations, and run critique counter-audits.
                </p>
              </div>

              {/* Centered console prompt entry */}
              <div className="max-w-2xl mx-auto glass-panel p-5 rounded-2xl border-white/5 shadow-2xl relative bg-gradient-to-r from-[#0a0f18]/90 to-[#04080f]/90">
                <CompanyForm onSubmit={handleStartSearch} isRunning={isRunning} />
              </div>

              {/* suggestions network */}
              <div className="space-y-4">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-slate-500 font-mono text-center">
                  Quick Query Anchors
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  {SUGGESTIONS.map((sug) => (
                    <button
                      key={sug.name}
                      onClick={() => handleStartSearch(sug.name)}
                      className="glass-card-glow rounded-xl p-4 text-left transition duration-300 group hover:scale-102 flex flex-col justify-between gap-3 h-28 relative overflow-hidden"
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="text-[9px] font-mono font-bold text-brand-neon bg-brand/15 px-1.5 py-0.5 rounded border border-brand/25">
                          {sug.symbol}
                        </span>
                        <svg className="w-3.5 h-3.5 text-slate-500 group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </div>
                      <div>
                        <span className="text-xs font-bold text-slate-200 block group-hover:text-white transition-colors truncate">
                          {sug.name}
                        </span>
                        <span className="text-[9px] text-slate-500 font-sans block mt-0.5 truncate">{sug.desc}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Platform core cards */}
              <div className="grid gap-6 md:grid-cols-2 border-t border-white/5 pt-10">
                {[
                  {
                    title: "Automated Devil's Advocate",
                    desc: "Forces a custom critique sub-agent to challenge synthesis recommendations, identifying confirmation bias and highlighting structural pitfalls.",
                    icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z",
                    tag: "CRITIQUE NODE"
                  },
                  {
                    title: "Multi-Agent Scraper Parallelism",
                    desc: "Crawls financial statements, news feeds, and daily stock listings simultaneously to guarantee robust multi-modal search synthesis.",
                    icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10",
                    tag: "PARALLEL CRAWLING"
                  },
                  {
                    title: "Exchange Fundamentals Audit",
                    desc: "Pulls metrics like profit margins, current P/E, Operating EBITDA, and 52-week quote bounds dynamically.",
                    icon: "M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z",
                    tag: "FINANCE HARVESTER"
                  },
                  {
                    title: "Information Footprints & Citations",
                    desc: "Maintains transparency by outputting direct source citations, site URLs, and data quality logs for full tracking verification.",
                    icon: "M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4",
                    tag: "DATA AUDIT"
                  }
                ].map((feat) => (
                  <div key={feat.title} className="glass-panel rounded-2xl p-5.5 flex gap-4 items-start bg-gradient-to-br from-surface-raised/40 to-surface/20 hover:border-brand/30 duration-300">
                    <div className="p-2.5 rounded-xl bg-brand/10 text-brand-light border border-brand/20 shrink-0 shadow-inner">
                      <svg className="w-5 h-5 text-brand-neon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={feat.icon} />
                      </svg>
                    </div>
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="text-[8px] font-mono font-bold text-slate-500 tracking-wider">
                          {feat.tag}
                        </span>
                      </div>
                      <h5 className="text-xs font-bold text-white font-mono uppercase tracking-wide">{feat.title}</h5>
                      <p className="text-xs text-slate-400 leading-relaxed font-sans font-light">{feat.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

            </div>
          )}

        </div>
      </main>
    </div>
  );
}
