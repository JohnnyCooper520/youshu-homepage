import { createDeepSeekChat } from "../llm/deepseekClient.js";
import { buildReportMessages } from "./reportPrompts.js";

const QUESTION_MAX_TOKENS = 1800;
const REPORT_MAX_TOKENS = 5200;

export function modelOptionsForReport(type) {
  return {
    temperature: type === "question" ? 0.68 : 0.72,
    maxTokens: type === "question" ? QUESTION_MAX_TOKENS : REPORT_MAX_TOKENS,
  };
}

export async function generateReport({
  type = "bazi",
  paipanResult,
  language = "zh-CN",
  question = "",
  focus = "",
  createChat = createDeepSeekChat,
  model,
} = {}) {
  if (!paipanResult || typeof paipanResult !== "object") {
    throw new Error("paipanResult is required");
  }
  if (type === "question" && !String(question || "").trim()) {
    throw new Error("question is required for question reports");
  }

  const messages = buildReportMessages(type, paipanResult, { language, question, focus });
  return createChat({
    model,
    messages,
    ...modelOptionsForReport(type),
  });
}
