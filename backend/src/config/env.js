import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

function required(name, fallback = undefined) {
  const value = process.env[name] ?? fallback;
  if (value === undefined) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export const config = {
  port: Number(process.env.PORT || 5001),
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",

  google: {
    apiKey: required("GOOGLE_API_KEY"),
    model: process.env.GEMINI_MODEL || "gemini-2.0-flash",
  },

  tavily: {
    apiKey: process.env.TAVILY_API_KEY || null,
  },

  alphaVantage: {
    apiKey: process.env.ALPHA_VANTAGE_API_KEY || null,
  },

  cache: {
    ttlMs: Number(process.env.CACHE_TTL_MS || 10 * 60 * 1000),
  },
};
