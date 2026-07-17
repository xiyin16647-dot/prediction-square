import { NextResponse } from "next/server";
import { z } from "zod";
import Decimal from "decimal.js";
import { prisma } from "@/lib/db";
import { calcBuy } from "@/lib/amm";

Decimal.set({ precision: 30 });

const PreviewSchema = z.object({
  marketId: z.string().min(1),
  side: z.enum(["YES", "NO"]),
  amountIn: z.number().positive().max(1_000_000),
});

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "请求格式错误" }, { status: 400 });
  }

  const parsed = PreviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "参数不合法" },
      { status: 400 },
    );
  }

  const { marketId, side, amountIn: amountInRaw } = parsed.data;
  const amountIn = new Decimal(amountInRaw);

  if (amountIn.lt(1)) {
    return NextResponse.json({ error: "金额需 ≥ 1" }, { status: 400 });
  }

  const market = await prisma.market.findUnique({
    where: { id: marketId },
    select: { poolYes: true, poolNo: true },
  });
  if (!market) {
    return NextResponse.json({ error: "市场不存在" }, { status: 404 });
  }

  const poolYes = new Decimal(market.poolYes.toString());
  const poolNo = new Decimal(market.poolNo.toString());
  const result = calcBuy({ poolYes, poolNo }, amountIn, side);

  return NextResponse.json({
    sharesOut: Number(result.sharesOut.toFixed(4)),
    avgPrice: Number(result.avgPrice.toFixed(6)),
    slippage: Number(result.slippage.toFixed(6)),
    priceBefore: Number(result.priceBefore.toFixed(6)),
    priceAfter: Number(result.priceAfter.toFixed(6)),
    payoutIfWin: Number(result.sharesOut.toFixed(4)),
    pnlIfWin: Number(result.sharesOut.sub(amountIn).toFixed(4)),
    payoutIfLose: 0,
    pnlIfLose: -Number(amountIn.toFixed(4)),
  });
}
