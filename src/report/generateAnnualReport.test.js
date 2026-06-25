import { describe, expect, it, vi } from "vitest";
import { generateAnnualReport } from "./generateAnnualReport.js";

describe("generateAnnualReport", () => {
  it("builds annual report messages and sends them to the chat client", async () => {
    const createChat = vi.fn().mockResolvedValue({
      content: "# 今年运势解读",
      usage: { total_tokens: 88 },
    });

    const result = await generateAnnualReport({
      paipanResult: {
        input: { birth_date: "1988-01-14" },
        pillars: { day: { value: "戊辰" } },
      },
      language: "en",
      createChat,
    });

    expect(createChat).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: [
          expect.objectContaining({ role: "system" }),
          expect.objectContaining({
            role: "user",
            content: expect.stringContaining("Write the report in English"),
          }),
        ],
      }),
    );
    expect(result.content).toBe("# 今年运势解读");
  });
});
