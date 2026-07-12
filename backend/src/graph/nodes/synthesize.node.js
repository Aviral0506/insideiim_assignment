import { z } from "zod";
import { getLLM } from "../../services/llm.js";
import { logger } from "../../utils/logger.js";
import { buildSynthesisFallback } from "../../utils/llmFallbacks.js";
import { isGeminiQuotaError, isGeminiUnavailable, markGeminiUnavailable } from "../../utils/llmFallbacks.js";

const SynthesisSchema = z.object({
  keyMetrics: z.array(z.string()).describe("Notable financial metrics, each as a short standalone bullet"),
  strengths: z.array(z.string()).describe("Positive signals across fundamentals, news, and market position"),
  risks: z.array(z.string()).describe("Negative or concerning signals"),
  catalysts: z.array(z.string()).describe("Near-term events or trends that could move the investment thesis"),
  dataGaps: z.array(z.string()).describe("Important information that was unavailable or missing"),
  summary: z.string().describe("2-3 sentence plain-language synthesis of the overall picture"),
});

/**
 * Node: synthesize
 * Reads all three research slices and compresses them into one
 * structured intermediate summary. Explicitly surfaces `dataGaps` so
 * the decision node reasons about what it doesn't know instead of
 * silently filling gaps with assumptions.
 */
export async function synthesizeNode(state) {
  if (isGeminiUnavailable()) {
    return {
      ...buildSynthesisFallback(state),
      errors: ["Synthesis skipped because Gemini quota is unavailable."],
    };
  }

  try {
    const llm = getLLM({ temperature: 0.2 }).withStructuredOutput(SynthesisSchema, {
      name: "research_synthesis",
    });

    const result = await llm.invoke([
      [
        "system",
        "You are a buy-side equity research analyst. Given raw fundamentals, news, and market research about a company, synthesize it into a structured summary. Be specific and reference concrete numbers where available. If a research source was unavailable, note it under dataGaps rather than inventing data.",
      ],
      [
        "human",
        JSON.stringify(
          {
            company: state.resolvedEntity,
            fundamentals: state.fundamentals,
            news: state.news,
            market: state.market,
          },
          null,
          2
        ),
      ],
    ]);

    return { synthesis: result };
  } catch (err) {
    logger.error("synthesizeNode failed:", err);
    if (isGeminiQuotaError(err)) {
      markGeminiUnavailable();
    }

    const fallback = buildSynthesisFallback(state);
    return {
      ...fallback,
      errors: [`Synthesis failed: ${err.message}`],
    };
  }
}
