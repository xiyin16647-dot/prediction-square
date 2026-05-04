import { NextResponse } from "next/server";
import { z } from "zod";
import Decimal from "decimal.js";
import { prisma } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/admin-auth";

Decimal.set({ precision: 30 });

const Schema = z.object({
  title: z.string().min(5).max(120),
  description: z.string().min(1).max(2000),
  resolutionRule: z.string().min(1).max(2000),
  category: z.enum([
    "FINANCE",
    "TECH",
    "ENTERTAINMENT",
    "SPORTS",
    "SOCIETY",
    "TRENDY",
    "OTHER",
  ]),
  aiBrief: z.string().max(500).optional(),
  closesAt: z.string(),
  initialYesPct: z.number().min(1).max(99),
  seedAmount: z.number().min(1000).max(1_000_000),
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

  const {
    title,
    description,
    resolutionRule,
    category,
    aiBrief,
    closesAt,
    initialYesPct,
    seedAmount,
  } = parsed.data;

  const closeDate = new Date(closesAt);
  if (isNaN(closeDate.getTime())) {
    return NextResponse.json({ error: "截止时间格式不正确" }, { status: 400 });
  }
  if (closeDate.getTime() <= Date.now() + 60 * 60 * 1000) {
    return NextResponse.json(
      { error: "截止时间必须在 1 小时之后（避免立即冻结）" },
      { status: 400 },
    );
  }

  // yesPrice = poolNo / total ⇒ poolNo = total × yesPct/100
  const total = new Decimal(seedAmount);
  const poolNo = total.mul(initialYesPct).div(100);
  const poolYes = total.sub(poolNo);

  const market = await prisma.market.create({
    data: {
      title,
      description,
      resolutionRule,
      category,
      aiBrief: aiBrief ?? null,
      status: "ACTIVE",
      closesAt: closeDate,
      publishedAt: new Date(),
      poolYes: poolYes.toFixed(4),
      poolNo: poolNo.toFixed(4),
      seedAmount: total.toFixed(4),
      createdBy: admin.id,
    },
  });

  return NextResponse.json({ id: market.id });
}
