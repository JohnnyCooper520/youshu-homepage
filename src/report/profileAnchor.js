export const reportPromptVersion = "report-v3";

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
  const qualityFlags = paipanResult?.quality_flags || {};

  if (qualityFlags.zi_hour_boundary) {
    const convention = paipanResult?.input?.zi_hour_convention === "midnight"
      ? "零点换日"
      : "子初换日";
    const alternate = paipanResult?.alternate_pillars?.pillars;
    const alternateValues = alternate
      ? [alternate.year?.value, alternate.month?.value, alternate.day?.value, alternate.hour?.value].filter(Boolean).join(" · ")
      : "未提供";

    lines.push(
      `晚子时校验：出生时间在23:00–23:59，本报告采用${convention}口径。另一口径盘面为：${alternateValues}。`,
      "该边界只可说明口径差异，不得把任一口径写成唯一事实；涉及日主、时干或据此展开的判断须使用当前固定盘面。",
    );
  }
  const previousProfile = trimText(coreProfile);

  if (previousProfile) {
    lines.push(`既有核心画像（只可补充、细化或说明例外，不可轻易推翻）：${previousProfile}`);
  } else {
    lines.push("尚无既有核心画像。请把本次报告中的稳定判断写得克制、可供后续报告继承。");
  }

  return lines.join("\n");
}
