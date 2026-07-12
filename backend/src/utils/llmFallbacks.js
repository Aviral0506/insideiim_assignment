// Sticky-but-temporary circuit breaker: once Gemini returns a quota/rate-limit
// error, skip calling it for COOLDOWN_MS instead of retrying (and failing) on
// every subsequent request for the rest of the process lifetime.
const COOLDOWN_MS = 60_000;
let geminiUnavailableUntil = 0;

export function isGeminiUnavailable() {
  return Date.now() < geminiUnavailableUntil;
}

export function markGeminiUnavailable() {
  geminiUnavailableUntil = Date.now() + COOLDOWN_MS;
}

export function isGeminiQuotaError(err) {
  const message = `${err?.message ?? err ?? ""}`.toLowerCase();
  return (
    message.includes("429") ||
    message.includes("too many requests") ||
    message.includes("quota") ||
    message.includes("free_tier") ||
    message.includes("certificate") ||
    message.includes("cert_in_chain") ||
    message.includes("unauthorized") ||
    message.includes("api_key") ||
    message.includes("key is not valid")
  );
}

export function normalizeResolvedEntity(result, fallbackName) {
  const cleanText = (value) => {
    if (typeof value !== "string") return null;
    const trimmed = value.trim();
    return trimmed || null;
  };

  return {
    companyName: cleanText(result?.companyName) || fallbackName,
    likelyTicker: cleanText(result?.likelyTicker),
    exchange: cleanText(result?.exchange),
    sector: cleanText(result?.sector),
    isPublic: Boolean(result?.isPublic),
    notes:
      cleanText(result?.notes) ||
      "Resolved from the user input without additional model confidence details.",
  };
}

export function parseNumeric(value) {
  if (value == null) return null;
  const cleaned = `${value}`.replace(/[%,$,\s]/g, "");
  const parsed = Number.parseFloat(cleaned);
  return Number.isFinite(parsed) ? parsed : null;
}

export function buildSynthesisFallback(state) {
  const companyName = state.resolvedEntity?.companyName || state.companyName;
  const fundamentals = state.fundamentals || {};
  const newsItems = Array.isArray(state.news?.items) ? state.news.items : [];
  const marketItems = Array.isArray(state.market?.items) ? state.market.items : [];

  const keyMetrics = [];
  if (fundamentals.available) {
    if (fundamentals.latestPrice) keyMetrics.push(`Latest price: ${fundamentals.latestPrice}`);
    if (fundamentals.peRatio) keyMetrics.push(`P/E ratio: ${fundamentals.peRatio}`);
    if (fundamentals.returnOnEquityTTM)
      keyMetrics.push(`ROE: ${fundamentals.returnOnEquityTTM}`);
    if (fundamentals.revenueTTM) keyMetrics.push(`Revenue TTM: ${fundamentals.revenueTTM}`);
  }

  if (keyMetrics.length === 0) {
    keyMetrics.push("No reliable fundamentals data was returned.");
  }

  const strengths = [];
  if (fundamentals.available) {
    strengths.push("Fundamentals data was available for the company.");
  }
  if (newsItems.length > 0) {
    strengths.push(`Recent news coverage was collected from ${newsItems.length} articles.`);
  }
  if (marketItems.length > 0) {
    strengths.push(`Market research returned ${marketItems.length} reference items.`);
  }
  if (strengths.length === 0) {
    strengths.push("No clear positive signals were confirmed by the fallback analysis.");
  }

  const risks = [];
  if (state.errors?.length) {
    risks.push(...state.errors.slice(0, 4));
  }
  if (!fundamentals.available) {
    risks.push(fundamentals.note || "Fundamentals data was unavailable.");
  }
  if (newsItems.length === 0) {
    risks.push("No recent news items were returned.");
  }
  if (marketItems.length === 0) {
    risks.push("No market-position references were returned.");
  }

  const catalysts = [];
  for (const item of [...newsItems, ...marketItems].slice(0, 3)) {
    if (item?.title) catalysts.push(item.title);
  }
  if (catalysts.length === 0) {
    catalysts.push("Collect more validated market and news data before changing the thesis.");
  }

  const dataGaps = [];
  if (!fundamentals.available) dataGaps.push(fundamentals.note || "Fundamentals unavailable.");
  if (newsItems.length === 0) dataGaps.push("No news articles were returned.");
  if (marketItems.length === 0) dataGaps.push("No market-position references were returned.");
  if (state.errors?.length) dataGaps.push(...state.errors.slice(0, 3));

  return {
    synthesis: {
      keyMetrics,
      strengths,
      risks,
      catalysts,
      dataGaps,
      summary: `Fallback synthesis for ${companyName}. The agent gathered tool outputs, but model-generated synthesis was unavailable, so this summary is based on the available fundamentals, news, and market signals only.`,
    },
  };
}

