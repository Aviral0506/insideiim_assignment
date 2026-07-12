import { getLLM } from "../backend/src/services/llm.js";
import { z } from "zod";

const Schema = z.object({
  status: z.string(),
  modelUsed: z.string()
});

async function runTest() {
  console.log("Initializing test LLM...");
  try {
    const llm = getLLM({ temperature: 0 }).withStructuredOutput(Schema);
    console.log("Invoking model...");
    const res = await llm.invoke([
      ["system", "Respond with status 'success' and modelUsed 'gemini-2.5-flash-free' in JSON format."],
      ["human", "Hello!"]
    ]);
    console.log("Success! Output:", res);
  } catch (err) {
    console.error("Test failed! Error details:", err);
  }
}

runTest();
