import { useCallback, useRef, useState } from "react";
import { buildResearchStreamUrl } from "../api/research.js";

export const STAGE_LABELS = {
  resolveCompany: "Resolving company",
  parallelResearch: "Researching fundamentals, news & market",
  synthesize: "Synthesizing findings",
  decisionCritique: "Reasoning through the decision",
  formatOutput: "Finalizing report",
};

const STAGE_ORDER = Object.keys(STAGE_LABELS);

function initialStages() {
  return STAGE_ORDER.map((node) => ({
    node,
    label: STAGE_LABELS[node],
    status: "pending", // pending | active | done
  }));
}

/**
 * Owns the SSE connection to /api/research/stream and exposes
 * render-ready state: per-stage progress, the final report, and
 * any error/loading flags.
 */
export function useResearchStream() {
  const [stages, setStages] = useState(initialStages());
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const esRef = useRef(null);

  const start = useCallback((companyName) => {
    if (esRef.current) {
      esRef.current.close();
    }

    setStages(
      initialStages().map((s, i) => (i === 0 ? { ...s, status: "active" } : s))
    );
    setResult(null);
    setError(null);
    setIsRunning(true);

    const es = new EventSource(buildResearchStreamUrl(companyName));
    esRef.current = es;

    es.addEventListener("stage", (evt) => {
      const payload = JSON.parse(evt.data);
      setStages((prev) => {
        const idx = prev.findIndex((s) => s.node === payload.node);
        if (idx === -1) return prev;
        const next = [...prev];
        next[idx] = { ...next[idx], status: "done", data: payload.data };
        if (idx + 1 < next.length) {
          next[idx + 1] = { ...next[idx + 1], status: "active" };
        }
        return next;
      });
    });

    es.addEventListener("done", (evt) => {
      const payload = JSON.parse(evt.data);
      setResult(payload);
      setIsRunning(false);
      es.close();
    });

    es.addEventListener("error", (evt) => {
      let message = "Connection to the research agent was lost.";
      try {
        if (evt.data) message = JSON.parse(evt.data).message || message;
      } catch {
        // non-JSON error frame (e.g. native EventSource failure), keep default message
      }
      setError(message);
      setIsRunning(false);
      es.close();
    });
  }, []);

  return { stages, result, error, isRunning, start };
}
