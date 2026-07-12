// Trigger nodemon restart to reload .env configuration
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

import { setGlobalDispatcher, Agent } from "undici";
setGlobalDispatcher(new Agent({ connect: { rejectUnauthorized: false } }));

import express from "express";
import cors from "cors";
import { config } from "./config/env.js";
import researchRoutes from "./routes/research.routes.js";
import { logger } from "./utils/logger.js";

const app = express();

const allowedOrigins = config.corsOrigin
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin(origin, callback) {
      if (!origin) {
        callback(null, true);
        return;
      }

      const isExplicitlyAllowed = allowedOrigins.includes(origin);
      const isLocalDevelopmentOrigin = /^http:\/\/(localhost|127\.0\.0\.1):\d+$/.test(origin);

      if (isExplicitlyAllowed || isLocalDevelopmentOrigin) {
        callback(null, true);
        return;
      }

      callback(new Error(`CORS blocked origin: ${origin}`));
    },
  })
);
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

app.use("/api/research", researchRoutes);

app.use((err, _req, res, _next) => {
  logger.error("Unhandled error:", err);
  res.status(500).json({ error: "Internal server error" });
});

app.listen(config.port, () => {
  logger.info(`Investment Research Agent backend listening on port ${config.port}`);
});
