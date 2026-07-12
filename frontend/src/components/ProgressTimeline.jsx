import { useEffect, useState, useRef } from "react";

export default function ProgressTimeline({ stages }) {
  const [logs, setLogs] = useState([]);
  const terminalEndRef = useRef(null);

  // Auto-scroll logs to bottom
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  // Generate logs based on active/done stages
  useEffect(() => {
    const newLogs = [
      `[SYSTEM] Initializing multi-agent investment engine...`,
      `[SYSTEM] Connecting to real-time market streams...`,
    ];

    stages.forEach((stage) => {
      if (stage.status === "done" || stage.status === "active") {
        if (stage.node === "resolveCompany") {
          newLogs.push(`[RESOLVER] Triggering entity resolution sub-agent...`);
          if (stage.status === "done" && stage.data?.resolvedEntity) {
            const ent = stage.data.resolvedEntity;
            newLogs.push(`[RESOLVER] Entity resolved: "${ent.companyName || "Unknown"}"`);
            newLogs.push(`[RESOLVER] Metadata found: Ticker "${ent.likelyTicker || "N/A"}" on ${ent.exchange || "private/unknown market"}`);
          }
        }
        if (stage.node === "parallelResearch") {
          newLogs.push(`[RESEARCH] Spawning crawler threads in parallel...`);
          newLogs.push(`[RESEARCH_FUND] Pulling income, balance sheets & margin ratios...`);
          newLogs.push(`[RESEARCH_NEWS] Crawling news tickers and indexing articles...`);
          newLogs.push(`[RESEARCH_MKT] Running historical volatility & daily price checks...`);
          if (stage.status === "done" && stage.data) {
            const d = stage.data;
            const funOk = d.fundamentals?.available ? "success" : "skipped";
            const newsCount = d.news?.items?.length || 0;
            const mktCount = d.market?.items?.length || 0;
            newLogs.push(`[RESEARCH_FUND] Fundamentals check: ${funOk}`);
            newLogs.push(`[RESEARCH_NEWS] Retested & indexed ${newsCount} news articles`);
            newLogs.push(`[RESEARCH_MKT] Synced ${mktCount} market indicators`);
          }
        }
        if (stage.node === "synthesize") {
          newLogs.push(`[SYNTHESIZER] Reading crawler payloads...`);
          newLogs.push(`[SYNTHESIZER] Executing LLM synthesis vector chains...`);
          newLogs.push(`[SYNTHESIZER] Isolating key catalytic drivers and risk anchors...`);
          if (stage.status === "done" && stage.data?.synthesis) {
            newLogs.push(`[SYNTHESIZER] Synthesis complete. Core thesis compiled.`);
            if (stage.data.synthesis.dataGaps?.length > 0) {
              newLogs.push(`[SYNTHESIZER] Warning: Detected ${stage.data.synthesis.dataGaps.length} critical data gaps`);
            }
          }
        }
        if (stage.node === "decisionCritique") {
          newLogs.push(`[CRITIQUE] Initial recommendation proposed.`);
          newLogs.push(`[CRITIQUE] Spawning Devil's Advocate critique agent...`);
          newLogs.push(`[CRITIQUE] Agent challenging synthesis bias & checking downside traps...`);
          if (stage.status === "done" && stage.data?.critique) {
            const critiqueDecision = stage.data.critique.finalDecision || stage.data.decision?.decision;
            const conf = stage.data.critique.finalConfidence || stage.data.decision?.confidence;
            newLogs.push(`[CRITIQUE] Critique complete. Verdict: "${stage.data.critique.verdict || "SUPPORT"}"`);
            newLogs.push(`[CRITIQUE] Reconciled Final Recommendation: "${critiqueDecision || "Hold"}" (${conf || 0}% confidence)`);
          }
        }
        if (stage.node === "formatOutput") {
          newLogs.push(`[FORMATTER] Aggregating references and citations...`);
          newLogs.push(`[FORMATTER] Compiling visual executive dossier...`);
          if (stage.status === "done") {
            newLogs.push(`[SYSTEM] Research Dossier finalized. Output ready.`);
          }
        }
      }
    });

    setLogs(newLogs);
  }, [stages]);

  const resolveCompany = stages.find((s) => s.node === "resolveCompany");
  const parallelResearch = stages.find((s) => s.node === "parallelResearch");
  const synthesize = stages.find((s) => s.node === "synthesize");
  const decisionCritique = stages.find((s) => s.node === "decisionCritique");
  const formatOutput = stages.find((s) => s.node === "formatOutput");

  return (
    <div className="space-y-6">
      {/* 1. FUTURISTIC NODE FLOW CHART */}
      <div className="glass-panel rounded-2xl p-6 space-y-8 relative overflow-hidden bg-gradient-to-br from-surface-raised/40 to-surface/20">
        <div className="absolute top-0 right-0 p-3">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-neon opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-brand-neon"></span>
          </span>
        </div>

        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 font-mono flex items-center gap-2 border-b border-white/5 pb-3">
          <svg className="w-4 h-4 text-brand-neon animate-spin-slow" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Multi-Agent Graph
        </h3>

        <div className="relative pl-8 space-y-8">
          {/* Vertical continuous connector line */}
          <div className="absolute left-[15px] top-2 bottom-2 w-0.5 bg-gradient-to-b from-brand-neon via-brand/40 to-white/5" />

          {/* Node 1: Resolve Company */}
          <div className="relative flex items-start gap-4">
            {/* Pulsing indicator node */}
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all duration-300 z-10 shrink-0 ${
              resolveCompany?.status === "active" ? "bg-brand/20 border-brand-neon text-brand-neon shadow-[0_0_10px_rgba(99,102,241,0.4)]" :
              resolveCompany?.status === "done" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" :
              "bg-[#0a0f18] border-white/5 text-slate-600"
            }`}>
              {resolveCompany?.status === "done" ? (
                <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <span className="text-xs font-mono font-bold">1</span>
              )}
            </div>
            
            <div className="space-y-1.5">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                1. Company Resolution
              </h4>
              {resolveCompany?.status === "active" && (
                <span className="text-[10px] text-brand-neon animate-pulse font-mono block">Resolving enterprise entity...</span>
              )}
              {resolveCompany?.status === "done" && resolveCompany.data?.resolvedEntity && (
                <div className="text-xs text-slate-400 bg-white/[0.02] border border-white/5 rounded-lg px-3 py-1.5 font-mono inline-block">
                  Canonical: <span className="text-emerald-400 font-bold">{resolveCompany.data.resolvedEntity.companyName || "Unknown"}</span> ({resolveCompany.data.resolvedEntity.likelyTicker || "PRVT"})
                </div>
              )}
            </div>
          </div>

          {/* Node 2: Spawning parallel agent scrapers */}
          <div className="relative flex items-start gap-4">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all duration-300 z-10 shrink-0 ${
              parallelResearch?.status === "active" ? "bg-brand/20 border-brand-neon text-brand-neon shadow-[0_0_10px_rgba(99,102,241,0.4)]" :
              parallelResearch?.status === "done" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" :
              "bg-[#0a0f18] border-white/5 text-slate-600"
            }`}>
              {parallelResearch?.status === "done" ? (
                <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <span className="text-xs font-mono font-bold">2</span>
              )}
            </div>

            <div className="space-y-3 flex-1 min-w-0">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                2. Parallel Crawler Threads
              </h4>
              
              {(parallelResearch?.status === "active" || parallelResearch?.status === "done") && (
                <div className="grid grid-cols-3 gap-2.5 max-w-md">
                  {/* Fundamentals */}
                  <div className={`p-2.5 rounded-xl border text-center transition-all duration-300 ${
                    parallelResearch?.status === "done" ? "bg-emerald-500/[0.02] border-emerald-500/20 text-emerald-400" :
                    "bg-brand/5 border-brand-neon/20 text-slate-300 animate-pulse-slow"
                  }`}>
                    <span className="text-[10px] font-mono block font-bold leading-tight">Fundamentals</span>
                    <span className="text-[9px] text-slate-500 font-mono mt-1 block">
                      {parallelResearch?.status === "done" ? (parallelResearch.data?.fundamentals?.available ? "✓ Synced" : "× Skip") : "Running"}
                    </span>
                  </div>
                  {/* News */}
                  <div className={`p-2.5 rounded-xl border text-center transition-all duration-300 ${
                    parallelResearch?.status === "done" ? "bg-emerald-500/[0.02] border-emerald-500/20 text-emerald-400" :
                    "bg-brand/5 border-brand-neon/20 text-slate-300 animate-pulse-slow"
                  }`}>
                    <span className="text-[10px] font-mono block font-bold leading-tight">News Feed</span>
                    <span className="text-[9px] text-slate-500 font-mono mt-1 block">
                      {parallelResearch?.status === "done" ? `✓ ${parallelResearch.data?.news?.items?.length || 0} Art.` : "Running"}
                    </span>
                  </div>
                  {/* Market */}
                  <div className={`p-2.5 rounded-xl border text-center transition-all duration-300 ${
                    parallelResearch?.status === "done" ? "bg-emerald-500/[0.02] border-emerald-500/20 text-emerald-400" :
                    "bg-brand/5 border-brand-neon/20 text-slate-300 animate-pulse-slow"
                  }`}>
                    <span className="text-[10px] font-mono block font-bold leading-tight">Market Check</span>
                    <span className="text-[9px] text-slate-500 font-mono mt-1 block">
                      {parallelResearch?.status === "done" ? `✓ ${parallelResearch.data?.market?.items?.length || 0} Ind.` : "Running"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Node 3: Synthesize */}
          <div className="relative flex items-start gap-4">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all duration-300 z-10 shrink-0 ${
              synthesize?.status === "active" ? "bg-brand/20 border-brand-neon text-brand-neon shadow-[0_0_10px_rgba(99,102,241,0.4)]" :
              synthesize?.status === "done" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" :
              "bg-[#0a0f18] border-white/5 text-slate-600"
            }`}>
              {synthesize?.status === "done" ? (
                <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <span className="text-xs font-mono font-bold">3</span>
              )}
            </div>

            <div className="space-y-1.5 flex-1 min-w-0">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                3. Synthesis Engine
              </h4>
              {synthesize?.status === "active" && (
                <span className="text-[10px] text-brand-neon animate-pulse font-mono block">Synthesizing fundamentals, news, and market data...</span>
              )}
              {synthesize?.status === "done" && synthesize.data?.synthesis?.summary && (
                <p className="text-xs text-slate-400 bg-white/[0.02] border border-white/5 rounded-lg px-3 py-2 font-mono leading-relaxed line-clamp-2 max-w-xl">
                  {synthesize.data.synthesis.summary}
                </p>
              )}
            </div>
          </div>

          {/* Node 4: Critique */}
          <div className="relative flex items-start gap-4">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all duration-300 z-10 shrink-0 ${
              decisionCritique?.status === "active" ? "bg-brand/20 border-brand-neon text-brand-neon shadow-[0_0_10px_rgba(99,102,241,0.4)]" :
              decisionCritique?.status === "done" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" :
              "bg-[#0a0f18] border-white/5 text-slate-600"
            }`}>
              {decisionCritique?.status === "done" ? (
                <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <span className="text-xs font-mono font-bold">4</span>
              )}
            </div>

            <div className="space-y-1.5 flex-1 min-w-0">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                4. Critique & Devil's Advocate
              </h4>
              {decisionCritique?.status === "active" && (
                <span className="text-[10px] text-brand-neon animate-pulse font-mono block">Running critique validation audit...</span>
              )}
              {decisionCritique?.status === "done" && decisionCritique.data && (
                <div className="text-[11px] font-mono text-slate-400 bg-white/[0.02] border border-white/5 rounded-lg px-3 py-1.5 inline-flex gap-4">
                  <span>Draft Verdict: <span className="font-bold text-white bg-brand/20 border border-brand/25 px-1.5 py-0.5 rounded">{decisionCritique.data?.critique?.verdict || "reconciled"}</span></span>
                  <span>Decision: <span className="font-bold text-brand-neon">{decisionCritique.data?.critique?.finalDecision || decisionCritique.data?.decision?.decision}</span> ({decisionCritique.data?.critique?.finalConfidence || decisionCritique.data?.decision?.confidence}%)</span>
                </div>
              )}
            </div>
          </div>

          {/* Node 5: Format Output */}
          <div className="relative flex items-start gap-4">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all duration-300 z-10 shrink-0 ${
              formatOutput?.status === "active" ? "bg-brand/20 border-brand-neon text-brand-neon shadow-[0_0_10px_rgba(99,102,241,0.4)]" :
              formatOutput?.status === "done" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" :
              "bg-[#0a0f18] border-white/5 text-slate-600"
            }`}>
              {formatOutput?.status === "done" ? (
                <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <span className="text-xs font-mono font-bold">5</span>
              )}
            </div>

            <div className="space-y-1.5 flex-1 min-w-0">
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                5. Dossier Output Compiled
              </h4>
            </div>
          </div>
        </div>
      </div>

      {/* 2. AGENT STREAM TERMINAL */}
      <div className="glass-panel rounded-2xl p-4 md:p-5 bg-black/80 border border-white/5 shadow-2xl relative">
        {/* Terminal Header */}
        <div className="flex items-center justify-between border-b border-white/5 pb-2.5 mb-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
            <span className="text-[10px] font-mono text-slate-500 ml-2">agent_logger --stream</span>
          </div>
          <span className="text-[9px] font-mono bg-white/5 px-2 py-0.5 rounded text-slate-400">
            TTY-1
          </span>
        </div>

        {/* Terminal logs content */}
        <div className="font-mono text-xs text-slate-300 space-y-1.5 max-h-[180px] overflow-y-auto pr-2 scrollbar-none select-text">
          {logs.map((log, idx) => {
            let colorClass = "text-slate-400";
            if (log.startsWith("[SYSTEM]")) colorClass = "text-brand-light font-bold";
            else if (log.startsWith("[RESOLVER]")) colorClass = "text-accent-cyan";
            else if (log.includes("RESOLVER] Entity resolved")) colorClass = "text-emerald-400 font-bold";
            else if (log.startsWith("[RESEARCH")) colorClass = "text-accent-violet";
            else if (log.startsWith("[SYNTHESIZER]")) colorClass = "text-amber-300";
            else if (log.startsWith("[CRITIQUE]")) colorClass = "text-rose-400";
            else if (log.startsWith("[FORMATTER]")) colorClass = "text-slate-300";

            return (
              <div key={idx} className="flex gap-2 items-start leading-relaxed">
                <span className="text-white/20 select-none">{">"}</span>
                <span className={colorClass}>{log}</span>
              </div>
            );
          })}
          <div ref={terminalEndRef} />
        </div>
      </div>
    </div>
  );
}
