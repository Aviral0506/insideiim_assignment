import { Annotation } from "@langchain/langgraph";

const replaceReducer = (_existing, update) => update;
const appendReducer = (existing = [], update = []) => [...existing, ...update];

/**
 * Single source of truth for what flows through the graph.
 * Every node reads a slice of this and returns a partial update;
 * LangGraph merges updates in using each field's reducer.
 */
export const ResearchState = Annotation.Root({
  // Input
  companyName: Annotation({ reducer: replaceReducer, default: () => "" }),

  // Node 1: resolveCompany
  resolvedEntity: Annotation({ reducer: replaceReducer, default: () => null }),

  // Node 2: parallelResearch
  fundamentals: Annotation({ reducer: replaceReducer, default: () => null }),
  news: Annotation({ reducer: replaceReducer, default: () => null }),
  market: Annotation({ reducer: replaceReducer, default: () => null }),

  // Node 3: synthesize
  synthesis: Annotation({ reducer: replaceReducer, default: () => null }),

  // Node 4: decisionCritique
  decision: Annotation({ reducer: replaceReducer, default: () => null }),
  critique: Annotation({ reducer: replaceReducer, default: () => null }),

  // Node 5: formatOutput
  finalOutput: Annotation({ reducer: replaceReducer, default: () => null }),

  // Cross-cutting
  errors: Annotation({ reducer: appendReducer, default: () => [] }),
});
