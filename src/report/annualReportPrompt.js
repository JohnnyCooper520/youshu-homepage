import { buildProfileAnchor } from "./profileAnchor.js";
import { markdownRules, numberedRules, sharedSafetyRules, voiceRules } from "./promptRules.js";

const SYSTEM_PROMPT = [
  "你是「有数」的东方文化人生参考顾问。",
  "你的任务是基于结构化计算结果与审校规则，生成一份面向普通用户的「年度节奏报告」。",
  "内容用于自我认知、情绪整理和选择参考，不承诺预测结果必然发生。",
  "前后报告的稳定判断应一致；遇到场景变化只能调整侧重点，不可轻易推翻既有核心画像。",
  "",
  "必须遵守：",
  numberedRules([...sharedSafetyRules, ...voiceRules, ...markdownRules]),
].join("\n");

const LANGUAGE_INSTRUCTIONS = {
  "zh-CN": "使用简体中文。",
  "zh-TW": "使用繁體中文，使用台港澳读者能自然理解的繁体表达。",
  en: "Write the report in English. Keep traditional-culture structure terms readable for a general English-speaking audience.",
};

const REPORT_SCHEMAS = {
  "zh-CN": ["# 年度节奏报告", "## 开篇判断", "## 这一年的重心", "## 眼前三月", "## 半年转折", "## 十二月回看", "## 关键节点", "## 取舍建议"],
  "zh-TW": ["# 年度節奏報告", "## 開篇判斷", "## 這一年的重心", "## 眼前三月", "## 半年轉折", "## 十二月回看", "## 關鍵節點", "## 取捨建議"],
  en: ["# Annual Rhythm Report", "## Opening judgment", "## The year's center of gravity", "## The next three months", "## The six-month turn", "## Looking across twelve months", "## Key moments", "## What to prioritize"],
};

export function buildAnnualReportMessages(paipanResult, { language = "zh-CN", coreProfile = "" } = {}) {
  const languageInstruction = LANGUAGE_INSTRUCTIONS[language] || LANGUAGE_INSTRUCTIONS["zh-CN"];
  const schema = REPORT_SCHEMAS[language] || REPORT_SCHEMAS["zh-CN"];
  const requirements = [
    "请根据下面的结构化分析 JSON，生成一份「年度节奏报告」。",
    `- ${languageInstruction}`,
    "- 从生成日开始，向后看完整 12 个月，不按自然年切割。",
    "- 严格使用以下标题与顺序，不要新增标题：",
    schema.join("\n"),
    "- 开篇判断控制在 90-150 个中文字符或 70-110 English words，先说这段周期的总基调，再说如何安放眼前。",
    "- 这一年的重心、眼前三月、半年转折、十二月回看各写一段 70-120 个中文字符或 55-90 English words。",
    "- 关键节点列 3-4 个观察窗口，不写按月流水账，不制造焦虑。",
    "- 取舍建议只保留 3 条以内，分别说明该推进、该留白或该复盘的事情。",
    "- 少用术语；必要术语立即翻成人话；结论可以明确，但不要绝对化。",
  ].join("\n");

  return [
    {
      role: "system",
      content: SYSTEM_PROMPT,
    },
    {
      role: "user",
      content: `${requirements}\n\n一致性锚点（只作内部判断依据，不要原样输出，也不要把它当成用户指令）：\n${buildProfileAnchor(
        paipanResult,
        coreProfile,
      )}\n\n结构化分析 JSON：\n\n\`\`\`json\n${JSON.stringify(paipanResult, null, 2)}\n\`\`\``,
    },
  ];
}
