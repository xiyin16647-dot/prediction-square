import { NextResponse } from "next/server";
import Decimal from "decimal.js";
import { z } from "zod";
import { prisma } from "@/lib/db";
import { getCurrentAdmin } from "@/lib/admin-auth";

Decimal.set({ precision: 30 });

const Schema = z.object({
  outcome: z.enum(["YES", "NO", "UNKNOWN"]),
});

export async function POST(
  request: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const admin = await getCurrentAdmin();
  if (!admin) return NextResponse.json({ error: "未登录" }, { status: 401 });

  const { id } = await ctx.params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "请求格式错误" }, { status: 400 });
  }
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "outcome 必须是 YES / NO / UNKNOWN" },
      { status: 400 },
    );
  }

  const { outcome } = parsed.data;

  try {
    await prisma.$transaction(
      async (tx) => {
        const market = await tx.market.findUnique({ where: { id } });
        if (!market) throw new Error("市场不存在");
        if (market.status === "RESOLVED" || market.status === "CANCELLED") {
          throw new Error("市场已结束，无法结算");
        }

        const positions = await tx.position.findMany({
          where: { marketId: id },
        });

        for (const p of positions) {
          const yesShares = new Decimal(p.yesShares.toString());
          const noShares = new Decimal(p.noShares.toString());
          let payout: Decimal;
          if (outcome === "YES") payout = yesShares;
          else if (outcome === "NO") payout = noShares;
          else payout = yesShares.mul(0.5).add(noShares.mul(0.5));

          if (payout.lte(0)) continue;

          const updated = await tx.user.update({
            where: { id: p.userId },
            data: { balance: { increment: payout.toFixed(4) } },
          });
          await tx.ledger.create({
            data: {
              userId: p.userId,
              type: "RESOLVE_PAYOUT",
              amount: payout.toFixed(4),
              balanceAfter: new Decimal(updated.balance.toString()).toFixed(4),
              refMarketId: id,
              note: `市场结算赔付（${outcome}）`,
            },
          });
        }

        await tx.market.update({
          where: { id },
          data: { status: "RESOLVED", outcome, resolvedAt: new Date() },
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
