import { StateGraph, START, END } from "@langchain/langgraph";
import { ResearchState } from "./state.js";
import { resolveCompanyNode } from "./nodes/resolveCompany.node.js";
import { parallelResearchNode } from "./nodes/parallelResearch.node.js";
import { synthesizeNode } from "./nodes/synthesize.node.js";
import { decisionCritiqueNode } from "./nodes/decisionCritique.node.js";
import { formatOutputNode } from "./nodes/formatOutput.node.js";

/**
 * Linear 5-stage pipeline:
 *   resolveCompany -> parallelResearch -> synthesize -> decisionCritique -> formatOutput
 *
 * "Parallel" research happens *inside* the parallelResearch node via
 * Promise.allSettled rather than as separate graph nodes fanning out -
 * this keeps the graph topology simple and the streaming progress
 * events mapped 1:1 to meaningful UI stages, while still getting the
 * concurrency benefit where it matters (three independent API calls).
 */
export function buildResearchGraph() {
  const graph = new StateGraph(ResearchState)
    .addNode("resolveCompany", resolveCompanyNode)
    .addNode("parallelResearch", parallelResearchNode)
    .addNode("synthesize", synthesizeNode)
    .addNode("decisionCritique", decisionCritiqueNode)
    .addNode("formatOutput", formatOutputNode)
    .addEdge(START, "resolveCompany")
    .addEdge("resolveCompany", "parallelResearch")
    .addEdge("parallelResearch", "synthesize")
    .addEdge("synthesize", "decisionCritique")
    .addEdge("decisionCritique", "formatOutput")
    .addEdge("formatOutput", END);

  return graph.compile();
}

export const STAGE_ORDER = [
  "resolveCompany",
  "parallelResearch",
  "synthesize",
  "decisionCritique",
  "formatOutput",
];
