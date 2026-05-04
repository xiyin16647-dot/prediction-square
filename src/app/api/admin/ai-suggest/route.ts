import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { antchat } from "@/lib/antchat";

const CATEGORY_LABEL: Record<string, string> = {
  FINANCE: "金融",
  TECH: "科技",
  ENTERTAINMENT: "娱乐",
  SPORTS: "体育",
  SOCIETY: "社会",
  TRENDY: "潮玩",
  OTHER: "其他",
};

const Schema = z.object({
  field: z.enum(["description", "resolutionRule", "aiBrief", "initialYesPct"]),
  title: z.string().min(3).max(200),
  category: z.string().optional(),
  closesAt: z.string().optional(),
});

export async function POST(request: Request) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "未登录" }, { status: 401 });

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "请求格式错误" }, { status: 400 });
  }
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "参数不合法" },
      { status: 400 },
    );
  }
  const { field, title, category, closesAt } = parsed.data;
  const cat = category ? (CATEGORY_LABEL[category] ?? category) : "未知";
  const closesText = closesAt ? `，截止于 ${closesAt}` : "";
  const head = `预测市场标题："${title}"，分类：${cat}${closesText}。`;

  try {
    if (field === "description") {
      const out = await antchat(
        `${head}\n请输出 2-3 句话的市场背景说明，让用户快速理解话题，约 80-150 字。注意：不要编造你不确定的具体数字、日期、人名；不要使用 markdown，纯文本即可；直接输出说明文，不要任何前缀或解释。`,
        { maxTokens: 400, temperature: 0.5 },
      );
      return NextResponse.json({ value: stripWrap(out) });
    }
    if (field === "resolutionRule") {
      const out = await antchat(
        `${head}\n请输出一句精确的结算规则，明确说明什么算 YES。要求：以官方/权威来源为准的语气；条件可量化时给条件，不可量化时给"以官方公告为准"的兜底；不要编造数字；不超过 80 字；纯文本。直接输出规则，不要任何前缀。`,
        { maxTokens: 200, temperature: 0.3 },
      );
      return NextResponse.json({ value: stripWrap(out) });
    }
    if (field === "aiBrief") {
      const out = await antchat(
        `${head}\n请输出 1 句话的"AI 轻解读"，让用户 3 秒看懂这个话题为什么值得预测。要求：不超过 50 字；不编造具体数据；纯文本，不要前缀。`,
        { maxTokens: 150, temperature: 0.6 },
      );
      return NextResponse.json({ value: stripWrap(out) });
    }
    // initialYesPct
    const out = await antchat(
      `${head}\n请基于一般认知，估一个该事件成真（YES）的初始概率，输出一个 1-99 的整数。直接输出数字，不要任何文字、单位、符号。`,
      { maxTokens: 30, temperature: 0.3 },
    );
    const num = parseInt(out.replace(/[^\d-]/g, ""), 10);
    if (isNaN(num) || num < 1 || num > 99) {
      return NextResponse.json({ value: 50 });
    }
    return NextResponse.json({ value: num });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "AI 服务异常";
    return NextResponse.json({ error: msg }, { status: 502 });
  }
}

function stripWrap(s: string): string {
  return s
    .trim()
    .replace(/^["「『]+|["」』]+$/g, "")
    .replace(/^说明[:：]\s*/, "")
    .replace(/^规则[:：]\s*/, "")
    .replace(/^解读[:：]\s*/, "")
    .trim();
}
