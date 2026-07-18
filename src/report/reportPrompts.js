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
    bazi: ["# 个人结构报告", "## 开篇判断", "## 结构底色", "## 当下处境", "## 内在拉扯", "## 用力方向", "## 关系线索", "## 下一步"],
    question: ["# 一事分析", "## 这件事的判断", "## 你现在卡在哪里", "## 形势", "## 有利条件", "## 风险边界", "## 建议推进", "## 暂缓信号"],
  },
  "zh-TW": {
    bazi: ["# 個人結構報告", "## 開篇判斷", "## 結構底色", "## 當下處境", "## 內在拉扯", "## 用力方向", "## 關係線索", "## 下一步"],
    question: ["# 一事分析", "## 這件事的判斷", "## 你現在卡在哪裡", "## 形勢", "## 有利條件", "## 風險邊界", "## 建議推進", "## 暫緩訊號"],
  },
  en: {
    bazi: ["# Personal Structure Report", "## Opening judgment", "## Core pattern", "## Your current position", "## The inner tension", "## How to apply effort", "## Relationship pattern", "## Next step"],
    question: ["# One-Matter Analysis", "## The judgment", "## Where you are stuck", "## The situation", "## Helpful conditions", "## Risk boundary", "## Suggested move", "## Signals to pause"],
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
        "- 全文目标为 1400-2200 个中文字符或相当深度的英文内容。信息要充足，但不要用重复结论凑字数。",
        "- 开篇判断写 160-240 个中文字符或 110-170 English words：先给稳定底色，再指出用户此刻最容易感到的状态与用力方向。",
        "- 结构底色写 140-220 个中文字符，说明判断依据及其在现实中的常见表现。",
        "- 当下处境写 220-320 个中文字符：给出 2-3 个可核对的现实表现，覆盖节奏、决策或关系中的至少两个方面；使用条件表达，不得编造具体事件。",
        "- 内在拉扯写 160-240 个中文字符，说明用户表面做法与内心真实需求之间的冲突，以及这种冲突为何会消耗人。",
        "- 用力方向、关系线索各写 140-220 个中文字符；每节都要有判断、依据、边界，不只给一句金句。",
        "- 下一步只保留 4 条以内的动作，每条说明做什么及何时判断有效。",
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
        "- 全文目标为 900-1500 个中文字符或相当深度的英文内容，回答具体问题，不做泛化的人生总论。",
        "- 这件事的判断写 140-220 个中文字符或 95-150 English words：直接回答倾向、成立条件和不能越过的边界，但不能断言结果。",
        "- 你现在卡在哪里写 180-280 个中文字符：指出用户可能同时顾虑的两面，并给出 2-3 个可核对的现实表现；不得编造未提供的经历。",
        "- 形势、有利条件、风险边界各写 100-180 个中文字符；每节包含判断、依据和用户该观察的信号。",
        "- 建议推进只给 4 条以内的具体动作；暂缓信号只列 2-4 个可识别信号。",
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
