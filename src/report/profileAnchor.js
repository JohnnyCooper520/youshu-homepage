export const reportPromptVersion = "report-v2";

const elementLabels = {
  wood: "木",
  fire: "火",
  earth: "土",
  metal: "金",
  water: "水",
};

function trimText(value, limit = 900) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, limit);
}

function elementSummary(elements = {}) {
  return Object.entries(elementLabels)
    .map(([key, label]) => `${label}${Number(elements[key] || 0)}`)
    .join("、");
}

export function buildProfileAnchor(paipanResult, coreProfile = "") {
  const pillars = paipanResult?.pillars || {};
  const values = [pillars.year?.value, pillars.month?.value, pillars.day?.value, pillars.hour?.value].filter(Boolean);
  const lines = [
    `固定盘面标识：${values.join(" · ") || "未完整提供"}`,
    `日主：${pillars.day?.day_master || "未提供"}`,
    `五行计数：${elementSummary(paipanResult?.elements)}`,
  ];
  const previousProfile = trimText(coreProfile);

  if (previousProfile) {
    lines.push(`既有核心画像（只可补充、细化或说明例外，不可轻易推翻）：${previousProfile}`);
  } else {
    lines.push("尚无既有核心画像。请把本次报告中的稳定判断写得克制、可供后续报告继承。");
  }

  return lines.join("\n");
}
