import { z } from "zod";
import { getLLM } from "../../services/llm.js";
import { logger } from "../../utils/logger.js";
import {
  isGeminiQuotaError,
  isGeminiUnavailable,
  markGeminiUnavailable,
  normalizeResolvedEntity,
} from "../../utils/llmFallbacks.js";

const ResolvedEntitySchema = z.object({
  companyName: z.string().describe("Clean, canonical company name"),
  likelyTicker: z
    .string()
    .describe("Most likely public stock ticker symbol, or an empty string if unsure/private"),
  exchange: z.string().describe("Primary exchange, e.g. NASDAQ, NSE, BSE, or an empty string"),
  sector: z.string().describe("Primary business sector, or an empty string"),
  isPublic: z.boolean().describe("Whether this company appears to be publicly traded"),
  notes: z.string().describe("Any disambiguation notes, e.g. why this match was chosen"),
});

/**
 * Node: resolveCompany
 * Turns a possibly-informal user input ("apple", "reliance") into a
 * canonical name + best-guess ticker. Deliberately conservative: if the
 * model isn't confident about the ticker, it returns null rather than
 * guessing wrong, since a wrong ticker silently poisons every downstream
 * node. Ambiguous names are resolved to the single most likely match
 * and the assumption is recorded in `notes` rather than blocking the run.
 */
export async function resolveCompanyNode(state) {
  if (isGeminiUnavailable()) {
    return {
      resolvedEntity: {
        companyName: state.companyName,
        likelyTicker: null,
        exchange: null,
        sector: null,
        isPublic: false,
        notes: "Gemini is currently unavailable; proceeding with the raw input name.",
      },
      errors: ["Company resolution skipped because Gemini quota is unavailable."],
    };
  }

  try {
    const llm = getLLM({ temperature: 0 }).withStructuredOutput(ResolvedEntitySchema, {
      name: "resolved_entity",
    });

    const result = await llm.invoke([
      [
        "system",
        "You resolve a possibly informal or ambiguous company name into a clean company name, " +
          "its most likely public stock ticker and exchange, and its primary sector. " +
          "If multiple companies could match, pick the most prominent one and explain the assumption in `notes`. " +
          "If you are not confident about the ticker, set likelyTicker to null instead of guessing.",
      ],
      ["human", `Company name as provided by the user: "${state.companyName}"`],
    ]);

    return { resolvedEntity: normalizeResolvedEntity(result, state.companyName) };
  } catch (err) {
    logger.error("resolveCompanyNode failed:", err);
    if (isGeminiQuotaError(err)) {
      markGeminiUnavailable();
    }

    const fallbackMessage = isGeminiQuotaError(err)
      ? "Gemini quota was exhausted; proceeding with the raw input name."
      : "Automatic resolution failed; proceeding with the raw input name.";

    return {
      resolvedEntity: {
        companyName: state.companyName,
        likelyTicker: null,
        exchange: null,
        sector: null,
        isPublic: false,
        notes: fallbackMessage,
      },
      errors: [`Company resolution failed: ${err.message}`],
    };
  }
}
