import { tool } from "@langchain/core/tools";
import { z } from "zod";
import { config } from "../config/env.js";

const inputSchema = z.object({
  ticker: z.string().nullable().describe("Best-guess stock ticker, if known"),
  companyName: z.string().describe("Company name to look up"),
});

/**
 * Pulls company fundamentals (overview + latest quote) from Alpha Vantage.
 * Degrades gracefully (returns a `note` instead of throwing) when no
 * ticker could be resolved or the API key is missing, so a single
 * failed data source never takes down the whole graph run.
 */
export const fundamentalsTool = tool(
  async ({ ticker, companyName }) => {
    if (!config.alphaVantage.apiKey) {
      return {
        available: false,
        note: "ALPHA_VANTAGE_API_KEY not configured; skipping fundamentals lookup.",
      };
    }

    if (!ticker) {
      return {
        available: false,
        note: `No ticker could be resolved for "${companyName}"; skipping fundamentals lookup.`,
      };
    }

    const base = "https://www.alphavantage.co/query";
    const key = config.alphaVantage.apiKey;

    const [overviewRes, quoteRes] = await Promise.all([
      fetch(`${base}?function=OVERVIEW&symbol=${encodeURIComponent(ticker)}&apikey=${key}`),
      fetch(`${base}?function=GLOBAL_QUOTE&symbol=${encodeURIComponent(ticker)}&apikey=${key}`),
    ]);

    const overview = await overviewRes.json();
    const quote = await quoteRes.json();

    if (!overview || Object.keys(overview).length === 0 || overview.Note || overview.Information) {
      return {
        available: false,
        note: overview?.Note || overview?.Information || `No fundamentals data found for ticker ${ticker}.`,
      };
    }

    const globalQuote = quote?.["Global Quote"] || {};

    return {
      available: true,
      ticker,
      name: overview.Name,
      sector: overview.Sector,
      industry: overview.Industry,
      marketCap: overview.MarketCapitalization,
      peRatio: overview.PERatio,
      pegRatio: overview.PEGRatio,
      eps: overview.EPS,
      revenueTTM: overview.RevenueTTM,
      profitMargin: overview.ProfitMargin,
      operatingMarginTTM: overview.OperatingMarginTTM,
      returnOnEquityTTM: overview.ReturnOnEquityTTM,
      debtToEquity: overview.DebtToEquity ?? null,
      dividendYield: overview.DividendYield,
      fiftyTwoWeekHigh: overview["52WeekHigh"],
      fiftyTwoWeekLow: overview["52WeekLow"],
      latestPrice: globalQuote["05. price"] ?? null,
      latestChangePercent: globalQuote["10. change percent"] ?? null,
      source: `https://www.alphavantage.co/query?function=OVERVIEW&symbol=${ticker}`,
    };
  },
  {
    name: "get_company_fundamentals",
    description:
      "Fetches key financial fundamentals (valuation ratios, margins, market cap, latest price) for a public company from Alpha Vantage.",
    schema: inputSchema,
  }
);
