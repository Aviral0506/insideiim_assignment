import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { config } from "../config/env.js";

const inputSchema = z.object({
  companyName: z.string().describe("Company name to search recent news for"),
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
 * Recent news headlines relevant to investment sentiment: earnings,
 * lawsuits, leadership changes, product launches, controversies.
 */
export const newsSearchTool = tool(
  async ({ companyName }) => {
    if (!config.tavily.apiKey) {
      return {
        available: false,
        note: "TAVILY_API_KEY not configured; skipping news search.",
        items: [],
      };
    }

    const data = await tavilySearch(
      `${companyName} recent news earnings controversy leadership 2026`,
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
    name: "search_company_news",
    description:
      "Searches the web for recent news relevant to investment sentiment about a company: earnings, controversies, leadership changes, launches.",
    schema: inputSchema,
  }
);
