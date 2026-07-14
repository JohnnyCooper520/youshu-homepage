import { createDeepSeekChat } from "../llm/deepseekClient.js";
import { generateReport } from "./generateReport.js";

export async function generateAnnualReport({
  paipanResult,
  createChat = createDeepSeekChat,
  model,
  temperature,
  maxTokens,
  language,
  coreProfile,
} = {}) {
  if (!paipanResult || typeof paipanResult !== "object") {
    throw new Error("paipanResult is required");
  }

  return generateReport({
    type: "annual",
    paipanResult,
    language,
    coreProfile,
    model,
    createChat: (options) =>
      createChat({
        ...options,
        temperature: temperature ?? options.temperature,
        maxTokens: maxTokens ?? options.maxTokens,
      }),
  });
}
