import { NextResponse } from "next/server";
import Decimal from "decimal.js";
import { prisma } from "@/lib/db";

Decimal.set({ precision: 30 });

const TIMEOUT_MS = 24 * 60 * 60 * 1000;

// Vercel Cron 自动带 Authorization: Bearer $CRON_SECRET，在此校验
function isAuthorized(request: Request): boolean {
  const expected = process.env.CRON_SECRET;
  if (!expected) return false;
  const auth = request.headers.get("authorization");
  return auth === `Bearer ${expected}`;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const cutoff = new Date(Date.now() - TIMEOUT_MS);
  const expired = await prisma.market.findMany({
    where: {
      status: { in: ["ACTIVE", "FROZEN", "RESOLVING"] },
      closesAt: { lt: cutoff },
    },
    select: { id: true, title: true },
  });

  let processed = 0;
  let failed = 0;
  const errors: Array<{ id: string; error: string }> = [];

  for (const m of expired) {
    try {
      await prisma.$transaction(
        async (tx) => {
          const market = await tx.market.findUnique({ where: { id: m.id } });
          if (!market) return;
          if (market.status === "RESOLVED" || market.status === "CANCELLED") return;

          const poolYes = new Decimal(market.poolYes.toString());
          const poolNo = new Decimal(market.poolNo.toString());
          const total = poolYes.add(poolNo);
          const yesPrice = total.lte(0) ? new Decimal(0.5) : poolNo.div(total);
          const noPrice = total.lte(0) ? new Decimal(0.5) : poolYes.div(total);

          const positions = await tx.position.findMany({
            where: { marketId: m.id },
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
                type: "TIMEOUT_REFUND",
                amount: refund.toFixed(4),
                balanceAfter: new Decimal(updated.balance.toString()).toFixed(4),
                refMarketId: m.id,
                note: "市场超时未结算自动退款（公允价）",
              },
            });
          }

          await tx.market.update({
            where: { id: m.id },
            data: { status: "CANCELLED", resolvedAt: new Date() },
          });
        },
        { isolationLevel: "Serializable", timeout: 15000, maxWait: 5000 },
      );
      processed++;
    } catch (e) {
      failed++;
      errors.push({
        id: m.id,
        error: e instanceof Error ? e.message : "unknown",
      });
    }
  }

  return NextResponse.json({
    ok: true,
    found: expired.length,
    processed,
    failed,
    errors,
  });
}
