import { createDeepSeekChat } from "../llm/deepseekClient.js";
import { buildReportMessages } from "./reportPrompts.js";

const QUESTION_MAX_TOKENS = 1400;
const BAZI_MAX_TOKENS = 2200;
const ANNUAL_MAX_TOKENS = 2600;

export function modelOptionsForReport(type) {
  const maxTokens = type === "question" ? QUESTION_MAX_TOKENS : type === "annual" ? ANNUAL_MAX_TOKENS : BAZI_MAX_TOKENS;

  return {
    temperature: 0.58,
    maxTokens,
  };
}

export async function generateReport({
  type = "bazi",
  paipanResult,
  language = "zh-CN",
  question = "",
  focus = "",
  coreProfile = "",
  createChat = createDeepSeekChat,
  model,
} = {}) {
  if (!paipanResult || typeof paipanResult !== "object") {
    throw new Error("paipanResult is required");
  }
  if (type === "question" && !String(question || "").trim()) {
    throw new Error("question is required for question reports");
  }

  const messages = buildReportMessages(type, paipanResult, { language, question, focus, coreProfile });
  return createChat({
    model,
    messages,
    ...modelOptionsForReport(type),
  });
}
