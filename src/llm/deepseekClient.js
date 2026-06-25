const DEEPSEEK_CHAT_COMPLETIONS_URL = "https://api.deepseek.com/chat/completions";

export async function createDeepSeekChat({
  apiKey = process.env.DEEPSEEK_API_KEY,
  model = process.env.DEEPSEEK_MODEL || "deepseek-v4-flash",
  messages,
  temperature = 0.72,
  maxTokens = 5000,
  fetchImpl = globalThis.fetch,
} = {}) {
  if (!apiKey) {
    throw new Error("DEEPSEEK_API_KEY is required");
  }
  if (!Array.isArray(messages) || messages.length === 0) {
    throw new Error("messages must be a non-empty array");
  }
  if (typeof fetchImpl !== "function") {
    throw new Error("fetch is not available in this runtime");
  }

  const response = await fetchImpl(DEEPSEEK_CHAT_COMPLETIONS_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      messages,
      temperature,
      max_tokens: maxTokens,
      stream: false,
      // P0 report generation is single-turn. Disable thinking to keep cost,
      // latency, and response handling predictable.
      thinking: { type: "disabled" },
    }),
  });

  if (!response.ok) {
    throw new Error(`DeepSeek API request failed: ${response.status} ${await response.text()}`);
  }

  const raw = await response.json();
  const content = raw?.choices?.[0]?.message?.content;
  if (!content) {
    throw new Error("DeepSeek API response did not include message content");
  }

  return {
    content,
    usage: raw.usage,
    raw,
  };
}
