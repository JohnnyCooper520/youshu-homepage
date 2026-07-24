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
    isLeapMonth: body.isLeapMonth === true,
    birthDate: body.birthDate,
    birthTime: body.birthTime,
    gender: body.gender || "",
    birthPlace: body.birthPlace || "",
    birthLongitude: body.birthLongitude,
    timezone: body.timezone || "Asia/Shanghai",
    useTrueSolarTime: body.useTrueSolarTime === true,
    ziHourConvention: body.ziHourConvention || "zi-chu",
    currentDate: new Date().toISOString().slice(0, 10),
  };
}

function mockContentFor(type, language) {
  if (language === "en") {
    if (type === "annual") {
      return "# Annual Rhythm Report\nA local test report for saving, opening, and archive behavior without a model key.\n\n## Opening judgment\nFirst steady the near field, then read the turning points.\n\n## The year's center of gravity\nKeep the work that can compound, and leave room around choices that still need time.\n\n## The next three months\nUse the next stretch to clarify priorities before adding commitments.\n\n## Suggested move\n- Finish one important loose end.\n- Revisit the decision after new information arrives.";
    }
    if (type === "question") {
      return "# One-Matter Analysis\nA local test report for saving, opening, and archive behavior without a model key.\n\n## The judgment\nKeep the question concrete and the next step becomes easier to see.\n\n## The situation\nDo not rush a decision before the practical conditions are clear.\n\n## Suggested move\n- Check one key condition.\n- Set a date to revisit the choice.";
    }
    return "# Personal Structure Report\nA local test report for saving, opening, and archive behavior without a model key.\n\n## Opening judgment\nKnow the ground first; then choose with less noise.\n\n## Core pattern\nSteadiness works better when it is paired with a clear boundary.\n\n## How to apply effort\nChoose fewer directions and return to them consistently.\n\n## Next step\n- Name the one thing worth protecting this week.\n- Let the next decision wait for one useful signal.";
  }

  if (language === "zh-TW") {
    if (type === "annual") {
      return "# 年度節奏報告\n這是一份本地測試報告，用來測試生成、歸檔和再次打開，不會消耗模型額度。\n\n## 開篇判斷\n先穩眼前，再看一年裡的轉折。\n\n## 這一年的重心\n先守住能累積的事，再為新的選擇留一點空間。\n\n## 眼前三月\n先把先後看清，不急著同時做完所有事。\n\n## 取捨建議\n- 整理一件長期拖著的事。\n- 在新訊息出現後再回看選擇。";
    }
    if (type === "question") {
      return "# 一事分析\n這是一份本地測試報告，用來測試生成、歸檔和再次打開，不會消耗模型額度。\n\n## 這件事的判斷\n問題越具體，下一步越容易落地。\n\n## 形勢\n先看清現實條件，再決定要不要加快。\n\n## 建議推進\n- 確認一個關鍵條件。\n- 給這件事留一個回看的日期。";
    }
    return "# 個人結構報告\n這是一份本地測試報告，用來測試生成、歸檔和再次打開，不會消耗模型額度。\n\n## 開篇判斷\n先看清自己的底色，再談選擇。\n\n## 結構底色\n穩住節奏，比急著證明自己更有用。\n\n## 用力方向\n把注意力放在能持續累積的事情上。\n\n## 下一步\n- 寫下這週最值得守住的一件事。\n- 等一個有效訊號後再做新決定。";
  }

  if (type === "annual") {
    return "# 年度节奏报告\n这是一份本地测试报告，用来测试生成、归档和再次打开，不会消耗模型额度。\n\n## 开篇判断\n先稳眼前，再看一年里的转折。\n\n## 这一年的重心\n先守住能积累的事，再为新的选择留一点空间。\n\n## 眼前三月\n先把先后看清，不急着同时做完所有事。\n\n## 取舍建议\n- 整理一件长期拖着的事。\n- 在新信息出现后再回看选择。";
  }
  if (type === "question") {
    return "# 一事分析\n这是一份本地测试报告，用来测试生成、归档和再次打开，不会消耗模型额度。\n\n## 这件事的判断\n问题越具体，下一步越容易落地。\n\n## 形势\n先看清现实条件，再决定要不要加快。\n\n## 建议推进\n- 确认一个关键条件。\n- 给这件事留一个回看的日期。";
  }
  return "# 个人结构报告\n这是一份本地测试报告，用来测试生成、归档和再次打开，不会消耗模型额度。\n\n## 开篇判断\n先看清自己的底色，再谈选择。\n\n## 结构底色\n稳住节奏，比急着证明自己更有用。\n\n## 用力方向\n把注意力放在能持续积累的事情上。\n\n## 下一步\n- 写下这周最值得守住的一件事。\n- 等一个有效信号后再做新决定。";
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
          coreProfile: body.coreProfile,
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