export function buildDecisionFallback(state) {
  const companyName = state.resolvedEntity?.companyName || state.companyName;
  const fundamentals = state.fundamentals || {};
  const synthesis = state.synthesis || {};
  const newsItems = Array.isArray(state.news?.items) ? state.news.items : [];
  const marketItems = Array.isArray(state.market?.items) ? state.market.items : [];

  let score = 0;
  const reasoning = [];
  const risks = Array.isArray(synthesis.risks) ? [...synthesis.risks] : [];
  const catalysts = Array.isArray(synthesis.catalysts) ? [...synthesis.catalysts] : [];

  const peRatio = parseNumeric(fundamentals.peRatio);
  const roe = parseNumeric(fundamentals.returnOnEquityTTM);
  const latestChange = parseNumeric(fundamentals.latestChangePercent);

  if (fundamentals.available) {
    reasoning.push("Fundamentals data was available for the company.");
    score += 1;
  } else {
    reasoning.push("Fundamentals data was unavailable or incomplete.");
    score -= 1;
  }

  if (peRatio != null) {
    if (peRatio <= 25) {
      score += 1;
      reasoning.push(`P/E ratio of ${fundamentals.peRatio} looks manageable.`);
    } else if (peRatio >= 40) {
      score -= 1;
      risks.push(`High valuation: P/E ratio of ${fundamentals.peRatio}.`);
    }
  }

  if (roe != null) {
    if (roe >= 15) {
      score += 1;
      reasoning.push(`ROE of ${fundamentals.returnOnEquityTTM} suggests efficient capital use.`);
    } else if (roe < 8) {
      score -= 1;
      risks.push(`ROE of ${fundamentals.returnOnEquityTTM} is weak.`);
    }
  }

  if (latestChange != null) {
    if (latestChange > 0) {
      score += 1;
      reasoning.push(`Latest move of ${fundamentals.latestChangePercent} is positive.`);
    } else if (latestChange < 0) {
      score -= 1;
      risks.push(`Latest move of ${fundamentals.latestChangePercent} is negative.`);
    }
  }

  if (newsItems.length > 0) {
    score += 1;
    reasoning.push(`Recent news coverage is available (${newsItems.length} items).`);
  } else {
    score -= 1;
    risks.push("No recent news items were returned.");
  }

  if (marketItems.length > 0) {
    reasoning.push(`Market-position references were collected (${marketItems.length} items).`);
  } else {
    score -= 1;
    risks.push("No market-position references were returned.");
  }

  if (Array.isArray(state.errors) && state.errors.length > 0) {
    score -= 1;
    risks.push(...state.errors.slice(0, 3));
  }

  let decision = "Hold";
  if (score >= 3) decision = "Invest";
  else if (score <= -2) decision = "Pass";

  const confidence = Math.max(25, Math.min(80, 45 + Math.abs(score) * 8));

  return {
    decision: {
      decision,
      confidence,
      reasoning: reasoning.length > 0 ? reasoning : [`Fallback analysis for ${companyName}.`],
      risks: risks.length > 0 ? risks.slice(0, 6) : ["Insufficient data to support a stronger view."],
      catalysts:
        catalysts.length > 0
          ? catalysts.slice(0, 5)
          : ["Gather more reliable data before changing the stance."],
    },
    critique: {
      counterArguments: [
        "The fallback decision was computed from available signals rather than a model critique pass.",
        "Model-generated reflection was unavailable because Gemini quota was exhausted or the request failed.",
      ],
      verdict: "revised",
      finalDecision: decision,
      finalConfidence: confidence,
      finalReasoning: reasoning.length > 0 ? reasoning : [`Fallback analysis for ${companyName}.`],
    },
  };
}