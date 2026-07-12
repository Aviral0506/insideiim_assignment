import { z } from "zod";
import { getLLM } from "../../services/llm.js";
import { logger } from "../../utils/logger.js";
import {
  buildDecisionFallback,
  isGeminiQuotaError,
  isGeminiUnavailable,
  markGeminiUnavailable,
} from "../../utils/llmFallbacks.js";

const DecisionSchema = z.object({
  decision: z.enum(["Invest", "Pass", "Hold"]),
  confidence: z.number().min(0).max(100).describe("Confidence in this decision, 0-100"),
  reasoning: z.array(z.string()).describe("Bullet-point reasons supporting the decision"),
  risks: z.array(z.string()).describe("Key risks to this thesis"),
  catalysts: z.array(z.string()).describe("Key catalysts that could validate or break this thesis"),
});

const CritiqueSchema = z.object({
  counterArguments: z.array(z.string()).describe("The strongest arguments against the draft decision"),
  verdict: z.enum(["reinforced", "revised"]).describe(
    "Whether the critique reinforced the original decision or led to a revision"
  ),
  finalDecision: z.enum(["Invest", "Pass", "Hold"]),
  finalConfidence: z.number().min(0).max(100),
  finalReasoning: z.array(z.string()).describe("Final bullet-point reasoning after the critique pass"),
});

/**
 * Node: decisionCritique
 * Two sequential LLM calls rather than one:
 *   1. Draft an Invest/Pass/Hold decision from the synthesis.
 *   2. Argue the opposite case against that draft ("devil's advocate"),
 *      then either reinforce or revise it.
 * This reflection pattern reduces single-pass overconfidence and is
 * the main defense against a shallow, one-shot recommendation.
 */
export async function decisionCritiqueNode(state) {
  if (isGeminiUnavailable()) {
    return {
      ...buildDecisionFallback(state),
      errors: ["Decision/critique skipped because Gemini quota is unavailable."],
    };
  }

  try {
    const draftLlm = getLLM({ temperature: 0.3 }).withStructuredOutput(DecisionSchema, {
      name: "draft_decision",
    });

    const draft = await draftLlm.invoke([
      [
        "system",
        "You are a disciplined investment analyst. Based on the research synthesis provided, decide " +
          "whether to Invest, Pass, or Hold. Ground every reasoning bullet in a specific fact from the " +
          "synthesis - never invent numbers. If dataGaps materially affect confidence, say so explicitly.",
      ],
      ["human", JSON.stringify({ company: state.resolvedEntity, synthesis: state.synthesis }, null, 2)],
    ]);

    const critiqueLlm = getLLM({ temperature: 0.4 }).withStructuredOutput(CritiqueSchema, {
      name: "critique",
    });

    const critique = await critiqueLlm.invoke([
      [
        "system",
        "You are a skeptical devil's advocate reviewing another analyst's draft decision. Build the " +
          "strongest possible counter-case using the same research synthesis. Then decide whether the " +
          "original decision should stand ('reinforced') or change ('revised'), and give a final decision, " +
          "final confidence, and final reasoning that accounts for your critique.",
      ],
      [
        "human",
        JSON.stringify(
          { company: state.resolvedEntity, synthesis: state.synthesis, draftDecision: draft },
          null,
          2
        ),
      ],
    ]);

    return { decision: draft, critique };
  } catch (err) {
    logger.error("decisionCritiqueNode failed:", err);
    if (isGeminiQuotaError(err)) {
      markGeminiUnavailable();
    }

    const fallback = buildDecisionFallback(state);
    return {
      ...fallback,
      errors: [`Decision/critique failed: ${err.message}`],
    };
  }
}
