import { calculateBazi } from "../src/paipan/calculateBazi.js";
import { createDeepSeekChat } from "../src/llm/deepseekClient.js";
import { generateReport } from "../src/report/generateReport.js";
import { createAlipayVerifier, parseAlipayPassbackParams } from "./alipay.js";
import { createSupabaseEntitlementStore } from "./paymentEntitlements.js";

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

function plainText(data, status = 200) {
  return new Response(data, {
    status,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}

async function readBody(request) {
  if (request.method === "GET" || request.method === "HEAD") {
    return {};
  }
  const text = await request.text();
  if (!text) {
    return {};
  }

  const contentType = request.headers.get("content-type") || "";
  if (contentType.includes("application/x-www-form-urlencoded")) {
    return Object.fromEntries(new URLSearchParams(text));
  }

  return JSON.parse(text);
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

function mockContentFor(type, language) {
  if (language === "en") {
    if (type === "annual") {
      return "# Local Mock Annual Rhythm Report\nThis is a local test report. It lets you test saving, opening, and archive behavior without a model key.\n\n## Next Twelve Months\nFirst steady the near field, then read the turning points.";
    }
    if (type === "question") {
      return "# Local Mock One-Matter Analysis\nThis is a local test report. It lets you test saving, opening, and archive behavior without a model key.\n\n## One Matter\nKeep the question concrete. The next step becomes easier to see.";
    }
    return "# Local Mock Personal Structure Report\nThis is a local test report. It lets you test saving, opening, and archive behavior without a model key.\n\n## Base Pattern\nKnow the ground first; then choose with less noise.";
  }

  if (language === "zh-TW") {
    if (type === "annual") {
      return "# 本地測試報告 · 年度節奏\n這是一份本地測試報告，用來測試生成、歸檔和再次打開，不會消耗模型額度。\n\n## 未來十二月\n先穩眼前，再看一年裡的轉折。";
    }
    if (type === "question") {
      return "# 本地測試報告 · 一事分析\n這是一份本地測試報告，用來測試生成、歸檔和再次打開，不會消耗模型額度。\n\n## 此事一問\n問題越具體，下一步越容易落地。";
    }
    return "# 本地測試報告 · 個人結構報告\n這是一份本地測試報告，用來測試生成、歸檔和再次打開，不會消耗模型額度。\n\n## 個人結構底色\n先看清自己的底色，再談選擇。";
  }

  if (type === "annual") {
    return "# 本地测试报告 · 年度节奏\n这是一份本地测试报告，用来测试生成、归档和再次打开，不会消耗模型额度。\n\n## 未来十二月\n先稳眼前，再看一年里的转折。";
  }
  if (type === "question") {
    return "# 本地测试报告 · 一事分析\n这是一份本地测试报告，用来测试生成、归档和再次打开，不会消耗模型额度。\n\n## 此事一问\n问题越具体，下一步越容易落地。";
  }
  return "# 本地测试报告 · 个人结构报告\n这是一份本地测试报告，用来测试生成、归档和再次打开，不会消耗模型额度。\n\n## 个人结构底色\n先看清自己的底色，再谈选择。";
}

function isPaidAlipayTrade(fields) {
  return fields.trade_status === "TRADE_SUCCESS" || fields.trade_status === "TRADE_FINISHED";
}

function getAlipayPayment(fields, env) {
  if (env.ALIPAY_APP_ID && fields.app_id !== env.ALIPAY_APP_ID) {
    throw new Error("Alipay app_id mismatch");
  }
  if (!isPaidAlipayTrade(fields)) {
    throw new Error("Alipay trade is not paid");
  }

  const passback = parseAlipayPassbackParams(fields.passback_params);
  if (!passback.userId || !passback.productKey) {
    throw new Error("Alipay passback_params must include userId and productKey");
  }
  if (!fields.out_trade_no) {
    throw new Error("Alipay out_trade_no is required");
  }

  return {
    provider: "alipay",
    orderId: fields.out_trade_no,
    providerTradeId: fields.trade_no || "",
    userId: passback.userId,
    productKey: passback.productKey,
    amount: fields.total_amount || "",
    raw: fields,
  };
}

export function createApiHandler({
  env = process.env,
  keyStore = createMemoryKeyStore({ env }),
  createChat = createDeepSeekChat,
  allowRuntimeKey = env.ALLOW_RUNTIME_DEEPSEEK_KEY === "true",
  mockReports = env.MOCK_REPORTS === "true",
  entitlementStore = createSupabaseEntitlementStore({ env }),
  alipayVerifier = createAlipayVerifier({ env }),
} = {}) {
  return async function handleApiRequest(request) {
    try {
      const url = new URL(request.url);

      if (url.pathname === "/api/deepseek/status" && request.method === "GET") {
        if (mockReports) {
          return json({ configured: true, source: "mock" });
        }
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
        const body = await readBody(request);
        const type = VALID_TYPES.has(body.type) ? body.type : "bazi";
        if (!body.birthDate || !body.birthTime) {
          return json({ error: "birthDate and birthTime are required" }, 400);
        }
        if (type === "question" && !String(body.question || "").trim()) {
          return json({ error: "question is required for question reports" }, 400);
        }

        const paipan = calculateBazi(normalizeInput(body));
        if (mockReports) {
          return json({
            ok: true,
            type,
            paipan,
            content: mockContentFor(type, body.language || "zh-CN"),
            usage: { source: "mock" },
          });
        }

        const key = keyStore.get();
        if (!key.apiKey) {
          return json({ error: "DeepSeek API key is not configured on the backend" }, 400);
        }
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

      if (url.pathname === "/api/payments/alipay/notify" && request.method === "POST") {
        const fields = await readBody(request);
        if (!alipayVerifier(fields)) {
          return plainText("fail", 400);
        }

        const payment = getAlipayPayment(fields, env);
        await entitlementStore.recordPayment(payment);
        return plainText("success");
      }

      return json({ error: "Not found" }, 404);
    } catch (error) {
      if (new URL(request.url).pathname === "/api/payments/alipay/notify") {
        return plainText("fail", 400);
      }
      return json({ error: error.message || "Unknown server error" }, 500);
    }
  };
}

export const defaultApiHandler = createApiHandler();
