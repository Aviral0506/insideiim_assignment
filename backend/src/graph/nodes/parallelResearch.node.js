import { fundamentalsTool } from "../../tools/financialData.tool.js";
import { newsSearchTool } from "../../tools/newsSearch.tool.js";
import { marketSearchTool } from "../../tools/marketSearch.tool.js";
import { withCache } from "../../services/cache.js";
import { logger } from "../../utils/logger.js";

function settle(result, label, errors) {
  if (result.status === "fulfilled") return result.value;
  logger.error(`${label} research failed:`, result.reason);
  errors.push(`${label} research failed: ${result.reason?.message || "unknown error"}`);
  return { available: false, note: `${label} research failed.`, items: [] };
}

/**
 * Node: parallelResearch
 * Fans out three independent tool calls concurrently (fundamentals,
 * news, market) instead of chaining them, since none depends on the
 * others' output. Each is cached and independently fault-tolerant:
 * one failing data source degrades the state rather than failing the
 * whole run.
 */
export async function parallelResearchNode(state) {
  const entity = state.resolvedEntity;
  const ticker = entity?.likelyTicker ?? null;
  const name = entity?.companyName || state.companyName;
  const errors = [];

  const [fundamentalsResult, newsResult, marketResult] = await Promise.allSettled([
    withCache(`fundamentals:${ticker || name}`, () =>
      fundamentalsTool.invoke({ ticker, companyName: name })
    ),
    withCache(`news:${name}`, () => newsSearchTool.invoke({ companyName: name })),
    withCache(`market:${name}`, () =>
      marketSearchTool.invoke({ companyName: name, sector: entity?.sector ?? null })
    ),
  ]);

  return {
    fundamentals: settle(fundamentalsResult, "Fundamentals", errors),
    news: settle(newsResult, "News", errors),
    market: settle(marketResult, "Market", errors),
    errors,
  };
}
