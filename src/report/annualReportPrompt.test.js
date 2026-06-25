import { describe, expect, it } from "vitest";
import { buildAnnualReportMessages } from "./annualReportPrompt.js";

const paipanResult = {
  input: {
    birth_date: "1988-01-14",
    birth_time: "11:25",
    birth_place: "长春",
  },
  pillars: {
    year: { value: "丁卯" },
    month: { value: "癸丑" },
    day: { value: "戊辰", day_master: "戊" },
    hour: { value: "戊午" },
  },
  elements: { wood: 1, fire: 2, earth: 4, metal: 0, water: 1 },
};

describe("buildAnnualReportMessages", () => {
  it("builds guarded annual report messages from paipan JSON", () => {
    const messages = buildAnnualReportMessages(paipanResult);

    expect(messages).toHaveLength(2);
    expect(messages[0]).toMatchObject({ role: "system" });
    expect(messages[0].content).toContain("不承诺发财、复合、升职");
    expect(messages[0].content).toContain("文化参考和决策辅助");
    expect(messages[1].content).toContain("每月回看");
    expect(messages[1].content).toContain("不要每个月都说好");
    expect(messages[1]).toMatchObject({ role: "user" });
    expect(messages[1].content).toContain("今年运势解读");
    expect(messages[1].content).toContain('"birth_date": "1988-01-14"');
    expect(messages[1].content).toContain('"value": "戊辰"');
    expect(messages[1].content).toContain("Markdown");
  });

  it("supports simplified Chinese, traditional Chinese, and English report output", () => {
    const simplified = buildAnnualReportMessages(paipanResult, { language: "zh-CN" });
    const traditional = buildAnnualReportMessages(paipanResult, { language: "zh-TW" });
    const english = buildAnnualReportMessages(paipanResult, { language: "en" });

    expect(simplified[1].content).toContain("使用简体中文");
    expect(traditional[1].content).toContain("使用繁體中文");
    expect(english[1].content).toContain("Write the report in English");
  });
});
