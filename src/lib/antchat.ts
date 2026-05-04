const ENDPOINT = "https://antchat.alipay.com/v1/chat/completions";

type ChatOpts = {
  system?: string;
  maxTokens?: number;
  temperature?: number;
};

export async function antchat(prompt: string, opts: ChatOpts = {}): Promise<string> {
  const token = process.env.ANTCHAT_TOKEN;
  if (!token) throw new Error("ANTCHAT_TOKEN 未配置");
  const model = process.env.ANTCHAT_MODEL ?? "DeepSeek-V4-Flash";

  const messages: Array<{ role: string; content: string }> = [];
  if (opts.system) messages.push({ role: "system", content: opts.system });
  messages.push({ role: "user", content: prompt });

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 30_000);

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        "SOFA-TraceId": crypto.randomUUID().replace(/-/g, ""),
        "SOFA-RpcId": "0.1",
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: opts.maxTokens ?? 500,
        temperature: opts.temperature ?? 0.4,
      }),
      signal: ctrl.signal,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`antchat HTTP ${res.status}: ${text.slice(0, 200)}`);
    }
    const data = await res.json();
    const content = data?.choices?.[0]?.message?.content;
    if (typeof content !== "string" || !content.trim()) {
      throw new Error("antchat 返回为空");
    }
    return content.trim();
  } finally {
    clearTimeout(timer);
  }
}
