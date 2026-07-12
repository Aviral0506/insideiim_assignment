import { buildResearchGraph } from "../graph/graph.js";
import { createSseChannel } from "../utils/sse.js";
import { logger } from "../utils/logger.js";

const graph = buildResearchGraph();

/**
 * GET /api/research/stream?company=...
 *
 * Runs the LangGraph agent and streams a "stage" SSE event after each
 * node completes (via streamMode: "updates"), then a final "done"
 * event with the assembled report. EventSource only supports GET, so
 * the whole run happens inside this one request/response instead of
 * a separate start+poll job store.
 */
export async function streamResearch(req, res) {
  const companyName = (req.query.company || "").toString().trim();

  if (!companyName) {
    res.status(400).json({ error: "Query parameter 'company' is required." });
    return;
  }

  const { send, close } = createSseChannel(res);
  req.on("close", () => close());

  try {
    send("start", { companyName });

    const stream = await graph.stream(
      { companyName, errors: [] },
      { streamMode: "updates" }
    );

    for await (const chunk of stream) {
      // chunk shape: { [nodeName]: partialStateUpdate }
      const [nodeName, update] = Object.entries(chunk)[0];
      send("stage", { node: nodeName, data: update });

      if (nodeName === "formatOutput" && update?.finalOutput) {
        send("done", update.finalOutput);
      }
    }

    close();
  } catch (err) {
    logger.error("streamResearch failed:", err);
    send("error", { message: err.message || "The research agent failed unexpectedly." });
    close();
  }
}
