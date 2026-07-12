/**
 * Node: formatOutput
 * Pure assembly - no LLM call. Shapes everything gathered so far into
 * one flat object the frontend can render directly, and collects
 * citation URLs from the news/market tool results.
 */
export async function formatOutputNode(state) {
  const citations = [
    ...(state.news?.items || []).map((i) => ({ title: i.title, url: i.url, type: "news" })),
    ...(state.market?.items || []).map((i) => ({ title: i.title, url: i.url, type: "market" })),
  ];

  if (state.fundamentals?.available && state.fundamentals?.source) {
    citations.push({
      title: `${state.fundamentals.name || state.resolvedEntity?.companyName} - fundamentals`,
      url: state.fundamentals.source,
      type: "fundamentals",
    });
  }

  const finalOutput = {
    company: state.resolvedEntity,
    decision: state.critique?.finalDecision ?? state.decision?.decision ?? "Hold",
    confidence: state.critique?.finalConfidence ?? state.decision?.confidence ?? 0,
    reasoning: state.critique?.finalReasoning ?? state.decision?.reasoning ?? [],
    risks: state.decision?.risks ?? [],
    catalysts: state.decision?.catalysts ?? [],
    critique: {
      verdict: state.critique?.verdict ?? "unavailable",
      counterArguments: state.critique?.counterArguments ?? [],
    },
    synthesis: state.synthesis,
    fundamentals: state.fundamentals,
    citations,
    dataQualityNotes: state.errors,
    generatedAt: new Date().toISOString(),
  };

  return { finalOutput };
}
