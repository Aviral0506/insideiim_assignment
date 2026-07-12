import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatOpenAI } from "@langchain/openai";
import { config } from "../config/env.js";

/**
 * Returns a fresh Gemini chat model instance. Kept as a factory
 * (rather than a singleton) so individual nodes can override
 * temperature/model per call without mutating shared state.
 *
 * Supports routing to OpenRouter (using ChatOpenAI targeting OpenRouter's URL)
 * or native Google Gemini API depending on the key format and model identifier.
 */
export function getLLM(overrides = {}) {
  const modelName = overrides.model || config.google.model;
  const apiKey = config.google.apiKey;
  const temp = overrides.temperature ?? 0.2;

  // If the model name has a provider prefix (e.g. google/gemini-2.0-flash:free)
  // or the API key matches standard OpenAI/OpenRouter shapes, routing to OpenRouter
  const isOpenRouter = 
    (apiKey && (apiKey.startsWith("sk-or-") || apiKey.startsWith("sk-"))) || 
    modelName.includes("/");

  if (isOpenRouter) {
    return new ChatOpenAI({
      apiKey: apiKey,
      model: modelName,
      temperature: temp,
      configuration: {
        baseURL: "https://openrouter.ai/api/v1",
      },
      maxRetries: 0,
    });
  }

  // Native Google Gemini API setup
  return new ChatGoogleGenerativeAI({
    apiKey: apiKey,
    model: modelName,
    temperature: temp,
    maxRetries: 0,
  });
}
