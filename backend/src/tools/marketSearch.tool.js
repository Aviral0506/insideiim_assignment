import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { config } from "../config/env.js";

const inputSchema = z.object({
  companyName: z.string().describe("Company name to research market position for"),
  sector: z.string().nullable().describe("Sector/industry, if known"),
});

async function tavilySearch(query, { maxResults = 6 } = {}) {
  const res = await fetch("https://api.tavily.com/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      api_key: config.tavily.apiKey,
      query,
      search_depth: "advanced",
      max_results: maxResults,
      include_answer: false,
    }),
  });

  if (!res.ok) {
    throw new Error(`Tavily search failed with status ${res.status}`);
  }

  return res.json();
}

/**
 * Competitive landscape and market-position signals: main competitors,
 * market share narrative, industry tailwinds/headwinds.
 */
export const marketSearchTool = tool(
  async ({ companyName, sector }) => {
    if (!config.tavily.apiKey) {
      return {
        available: false,
        note: "TAVILY_API_KEY not configured; skipping market research.",
        items: [],
      };
    }

    const sectorHint = sector ? ` in the ${sector} sector` : "";
    const data = await tavilySearch(
      `${companyName} competitors market share industry outlook${sectorHint}`,
      { maxResults: 6 }
    );

    const items = (data.results || []).map((r) => ({
      title: r.title,
      url: r.url,
      snippet: r.content?.slice(0, 400) ?? "",
      score: r.score,
    }));

    return { available: true, items };
  },
  {
    name: "search_market_position",
    description:
      "Searches the web for a company's competitive landscape, market share narrative, and industry outlook.",
    schema: inputSchema,
  }
);
