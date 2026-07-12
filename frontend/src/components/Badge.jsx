const STYLES = {
  Invest: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.12)]",
  Pass: "bg-rose-500/10 text-rose-300 border-rose-500/30 shadow-[0_0_12px_rgba(244,63,94,0.12)]",
  Hold: "bg-amber-500/10 text-amber-300 border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.12)]",
};

const DOTS = {
  Invest: "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)] animate-pulse",
  Pass: "bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.8)] animate-pulse",
  Hold: "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)] animate-pulse",
};

export default function Badge({ decision }) {
  const style = STYLES[decision] || STYLES.Hold;
  const dotColor = DOTS[decision] || DOTS.Hold;

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3.5 py-1 text-xs font-bold uppercase tracking-wider transition-all duration-300 font-mono ${style}`}
    >
      <span className={`h-2 w-2 rounded-full ${dotColor}`} />
      {decision}
    </span>
  );
}
