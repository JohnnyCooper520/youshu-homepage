import { describe, expect, it, vi } from "vitest";
import { createDeepSeekChat } from "./deepseekClient.js";

describe("createDeepSeekChat", () => {
  it("requires an API key", async () => {
    await expect(
      createDeepSeekChat({
        apiKey: "",
        messages: [{ role: "user", content: "hello" }],
        fetchImpl: vi.fn(),
      }),
    ).rejects.toThrow("DEEPSEEK_API_KEY");
  });

  it("calls DeepSeek chat completions with non-thinking mode for P0 reports", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: "报告正文" } }],
        usage: { total_tokens: 42 },
      }),
    });

    const result = await createDeepSeekChat({
      apiKey: "test-key",
      messages: [{ role: "user", content: "生成报告" }],
      fetchImpl,
    });

    expect(fetchImpl).toHaveBeenCalledWith(
      "https://api.deepseek.com/chat/completions",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          Authorization: "Bearer test-key",
          "Content-Type": "application/json",
        }),
      }),
    );
    const body = JSON.parse(fetchImpl.mock.calls[0][1].body);
    expect(body).toMatchObject({
      model: "deepseek-v4-flash",
      messages: [{ role: "user", content: "生成报告" }],
      stream: false,
      thinking: { type: "disabled" },
    });
    expect(result).toEqual({
      content: "报告正文",
      usage: { total_tokens: 42 },
      raw: expect.any(Object),
    });
  });

  it("includes API error details when DeepSeek rejects the request", async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: false,
      status: 401,
      text: async () => "invalid api key",
    });

    await expect(
      createDeepSeekChat({
        apiKey: "bad-key",
        messages: [{ role: "user", content: "hello" }],
        fetchImpl,
      }),
    ).rejects.toThrow("DeepSeek API request failed: 401 invalid api key");
  });
});
