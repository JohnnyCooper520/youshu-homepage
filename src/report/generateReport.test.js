import { describe, expect, it, vi } from "vitest";
import { generateReport, modelOptionsForReport } from "./generateReport.js";

const paipanResult = {
  input: { birth_date: "1988-01-14", birth_time: "11:25", birth_place: "长春" },
  pillars: {
    year: { value: "丁卯" },
    month: { value: "癸丑" },
    day: { value: "戊辰", day_master: "戊" },
    hour: { value: "戊午" },
  },
};

describe("generateReport", () => {
  it("routes bazi, annual, and question reports through the same chat client", async () => {
    const createChat = vi.fn().mockResolvedValue({ content: "ok", usage: {} });

    await generateReport({ type: "bazi", paipanResult, createChat });
    await generateReport({ type: "annual", paipanResult, language: "zh-TW", focus: "事業機會", createChat });
    await generateReport({
      type: "question",
      paipanResult,
      language: "en",
      question: "Should I change jobs?",
      createChat,
    });

    expect(createChat.mock.calls[0][0].messages[1].content).toContain("个人结构报告");
    expect(createChat.mock.calls[1][0].messages[1].content).toContain("年度节奏报告");
    expect(createChat.mock.calls[1][0].messages[1].content).toContain("使用繁體中文");
    expect(createChat.mock.calls[1][0].messages[1].content).toContain("事業機會");
    expect(createChat.mock.calls[2][0].messages[1].content).toContain("Should I change jobs?");
    expect(createChat.mock.calls[2][0].messages[1].content).toContain("Write the answer in English");
  });

  it("reserves enough generation space for contextual reports", () => {
    expect(modelOptionsForReport("question")).toEqual({ temperature: 0.58, maxTokens: 2200 });
    expect(modelOptionsForReport("bazi")).toEqual({ temperature: 0.58, maxTokens: 3000 });
    expect(modelOptionsForReport("annual")).toEqual({ temperature: 0.58, maxTokens: 3600 });
  });

  it("uses a saved core profile as an internal consistency anchor", async () => {
    const createChat = vi.fn().mockResolvedValue({ content: "ok", usage: {} });

    await generateReport({
      type: "question",
      paipanResult,
      question: "Should I change jobs?",
      coreProfile: "结构底色：稳住节奏，比急着证明自己更有用。",
      createChat,
    });

    expect(createChat.mock.calls[0][0].messages[1].content).toContain("既有核心画像");
    expect(createChat.mock.calls[0][0].messages[1].content).toContain("稳住节奏");
  });

  it("requires a concrete question for question reports", async () => {
    await expect(generateReport({ type: "question", paipanResult, createChat: vi.fn() })).rejects.toThrow(
      "question is required",
    );
  });
});
