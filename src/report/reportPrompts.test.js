import { describe, expect, it } from "vitest";
import { buildBaziReportMessages, buildQuestionMessages, buildReportMessages } from "./reportPrompts.js";

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

describe("reportPrompts", () => {
  it("builds a bazi report framework with product-specific sections and safety rules", () => {
    const messages = buildBaziReportMessages(paipanResult, { language: "zh-CN" });
    const joined = messages.map((message) => message.content).join("\n");

    expect(joined).toContain("命盘报告");
    expect(joined).toContain("开篇总断");
    expect(joined).toContain("性格底色");
    expect(joined).toContain("不承诺发财、复合、升职");
    expect(joined).toContain("每一节必须给出可执行建议");
    expect(joined).toContain('"value": "戊辰"');
  });

  it("builds an annual outlook framework with twelve-month rhythm and review cadence", () => {
    const messages = buildReportMessages("annual", paipanResult, { language: "zh-TW" });
    const joined = messages.map((message) => message.content).join("\n");

    expect(joined).toContain("今年运势解读");
    expect(joined).toContain("未来 12 个月总览");
    expect(joined).toContain("月度节奏表");
    expect(joined).toContain("每月回看");
    expect(joined).toContain("使用繁體中文");
  });

  it("builds a question framework that answers the concrete question without overpromising", () => {
    const messages = buildQuestionMessages(paipanResult, {
      language: "en",
      focus: "Career",
      question: "Should I change jobs?",
    });
    const joined = messages.map((message) => message.content).join("\n");

    expect(joined).toContain("Should I change jobs?");
    expect(joined).toContain("一句判断");
    expect(joined).toContain("风险边界");
    expect(joined).toContain("不替用户做绝对决定");
    expect(joined).toContain("Write the answer in English");
  });
});
