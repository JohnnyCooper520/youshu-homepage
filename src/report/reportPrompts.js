import { buildAnnualReportMessages } from "./annualReportPrompt.js";
import { numberedRules, sharedSafetyRules, voiceRules } from "./promptRules.js";

const LANGUAGE_INSTRUCTIONS = {
  "zh-CN": {
    bazi: "使用简体中文。",
    question: "使用简体中文。",
  },
  "zh-TW": {
    bazi: "使用繁體中文，使用台港澳读者能自然理解的繁体表达。",
    question: "使用繁體中文，使用台港澳读者能自然理解的繁体表达。",
  },
  en: {
    bazi: "Write the report in English. Keep Bazi terms readable for a general English-speaking audience.",
    question: "Write the answer in English. Keep Bazi terms readable for a general English-speaking audience.",
  },
};

function languageInstruction(language, type) {
  return LANGUAGE_INSTRUCTIONS[language]?.[type] || LANGUAGE_INSTRUCTIONS["zh-CN"][type];
}

function fencedJson(value) {
  return `\`\`\`json\n${JSON.stringify(value, null, 2)}\n\`\`\``;
}

export function buildBaziReportMessages(paipanResult, { language = "zh-CN" } = {}) {
  return [
    {
      role: "system",
      content: [
        "你是「有数」的东方命理 AI 人生顾问。",
        "你基于确定性排盘结果，生成一份命盘报告。",
        "",
        "必须遵守：",
        numberedRules([...sharedSafetyRules, ...voiceRules]),
      ].join("\n"),
    },
    {
      role: "user",
      content: [
        "请生成「命盘报告」。",
        `- ${languageInstruction(language, "bazi")}`,
        "- 输出 Markdown。",
        "- 结构包含：开篇总断、命盘关键词、性格底色、用力方式、事业倾向、关系惯性、财务节奏、容易内耗处、行动建议。",
        "- 开篇总断必须 150-260 字，先给判断，再说原因。",
        "- 命盘关键词输出 3 个，每个关键词必须解释“这意味着什么”和“怎么用”。",
        "- 每一节必须给出可执行建议。",
        "- 少用术语；必要术语要翻译成人话。",
        "- 要具体，不要星座式模板话。",
        "",
        "排盘 JSON：",
        "",
        fencedJson(paipanResult),
      ].join("\n"),
    },
  ];
}

export function buildQuestionMessages(paipanResult, { language = "zh-CN", question = "", focus = "" } = {}) {
  return [
    {
      role: "system",
      content: [
        "你是「有数」的东方命理 AI 人生顾问。",
        "你基于确定性排盘结果回答用户的一件具体事。",
        "",
        "必须遵守：",
        numberedRules([...sharedSafetyRules, ...voiceRules]),
      ].join("\n"),
    },
    {
      role: "user",
      content: [
        "请回答用户的「问事解惑」。",
        `- ${languageInstruction(language, "question")}`,
        "- 输出 Markdown。",
        "- 结构包含：一句判断、这件事的趋势、风险边界、下一步建议、什么时候适合复盘。",
        "- 一句判断要鲜明，但必须避免“必然、一定、保证”。",
        "- 风险边界要告诉用户哪些信号出现时应该暂停。",
        "- 下一步建议必须包含 3 条以内的具体动作。",
        "- 口吻要稳，像命理老师把复杂事讲清楚。",
        "",
        `用户关注：${focus || "未填写"}`,
        `用户问题：${question || "未填写"}`,
        "",
        "排盘 JSON：",
        "",
        fencedJson(paipanResult),
      ].join("\n"),
    },
  ];
}

export function buildReportMessages(type, paipanResult, options = {}) {
  if (type === "annual") {
    return buildAnnualReportMessages(paipanResult, options);
  }
  if (type === "question") {
    return buildQuestionMessages(paipanResult, options);
  }
  return buildBaziReportMessages(paipanResult, options);
}
