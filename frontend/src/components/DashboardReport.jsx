import { useState } from "react";
import Badge from "./Badge.jsx";

// visual thesis card matching bull/bear sentiments
function VisualCardList({ title, items, variant = "neutral" }) {
  if (!items || items.length === 0) return null;

  const bgStyles = {
    bull: "bg-emerald-500/[0.02] border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.02)]",
    bear: "bg-rose-500/[0.02] border-rose-500/20 shadow-[0_0_15px_rgba(244,63,94,0.02)]",
    neutral: "bg-white/[0.01] border-white/5",
  };

  const tagColors = {
    bull: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
    bear: "text-rose-400 bg-rose-500/10 border-rose-500/20",
    neutral: "text-slate-400 bg-white/5 border-white/5",
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <span className={`text-[10px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded border ${tagColors[variant]}`}>
          {variant === "bull" ? "Bull Catalysts" : variant === "bear" ? "Bear Risks" : "Metrics"}
        </span>
        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-mono">
          {title}
        </h4>
      </div>
      <div className="space-y-2.5">
        {items.map((item, i) => (
          <div
            key={i}
            className={`p-3.5 rounded-xl border flex items-start gap-3 text-sm text-slate-300 leading-relaxed transition-all duration-300 hover:bg-slate-900/40 hover:border-slate-800/80 ${bgStyles[variant]}`}
          >
            {variant === "bull" ? (
              <svg className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 11l3-3m0 0l3 3m-3-3v8m0-13a9 9 0 110 18 9 9 0 010-18z" />
              </svg>
            ) : variant === "bear" ? (
              <svg className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 13l-3 3m0 0l-3-3m3 3V8m0-5a9 9 0 110 18 9 9 0 010-18z" />
              </svg>
            ) : (
              <div className="w-1.5 h-1.5 rounded-full bg-slate-500 shrink-0 mt-2" />
            )}
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardReport({ result }) {
  const [activeTab, setActiveTab] = useState("overview");

  if (!result) return null;

  const {
    company,
    decision,
    confidence,
    reasoning,
    risks,
    catalysts,
    critique,
    synthesis,
    fundamentals,
    citations,
    dataQualityNotes,
    generatedAt,
  } = result;

  // Colors mapping for SVG and layout glows
  const activeColor = 
    decision === "Invest" ? "#10b981" : 
    decision === "Pass" ? "#f43f5e" : 
    "#f59e0b";

  const glowShadow = 
    decision === "Invest" ? "shadow-[0_0_35px_rgba(16,185,129,0.1)] border-emerald-500/20" : 
    decision === "Pass" ? "shadow-[0_0_35px_rgba(244,63,94,0.1)] border-rose-500/20" : 
    "shadow-[0_0_35px_rgba(245,158,11,0.1)] border-amber-500/20";

  // Parse dollar/rupee strings to numeric values for slider percentage
  function getRangePercent(lowStr, highStr, currentStr) {
    try {
      const cleanNum = (str) => {
        if (!str) return NaN;
        // Strip non-numbers except dots
        const clean = str.toString().replace(/[^0-9.]/g, "");
        return parseFloat(clean);
      };
      const low = cleanNum(lowStr);
      const high = cleanNum(highStr);
      const current = cleanNum(currentStr);
      if (isNaN(low) || isNaN(high) || isNaN(current) || (high - low) <= 0) {
        return 50; // Fallback to middle if invalid
      }
      const percent = ((current - low) / (high - low)) * 100;
      return Math.min(Math.max(percent, 0), 100);
    } catch {
      return 50;
    }
  }

  function getDomain(url) {
    try {
      return new URL(url).hostname.replace("www.", "");
    } catch {
      return "External Link";
    }
  }

  const formattedDate = generatedAt 
    ? new Date(generatedAt).toLocaleDateString(undefined, {
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
      })
    : "";

  return (
    <div className="w-full space-y-8 animate-slideUp">
      {/* 1. BRAND EXECUTIVE COMMAND HEADER */}
      <div className={`glass-panel rounded-2xl p-6 md:p-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative overflow-hidden bg-gradient-to-br from-surface-raised/40 to-surface/20 ${glowShadow}`}>
        {/* Subtle ambient light backdrops */}
        <div 
          className="absolute -right-16 -top-16 w-64 h-64 rounded-full blur-3xl opacity-[0.07] pointer-events-none transition-all duration-700"
          style={{ backgroundColor: activeColor }}
        />

        <div className="space-y-3 flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white font-sans">
              {company?.companyName || "Resolved Enterprise"}
            </h2>
            {company?.isPublic ? (
              <span className="text-[9px] uppercase font-mono font-bold tracking-widest text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full">
                Public Market
              </span>
            ) : (
              <span className="text-[9px] uppercase font-mono font-bold tracking-widest text-slate-400 bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full">
                Private / Unresolved
              </span>
            )}
          </div>
          
          <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-400 font-mono">
            {company?.likelyTicker && (
              <span className="font-bold text-slate-200 bg-white/5 px-2 py-0.5 rounded border border-white/5">
                {company.exchange ? `${company.exchange} : ` : ""}{company.likelyTicker}
              </span>
            )}
            {company?.sector && (
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                <span>Sector: <span className="text-slate-300 font-semibold">{company.sector}</span></span>
              </div>
            )}
            {formattedDate && (
              <div className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                <span className="text-slate-500">Refreshed {formattedDate}</span>
              </div>
            )}
          </div>

          {company?.notes && (
            <div className="p-3 bg-white/[0.02] border border-white/5 rounded-xl text-xs text-slate-400 leading-relaxed italic max-w-2xl">
              <span className="font-bold font-mono text-[9px] uppercase tracking-wider text-slate-500 block mb-1">Company Context Note</span>
              "{company.notes}"
            </div>
          )}
        </div>

        {/* Circular Dial and Badge status pill */}
        <div className="flex items-center gap-6 self-stretch md:self-auto border-t md:border-t-0 border-white/5 pt-5 md:pt-0 shrink-0">
          <div className="flex flex-col items-end gap-1.5">
            <span className="text-[9px] uppercase font-bold tracking-widest text-slate-500 font-mono">
              Decision Directive
            </span>
            <Badge decision={decision} />
          </div>

          <div className="relative flex items-center justify-center shrink-0">
            {/* SVG Progress Circle */}
            <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
              <circle
                cx="18"
                cy="18"
                r="15.915"
                fill="none"
                stroke="rgba(255,255,255,0.02)"
                strokeWidth="2.5"
              />
              <circle
                cx="18"
                cy="18"
                r="15.915"
                fill="none"
                stroke={activeColor}
                strokeWidth="2.5"
                strokeDasharray={`${confidence} 100`}
                strokeDashoffset="0"
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
                style={{ filter: `drop-shadow(0 0 4px ${activeColor}50)` }}
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-base font-extrabold text-white font-mono leading-none">{confidence}%</span>
              <span className="text-[8px] uppercase font-bold text-slate-500 font-mono tracking-tight mt-0.5">Strength</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. PREMIUM FUTURISTIC TAB BAR */}
      <div className="border-b border-white/5 flex gap-1 overflow-x-auto scrollbar-none pb-px">
        {[
          { id: "overview", label: "Executive Synthesis" },
          { id: "financials", label: "Financial Check" },
          { id: "debate", label: "Self-Critique Debate" },
          { id: "sources", label: "Research Citations" }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`whitespace-nowrap px-5 py-3 text-xs font-mono font-bold uppercase tracking-wider border-b-2 transition-all duration-300 ${
              activeTab === tab.id
                ? "border-brand-neon text-white bg-gradient-to-t from-brand/5 to-transparent font-extrabold"
                : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-white/[0.01]"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* 3. RESPONSIVE TAB AREA */}
      <div className="min-h-[300px]">
        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="space-y-6 animate-fadeIn">
            <div className="glass-panel rounded-2xl p-6 md:p-8 space-y-5 bg-gradient-to-br from-surface-raised/40 to-surface/10 relative overflow-hidden">
              <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 border-b border-white/5 pb-4 font-mono uppercase tracking-wider">
                <svg className="w-5 h-5 text-brand-neon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Synthesis Summary
              </h3>
              
              <p className="text-slate-300 text-sm md:text-base leading-relaxed font-sans font-light">
                {synthesis?.summary || "No synthesis dossier summary compiled by agent engine."}
              </p>
              
              {synthesis?.dataGaps?.length > 0 && (
                <div className="rounded-xl border border-amber-500/20 bg-amber-500/[0.02] p-4 flex gap-3.5">
                  <svg className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <h5 className="text-[10px] font-mono font-bold uppercase tracking-widest text-amber-400 mb-1.5">Identified Information Gaps</h5>
                    <ul className="list-disc pl-4 text-xs text-slate-400 space-y-1">
                      {synthesis.dataGaps.map((gap, i) => (
                        <li key={i}>{gap}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="glass-panel rounded-2xl p-6 bg-gradient-to-br from-surface-raised/40 to-surface/20">
                <VisualCardList title="Core Rationale Drivers" items={reasoning} variant="neutral" />
              </div>
              <div className="glass-panel rounded-2xl p-6 bg-gradient-to-br from-surface-raised/40 to-surface/20 flex flex-col justify-between gap-6">
                <div className="space-y-4">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 font-mono">
                    Self-Critique Conclusion
                  </h4>
                  <div className="flex items-center gap-4 bg-white/[0.02] border border-white/5 rounded-xl p-4.5">
                    <div className={`p-3 rounded-xl ${
                      critique?.verdict?.toLowerCase().includes("support") 
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25" 
                        : "bg-rose-500/10 text-rose-400 border border-rose-500/25"
                    }`}>
                      {critique?.verdict?.toLowerCase().includes("support") ? (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      ) : (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <p className="text-[9px] text-slate-500 uppercase font-mono font-bold">Audit Status</p>
                      <p className="text-sm font-semibold text-slate-200 mt-0.5 leading-relaxed">
                        The critique validation pipeline has decided to <span className="underline decoration-brand-neon decoration-2 underline-offset-2 font-bold text-white">{critique?.verdict || "SUPPORT"}</span> the initial recommendation.
                      </p>
                    </div>
                  </div>
                </div>

                <p className="text-[10px] text-slate-500 font-mono leading-relaxed">
                  // Powered by Aether Agent Engine. System compiled via automated LangGraph chains parsing financial nodes.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* FINANCIALS TAB */}
        {activeTab === "financials" && (
          <div className="space-y-6 animate-fadeIn">
            {!fundamentals?.available ? (
              <div className="glass-panel rounded-2xl p-10 text-center space-y-4">
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center mx-auto border border-white/5 text-slate-500">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h4 className="text-base font-bold text-slate-300 font-mono uppercase tracking-wide">Stock Fundamentals Not Indexed</h4>
                <p className="text-slate-400 text-sm max-w-md mx-auto leading-relaxed font-sans">
                  {fundamentals?.note || "Company metrics could not be pulled from core exchange listings. Common for private companies, general names, or symbols listing on secondary international boards."}
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Visual grid layout of core metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    { label: "Market Cap", value: fundamentals.marketCap, desc: "Total enterprise valuation" },
                    { label: "P/E Ratio", value: fundamentals.peRatio, desc: "Price-to-earnings multiple" },
                    { label: "PEG Ratio", value: fundamentals.pegRatio, desc: "Price-to-earnings growth" },
                    { label: "EPS (TTM)", value: fundamentals.eps, desc: "Earnings per share" },
                    { label: "Revenue (TTM)", value: fundamentals.revenueTTM, desc: "Trailing 12m total sales" },
                    { label: "Profit Margin", value: fundamentals.profitMargin, desc: "Net income margin" },
                    { label: "Operating Margin", value: fundamentals.operatingMarginTTM, desc: "Operating margin" },
                    { label: "ROE", value: fundamentals.returnOnEquityTTM, desc: "Return on equity percentage" }
                  ].map((metric) => (
                    <div key={metric.label} className="glass-card-glow rounded-xl p-4 flex flex-col justify-between gap-4">
                      <div className="space-y-1.5">
                        <span className="text-[9px] uppercase font-mono tracking-widest text-slate-500 font-bold block">
                          {metric.label}
                        </span>
                        <span className="text-xl font-bold text-white font-mono block tracking-tight">
                          {metric.value ?? "—"}
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-sans block leading-normal border-t border-white/5 pt-2">
                        {metric.desc}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Price indicators layout */}
                <div className="glass-panel rounded-2xl p-6 bg-gradient-to-br from-surface-raised/40 to-surface/20">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6 font-mono">
                    Trading Bounds & 52-Week Span
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-1.5">
                      <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block">Latest Close Quote</span>
                      <p className="text-3xl font-extrabold font-mono text-white">
                        {fundamentals.latestPrice || "—"}
                      </p>
                    </div>

                    <div className="space-y-1.5">
                      <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block">Daily Change Percentage</span>
                      <p className={`text-3xl font-extrabold font-mono flex items-center gap-1.5 ${
                        (fundamentals.latestChangePercent || "").toString().includes("-") 
                          ? "text-rose-400" 
                          : "text-emerald-400"
                      }`}>
                        {(fundamentals.latestChangePercent || "").toString().includes("-") ? "↓" : "↑"}
                        {fundamentals.latestChangePercent || "0.0%"}
                      </p>
                    </div>

                    <div className="space-y-2">
                      <span className="text-[10px] uppercase font-mono tracking-wider text-slate-500 block">52-Week Trading Range</span>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold font-mono text-slate-400 shrink-0">{fundamentals.fiftyTwoWeekLow || "—"}</span>
                        
                        <div className="flex-1 h-3 bg-black/60 border border-white/5 rounded-full relative">
                          {/* Colored midpoint range bar */}
                          <div className="absolute top-0 bottom-0 left-[25%] right-[25%] bg-brand/35 rounded-full" />
                          
                          {/* Sliding indicator pin representing active price location relative to 52w high/low */}
                          <div 
                            className="absolute -top-1.5 w-4.5 h-4.5 bg-brand-neon border-2 border-white rounded-full shadow-lg transition-all duration-700 select-none cursor-default"
                            style={{ 
                              left: `calc(${getRangePercent(fundamentals.fiftyTwoWeekLow, fundamentals.fiftyTwoWeekHigh, fundamentals.latestPrice)}% - 9px)`,
                              boxShadow: "0 0 10px #818cf8"
                            }}
                          />
                        </div>
                        
                        <span className="text-xs font-bold font-mono text-slate-400 shrink-0">{fundamentals.fiftyTwoWeekHigh || "—"}</span>
                      </div>
                      <span className="text-[9px] text-slate-500 font-mono text-center block pt-1">// Neon dot indicates latest price relative to low & high range boundaries</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* DEBATE TAB */}
        {activeTab === "debate" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Bull Bear side-by-side grids */}
            <div className="grid gap-6 md:grid-cols-2">
              <div className="glass-panel rounded-2xl p-5 border-t-2 border-t-emerald-500/50 bg-emerald-950/[0.02]">
                <VisualCardList title="Key Catalysts (Bull Thesis)" items={catalysts} variant="bull" />
              </div>

              <div className="glass-panel rounded-2xl p-5 border-t-2 border-t-rose-500/50 bg-rose-950/[0.02]">
                <VisualCardList title="Identified Risks (Bear Thesis)" items={risks} variant="bear" />
              </div>
            </div>

            {/* Critique & agent argument dialog simulation */}
            <div className="glass-panel rounded-2xl p-6 md:p-8 space-y-6 bg-gradient-to-br from-surface-raised/40 to-surface/20">
              <div>
                <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2 border-b border-white/5 pb-3 font-mono uppercase tracking-wider">
                  <svg className="w-5 h-5 text-brand-neon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Self-Critique Agent Transcript
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed mt-2.5 max-w-3xl">
                  To eliminate buy-side confirmation biases, the synthesis engine triggers a dedicated Devil's Advocate sub-agent. This agent critiques the bullish catalysts, highlights risk structures, and compiles counter-arguments.
                </p>
              </div>
              
              <div className="space-y-4">
                {/* Dialogue Box 1: Critique Agent */}
                <div className="flex gap-4 items-start max-w-4xl">
                  <div className="w-8 h-8 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-400 font-mono text-xs font-bold flex items-center justify-center shrink-0 shadow-sm">
                    CA
                  </div>
                  <div className="flex-1 bg-rose-950/[0.05] border border-rose-500/15 rounded-xl p-4 space-y-2">
                    <span className="text-[10px] font-mono font-bold text-rose-400 uppercase tracking-wider block">Critique Agent // Challenge Node</span>
                    <p className="text-slate-300 text-xs leading-relaxed font-mono">
                      "Analyzing the initial research report. Proposing systematic counter-arguments regarding execution risks, valuation metrics, and sentiment biases:"
                    </p>
                    <ul className="list-disc pl-4 text-xs text-slate-300 space-y-1 font-mono leading-relaxed pt-1.5 border-t border-rose-500/10">
                      {critique?.counterArguments && critique.counterArguments.length > 0 ? (
                        critique.counterArguments.map((arg, idx) => (
                          <li key={idx}>{arg}</li>
                        ))
                      ) : (
                        <li>No counter-arguments submitted by critique validation agent.</li>
                      )}
                    </ul>
                  </div>
                </div>

                {/* Dialogue Box 2: Synthesis Reconciler */}
                <div className="flex gap-4 items-start max-w-4xl justify-end ml-auto">
                  <div className="flex-1 bg-brand/5 border border-brand/20 rounded-xl p-4 text-right space-y-2">
                    <span className="text-[10px] font-mono font-bold text-brand-light uppercase tracking-wider block">Decision Agent // Final Consensus</span>
                    <p className="text-slate-200 text-xs leading-relaxed font-mono">
                      "Reconciling catalysts vs. risks. Decision established as <strong className="text-white bg-brand/20 border border-brand/30 px-2 py-0.5 rounded font-bold">{decision}</strong> with a refined confidence index of {confidence}%."
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-brand/10 border border-brand/30 text-brand-light font-mono text-xs font-bold flex items-center justify-center shrink-0 shadow-sm">
                    DA
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SOURCES TAB */}
        {activeTab === "sources" && (
          <div className="space-y-6 animate-fadeIn">
            {/* Cited References Grid */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-widest text-slate-400 font-mono">
                Cited Sources ({citations?.length || 0})
              </h4>
              
              {citations && citations.length > 0 ? (
                <div className="grid gap-4 md:grid-cols-2">
                  {citations.map((c, i) => {
                    const domain = getDomain(c.url);
                    const initial = domain.charAt(0).toUpperCase();
                    
                    let badgeColor = "bg-cyan-500/10 text-cyan-400 border-cyan-500/20";
                    if (c.type === "market") badgeColor = "bg-pink-500/10 text-pink-400 border-pink-500/20";
                    else if (c.type === "fundamentals") badgeColor = "bg-purple-500/10 text-purple-400 border-purple-500/20";

                    return (
                      <div key={i} className="glass-card-glow rounded-xl p-4.5 flex flex-col justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className={`text-[9px] font-mono uppercase px-2 py-0.5 rounded border ${badgeColor}`}>
                              {c.type || "reference"}
                            </span>
                            <span className="text-[10px] font-mono text-slate-500 font-semibold">{domain}</span>
                          </div>
                          <h5 className="text-sm font-bold text-slate-200 leading-snug line-clamp-2">
                            {c.title || "Research reference source metadata details"}
                          </h5>
                        </div>

                        <div className="flex items-center justify-between border-t border-white/5 pt-3 mt-1.5">
                          <div className="flex items-center gap-2">
                            <div className="w-5 h-5 rounded bg-white/5 flex items-center justify-center text-[10px] font-bold font-mono text-slate-400 border border-white/5 uppercase select-none">
                              {initial}
                            </div>
                            <span className="text-xs text-slate-400 truncate max-w-[150px]">{domain}</span>
                          </div>

                          <a
                            href={c.url}
                            target="_blank"
                            rel="noreferrer"
                            className="text-xs text-brand-neon hover:text-white font-bold inline-flex items-center gap-1 group transition-colors font-mono"
                          >
                            Explore Site
                            <svg className="w-3.5 h-3.5 transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="glass-panel rounded-2xl p-8 text-center text-xs text-slate-500 font-mono">
                  No cited references compiled for this dossier.
                </div>
              )}
            </div>

            {/* Data Quality Notes */}
            {dataQualityNotes?.length > 0 && (
              <div className="glass-panel rounded-2xl p-5 border-t-2 border-t-rose-500/30 bg-rose-500/[0.02]">
                <h4 className="text-xs font-bold uppercase tracking-widest text-rose-400 flex items-center gap-2 mb-3.5 font-mono">
                  <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  System Crawl logs & Audit anomalies
                </h4>
                <div className="bg-black/40 border border-white/5 rounded-xl p-4 font-mono text-[11px] text-slate-400 space-y-2 max-h-[220px] overflow-y-auto pr-2">
                  {dataQualityNotes.map((note, i) => (
                    <div key={i} className="flex gap-2.5 leading-relaxed items-start">
                      <span className="text-rose-500/70 select-none">[{i+1}]</span>
                      <span>{note}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
