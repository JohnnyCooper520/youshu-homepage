import { calculateBazi } from "../src/paipan/calculateBazi.js";
import { createDeepSeekChat } from "../src/llm/deepseekClient.js";
import { generateReport } from "../src/report/generateReport.js";

const VALID_TYPES = new Set(["bazi", "annual", "question"]);

export function createMemoryKeyStore({ env = process.env } = {}) {
  let runtimeKey = "";

  return {
    get() {
      if (runtimeKey) {
        return { apiKey: runtimeKey, source: "runtime" };
      }
      if (env.DEEPSEEK_API_KEY) {
        return { apiKey: env.DEEPSEEK_API_KEY, source: "env" };
      }
      return { apiKey: "", source: null };
    },
    set(apiKey) {
      runtimeKey = String(apiKey || "").trim();
      return this.get();
    },
  };
}

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
    },
  });
}

async function readBody(request) {
  if (request.method === "GET" || request.method === "HEAD") {
    return {};
  }
  const text = await request.text();
  return text ? JSON.parse(text) : {};
}

function normalizeInput(body) {
  return {
    calendarType: body.calendarType || "solar",
    birthDate: body.birthDate,
    birthTime: body.birthTime,
    gender: body.gender || "",
    birthPlace: body.birthPlace || "",
    currentDate: new Date().toISOString().slice(0, 10),
  };
}

export function createApiHandler({
  keyStore = createMemoryKeyStore(),
  createChat = createDeepSeekChat,
  allowRuntimeKey = process.env.ALLOW_RUNTIME_DEEPSEEK_KEY === "true",
} = {}) {
  return async function handleApiRequest(request) {
    try {
      const url = new URL(request.url);

      if (url.pathname === "/api/deepseek/status" && request.method === "GET") {
        const key = keyStore.get();
        return json({ configured: Boolean(key.apiKey), source: key.source });
      }

      if (url.pathname === "/api/deepseek/key" && request.method === "POST") {
        if (!allowRuntimeKey) {
          return json({ error: "Runtime DeepSeek key updates are disabled" }, 403);
        }
        const body = await readBody(request);
        const key = keyStore.set(body.apiKey);
        return json({ configured: Boolean(key.apiKey), source: key.source });
      }

      if (url.pathname === "/api/generate" && request.method === "POST") {
        const key = keyStore.get();
        if (!key.apiKey) {
          return json({ error: "DeepSeek API key is not configured on the backend" }, 400);
        }

        const body = await readBody(request);
        const type = VALID_TYPES.has(body.type) ? body.type : "bazi";
        if (!body.birthDate || !body.birthTime) {
          return json({ error: "birthDate and birthTime are required" }, 400);
        }
        if (type === "question" && !String(body.question || "").trim()) {
          return json({ error: "question is required for question reports" }, 400);
        }

        const paipan = calculateBazi(normalizeInput(body));
        const result = await generateReport({
          type,
          paipanResult: paipan,
          language: body.language || "zh-CN",
          question: body.question,
          focus: body.focus,
          createChat: (options) => createChat({ apiKey: key.apiKey, ...options }),
        });

        return json({
          ok: true,
          type,
          paipan,
          content: result.content,
          usage: result.usage,
        });
      }

      return json({ error: "Not found" }, 404);
    } catch (error) {
      return json({ error: error.message || "Unknown server error" }, 500);
    }
  };
}

export const defaultApiHandler = createApiHandler();
