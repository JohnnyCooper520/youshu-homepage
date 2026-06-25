import { numberedRules, sharedSafetyRules, voiceRules } from "./promptRules.js";

const SYSTEM_PROMPT = [
  "你是「有数」的东方命理 AI 人生顾问。",
  "你的任务是基于确定性排盘结果，生成一份面向普通用户的「今年运势解读」。",
  "",
  "必须遵守：",
  numberedRules([...sharedSafetyRules, ...voiceRules]),
].join("\n");

const REPORT_REQUIREMENTS = [
  "请根据下面的排盘 JSON，生成一份「今年运势解读」报告。",
  "",
  "报告要求：",
  "- 从起盘日开始，向后看完整 12 个月，不按自然年切割。",
  "- 输出 Markdown。",
  "- 面向普通用户，少用术语；必要术语要翻译成人话。",
  "- 结构包含：开篇总断、年度关键词、未来 12 个月总览、月度节奏表、事业与学业、感情与关系、财务与消费、身心状态与风险提示、年度行动清单。",
  "- 未来 12 个月总览必须按：起盘当月、近三个月、未来半年、未来十二个月四段写。",
  "- 月度节奏表必须有 12 行；不要每个月都说好，也不要每个月都制造焦虑。",
  "- 每部分都要给出具体判断和行动建议。",
  "- 结尾必须给出每月回看的方式：用户每月回看什么、怎么判断该推进还是收束。",
  "- 结论可以鲜明，但不要绝对化，不要制造焦虑。",
].join("\n");

const LANGUAGE_INSTRUCTIONS = {
  "zh-CN": "使用简体中文。",
  "zh-TW": "使用繁體中文，使用台港澳读者能自然理解的繁体表达。",
  en: "Write the report in English. Keep Bazi terms readable for a general English-speaking audience.",
};

export function buildAnnualReportMessages(paipanResult, { language = "zh-CN" } = {}) {
  const languageInstruction = LANGUAGE_INSTRUCTIONS[language] || LANGUAGE_INSTRUCTIONS["zh-CN"];

  return [
    {
      role: "system",
      content: SYSTEM_PROMPT,
    },
    {
      role: "user",
      content: `${REPORT_REQUIREMENTS}\n- ${languageInstruction}\n\n排盘 JSON：\n\n\`\`\`json\n${JSON.stringify(
        paipanResult,
        null,
        2,
      )}\n\`\`\``,
    },
  ];
}
