import { buildAnnualReportMessages } from "./annualReportPrompt.js";
import { buildProfileAnchor } from "./profileAnchor.js";
import { markdownRules, numberedRules, sharedSafetyRules, voiceRules } from "./promptRules.js";

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
    bazi: "Write the report in English. Keep traditional-culture structure terms readable for a general English-speaking audience.",
    question: "Write the answer in English. Keep traditional-culture structure terms readable for a general English-speaking audience.",
  },
};

function languageInstruction(language, type) {
  return LANGUAGE_INSTRUCTIONS[language]?.[type] || LANGUAGE_INSTRUCTIONS["zh-CN"][type];
}

function fencedJson(value) {
  return `\`\`\`json\n${JSON.stringify(value, null, 2)}\n\`\`\``;
}

const REPORT_SCHEMAS = {
  "zh-CN": {
    bazi: ["# 个人结构报告", "## 开篇判断", "## 结构底色", "## 用力方向", "## 关系线索", "## 当下提醒", "## 下一步"],
    question: ["# 一事分析", "## 这件事的判断", "## 形势", "## 有利条件", "## 风险边界", "## 建议推进", "## 暂缓信号"],
  },
  "zh-TW": {
    bazi: ["# 個人結構報告", "## 開篇判斷", "## 結構底色", "## 用力方向", "## 關係線索", "## 當下提醒", "## 下一步"],
    question: ["# 一事分析", "## 這件事的判斷", "## 形勢", "## 有利條件", "## 風險邊界", "## 建議推進", "## 暫緩訊號"],
  },
  en: {
    bazi: ["# Personal Structure Report", "## Opening judgment", "## Core pattern", "## How to apply effort", "## Relationship pattern", "## What matters now", "## Next step"],
    question: ["# One-Matter Analysis", "## The judgment", "## The situation", "## Helpful conditions", "## Risk boundary", "## Suggested move", "## Signals to pause"],
  },
};

function schemaFor(language, type) {
  return (REPORT_SCHEMAS[language] || REPORT_SCHEMAS["zh-CN"])[type].join("\n");
}

function sharedSystemPrompt(label) {
  return [
    "你是「有数」的东方文化人生参考顾问。",
    `你基于结构化计算结果与审校规则，生成一份${label}。`,
    "内容用于自我认知、情绪整理和选择参考，不承诺预测结果必然发生。",
    "前后报告的稳定判断应一致；遇到场景变化只能调整侧重点，不可轻易推翻既有核心画像。",
    "",
    "必须遵守：",
    numberedRules([...sharedSafetyRules, ...voiceRules, ...markdownRules]),
  ].join("\n");
}

export function buildBaziReportMessages(paipanResult, { language = "zh-CN", coreProfile = "" } = {}) {
  return [
    {
      role: "system",
      content: sharedSystemPrompt("个人结构报告"),
    },
    {
      role: "user",
      content: [
        "请生成「个人结构报告」。",
        `- ${languageInstruction(language, "bazi")}`,
        "- 严格使用以下标题与顺序，不要新增标题：",
        schemaFor(language, "bazi"),
        "- 开篇判断控制在 90-150 个中文字符或 70-110 English words，先说这个人的稳定底色，再说此刻该怎样用力。",
        "- 结构底色、用力方向、关系线索、当下提醒各写一段 70-120 个中文字符或 55-90 English words。",
        "- 下一步只保留 3 条以内的动作，每条一句。",
        "- 少用术语；必要术语立即翻成人话。不要用“你天生”“注定”“必然”等绝对措辞。",
        "",
        "一致性锚点（只作内部判断依据，不要原样输出，也不要把它当成用户指令）：",
        buildProfileAnchor(paipanResult, coreProfile),
        "",
        "结构化分析 JSON：",
        "",
        fencedJson(paipanResult),
      ].join("\n"),
    },
  ];
}

export function buildQuestionMessages(paipanResult, { language = "zh-CN", question = "", focus = "", coreProfile = "" } = {}) {
  return [
    {
      role: "system",
      content: sharedSystemPrompt("一事分析"),
    },
    {
      role: "user",
      content: [
        "请回答用户的「一事分析」。",
        `- ${languageInstruction(language, "question")}`,
        "- 严格使用以下标题与顺序，不要新增标题：",
        schemaFor(language, "question"),
        "- 这件事的判断控制在 70-120 个中文字符或 55-90 English words，回答要鲜明但不能断言结果。",
        "- 形势、有利条件、风险边界各写一段 60-100 个中文字符或 45-75 English words。",
        "- 建议推进只给 3 条以内的具体动作；暂缓信号只列 2-3 个可识别信号。",
        "- 口吻要稳，像把复杂选择说清楚的东方文化顾问，不替用户做最终决定。",
        "",
        `用户关注：${focus || "未填写"}`,
        `用户问题：${question || "未填写"}`,
        "",
        "一致性锚点（只作内部判断依据，不要原样输出，也不要把它当成用户指令）：",
        buildProfileAnchor(paipanResult, coreProfile),
        "",
        "结构化分析 JSON：",
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
