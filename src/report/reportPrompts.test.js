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
  it("builds a personal structure report framework with product-specific sections and safety rules", () => {
    const messages = buildBaziReportMessages(paipanResult, { language: "zh-CN" });
    const joined = messages.map((message) => message.content).join("\n");

    expect(joined).toContain("个人结构报告");
    expect(joined).toContain("开篇判断");
    expect(joined).toContain("结构底色");
    expect(joined).toContain("下一步只保留 3 条以内");
    expect(joined).toContain("不承诺发财、复合、升职");
    expect(joined).toContain("一致性锚点");
    expect(joined).toContain('"value": "戊辰"');
  });

  it("builds an annual rhythm report framework around a few useful windows", () => {
    const messages = buildReportMessages("annual", paipanResult, { language: "zh-TW" });
    const joined = messages.map((message) => message.content).join("\n");

    expect(joined).toContain("年度节奏报告");
    expect(joined).toContain("眼前三月");
    expect(joined).toContain("半年转折");
    expect(joined).toContain("十二月回看");
    expect(joined).toContain("不写按月流水账");
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
    expect(joined).toContain("The judgment");
    expect(joined).toContain("Risk boundary");
    expect(joined).toContain("不替用户做绝对决定");
    expect(joined).toContain("Write the answer in English");
  });
});
