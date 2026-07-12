import { useState } from "react";

export default function CompanyForm({ onSubmit, isRunning }) {
  const [value, setValue] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || isRunning) return;
    onSubmit(trimmed);
  }

  return (
    <form onSubmit={handleSubmit} className="relative flex w-full flex-col gap-2.5 sm:flex-row items-stretch">
      <div className="relative flex-1">
        <span className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-slate-400">
          <svg className="w-4 h-4 text-brand-neon/80" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </span>
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Research any company (e.g. Apple Inc., Reliance Industries)..."
          disabled={isRunning}
          className="w-full pl-11 pr-4 py-3 text-sm rounded-xl border border-white/5 bg-white/[0.02] 
                     text-slate-100 placeholder:text-slate-500 outline-none transition-all duration-300
                     focus:border-brand-neon/50 focus:bg-white/[0.04] focus:ring-4 focus:ring-brand/10 disabled:opacity-50
                     shadow-inner"
        />
      </div>
      <button
        type="submit"
        disabled={isRunning || !value.trim()}
        className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-brand to-brand-hover px-6 py-3 text-sm font-semibold text-white
                   transition-all duration-300 hover:brightness-110 active:scale-95 disabled:scale-100 disabled:cursor-not-allowed
                   disabled:opacity-30 shadow-lg shadow-brand/15 hover:shadow-brand/25 disabled:shadow-none hover:shadow-xl font-sans"
      >
        {isRunning ? (
          <>
            <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <span className="font-mono text-xs uppercase tracking-wider">Analyzing</span>
          </>
        ) : (
          <span className="font-mono text-xs uppercase tracking-wider flex items-center gap-1.5">
            Analyze
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </span>
        )}
      </button>
    </form>
  );
}
