import { NextResponse } from "next/server";
import Decimal from "decimal.js";
import { prisma } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/admin-auth";

Decimal.set({ precision: 30 });

export async function POST(
  _request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const { id } = await ctx.params;

  try {
    await prisma.$transaction(
      async (tx) => {
        const market = await tx.market.findUnique({ where: { id } });
        if (!market) throw new Error("市场不存在");
        if (market.status === "RESOLVED" || market.status === "CANCELLED") {
          throw new Error("市场已结束，无法下架");
        }

        const poolYes = new Decimal(market.poolYes.toString());
        const poolNo = new Decimal(market.poolNo.toString());
        const total = poolYes.add(poolNo);
        const yesPrice = total.lte(0)
          ? new Decimal(0.5)
          : poolNo.div(total);
        const noPrice = total.lte(0)
          ? new Decimal(0.5)
          : poolYes.div(total);

        const positions = await tx.position.findMany({
          where: { marketId: id },
        });

        for (const p of positions) {
          const yesShares = new Decimal(p.yesShares.toString());
          const noShares = new Decimal(p.noShares.toString());
          const refund = yesShares.mul(yesPrice).add(noShares.mul(noPrice));
          if (refund.lte(0)) continue;

          const updated = await tx.user.update({
            where: { id: p.userId },
            data: { balance: { increment: refund.toFixed(4) } },
          });
          await tx.ledger.create({
            data: {
              userId: p.userId,
              type: "CANCEL_REFUND",
              amount: refund.toFixed(4),
              balanceAfter: new Decimal(updated.balance.toString()).toFixed(4),
              refMarketId: id,
              note: "市场下架退款（公允价）",
            },
          });
        }

        await tx.market.update({
          where: { id },
          data: { status: "CANCELLED", resolvedAt: new Date() },
        });
      },
      { isolationLevel: "Serializable" },
    );

    return NextResponse.json({ ok: true });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "操作失败";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
