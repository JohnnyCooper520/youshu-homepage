import { describe, expect, it, vi } from "vitest";
import { createApiHandler, createMemoryKeyStore } from "./apiCore.js";

async function readJson(response) {
  return response.json();
}

function post(path, body) {
  return new Request(`http://localhost${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("apiCore", () => {
  it("reports backend DeepSeek key status without exposing it", async () => {
    const handler = createApiHandler({
      keyStore: createMemoryKeyStore({ env: { DEEPSEEK_API_KEY: "sk-env" } }),
      createChat: vi.fn(),
    });

    expect(await readJson(await handler(new Request("http://localhost/api/deepseek/status")))).toEqual({
      configured: true,
      source: "env",
    });
  });

  it("rejects runtime DeepSeek key writes by default", async () => {
    const keyStore = createMemoryKeyStore({ env: {} });
    const handler = createApiHandler({ keyStore, createChat: vi.fn() });

    const response = await handler(post("/api/deepseek/key", { apiKey: "sk-test" }));
    const json = await readJson(response);

    expect(response.status).toBe(403);
    expect(json.error).toContain("disabled");
    expect(await readJson(await handler(new Request("http://localhost/api/deepseek/status")))).toEqual({
      configured: false,
      source: null,
    });
  });

  it("stores a runtime DeepSeek key only when explicitly enabled for ops", async () => {
    const keyStore = createMemoryKeyStore({ env: {} });
    const handler = createApiHandler({ keyStore, createChat: vi.fn(), allowRuntimeKey: true });

    const response = await handler(post("/api/deepseek/key", { apiKey: "sk-test" }));

    expect(response.status).toBe(200);
    expect(await readJson(response)).toEqual({
      configured: true,
      source: "runtime",
    });
    expect(await readJson(await handler(new Request("http://localhost/api/deepseek/status")))).toEqual({
      configured: true,
      source: "runtime",
    });
  });

  it("generates a bazi report from birth data through DeepSeek", async () => {
    const createChat = vi.fn().mockResolvedValue({
      content: "# 命盘报告\n先知己。",
      usage: { total_tokens: 88 },
    });
    const handler = createApiHandler({
      keyStore: createMemoryKeyStore({ env: { DEEPSEEK_API_KEY: "sk-env" } }),
      createChat,
    });

    const response = await handler(
      post("/api/generate", {
        type: "bazi",
        language: "zh-CN",
        birthDate: "1988-01-14",
        birthTime: "11:25",
        gender: "male",
        birthPlace: "长春",
      }),
    );
    const json = await readJson(response);

    expect(response.status).toBe(200);
    expect(json.type).toBe("bazi");
    expect(json.paipan.pillars.day.value).toBe("戊辰");
    expect(json.content).toContain("命盘报告");
    expect(createChat).toHaveBeenCalledWith(
      expect.objectContaining({
        apiKey: "sk-env",
        messages: expect.arrayContaining([
          expect.objectContaining({ role: "system" }),
          expect.objectContaining({ content: expect.stringContaining("命盘报告") }),
        ]),
      }),
    );
  });

  it("generates annual outlook and question answer with separate prompt intent", async () => {
    const createChat = vi.fn().mockResolvedValueOnce({ content: "# 今年运势", usage: {} }).mockResolvedValueOnce({
      content: "此事宜稳。",
      usage: {},
    });
    const handler = createApiHandler({
      keyStore: createMemoryKeyStore({ env: { DEEPSEEK_API_KEY: "sk-env" } }),
      createChat,
    });

    await handler(
      post("/api/generate", {
        type: "annual",
        language: "zh-TW",
        birthDate: "1988-01-14",
        birthTime: "11:25",
        birthPlace: "長春",
      }),
    );
    await handler(
      post("/api/generate", {
        type: "question",
        language: "en",
        birthDate: "1988-01-14",
        birthTime: "11:25",
        birthPlace: "Changchun",
        question: "Should I change jobs?",
      }),
    );

    expect(createChat.mock.calls[0][0].messages[1].content).toContain("今年运势解读");
    expect(createChat.mock.calls[0][0].messages[1].content).toContain("使用繁體中文");
    expect(createChat.mock.calls[1][0].messages[1].content).toContain("Should I change jobs?");
    expect(createChat.mock.calls[1][0].messages[1].content).toContain("Write the answer in English");
  });

  it("rejects generation when no backend key is configured", async () => {
    const handler = createApiHandler({ keyStore: createMemoryKeyStore({ env: {} }), createChat: vi.fn() });
    const response = await handler(post("/api/generate", { type: "bazi", birthDate: "1988-01-14", birthTime: "11:25" }));
    const json = await readJson(response);

    expect(response.status).toBe(400);
    expect(json.error).toContain("DeepSeek API key");
  });
});
