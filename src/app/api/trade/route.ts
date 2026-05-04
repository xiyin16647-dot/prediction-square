import { NextResponse } from "next/server";
import { z } from "zod";
import Decimal from "decimal.js";
import { prisma } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { calcBuy } from "@/lib/amm";

Decimal.set({ precision: 30 });

const TradeSchema = z.object({
  marketId: z.string().min(1),
  side: z.enum(["YES", "NO"]),
  amountIn: z.number().positive().max(1_000_000),
});

const PER_USER_PER_MARKET_CAP = new Decimal(5000);
const POOL_PCT_CAP = new Decimal(0.1);
const FREEZE_WINDOW_MS = 60 * 60 * 1000;

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "请先登录" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "请求格式错误" }, { status: 400 });
  }

  const parsed = TradeSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "参数不合法" },
      { status: 400 },
    );
  }

  const { marketId, side, amountIn: amountInRaw } = parsed.data;
  const amountIn = new Decimal(amountInRaw);

  if (amountIn.lt(1)) {
    return NextResponse.json(
      { error: "下注金额必须 ≥ 1 积分" },
      { status: 400 },
    );
  }

  try {
    const result = await prisma.$transaction(
      async (tx) => {
        const market = await tx.market.findUnique({ where: { id: marketId } });
        if (!market) throw new Error("市场不存在");

        if (market.status !== "ACTIVE") {
          throw new Error("该市场当前不可交易");
        }

        // 冻结期：截止前 1 小时禁交易
        const freezeAt = new Date(market.closesAt.getTime() - FREEZE_WINDOW_MS);
        if (new Date() >= freezeAt) {
          throw new Error("该市场已进入冻结期");
        }

        const poolYes = new Decimal(market.poolYes.toString());
        const poolNo = new Decimal(market.poolNo.toString());
        const total = poolYes.add(poolNo);
        const singleCap = total.mul(POOL_PCT_CAP);
        if (amountIn.gt(singleCap)) {
          throw new Error(
            `单笔上限 ${singleCap.toFixed(0)} 积分（池子的 10%）`,
          );
        }

        // 用户余额
        const dbUser = await tx.user.findUnique({ where: { id: user.id } });
        if (!dbUser) throw new Error("用户不存在");
        const balance = new Decimal(dbUser.balance.toString());
        if (balance.lt(amountIn)) {
          throw new Error("余额不足");
        }

        // 单用户单市场累计上限
        const existingPos = await tx.position.findUnique({
          where: { userId_marketId: { userId: user.id, marketId } },
        });
        const invested = existingPos
          ? new Decimal(existingPos.costYes.toString()).add(
              new Decimal(existingPos.costNo.toString()),
            )
          : new Decimal(0);
        if (invested.add(amountIn).gt(PER_USER_PER_MARKET_CAP)) {
          throw new Error(
            `你在该市场累计投入将超过上限 5000 积分（已投入 ${invested.toFixed(0)}）`,
          );
        }

        // 计算 AMM 出来的份额
        const buy = calcBuy({ poolYes, poolNo }, amountIn, side);

        // 更新市场池子
        await tx.market.update({
          where: { id: marketId },
          data: {
            poolYes: buy.newPoolYes.toFixed(4),
            poolNo: buy.newPoolNo.toFixed(4),
          },
        });

        // 扣余额
        const newBalance = balance.sub(amountIn);
        await tx.user.update({
          where: { id: user.id },
          data: { balance: newBalance.toFixed(4) },
        });

        // 记录 Trade
        const trade = await tx.trade.create({
          data: {
            userId: user.id,
            marketId,
            side,
            amountIn: amountIn.toFixed(4),
            sharesOut: buy.sharesOut.toFixed(4),
            priceAvg: buy.avgPrice.toFixed(6),
            poolYesBefore: poolYes.toFixed(4),
            poolNoBefore: poolNo.toFixed(4),
            poolYesAfter: buy.newPoolYes.toFixed(4),
            poolNoAfter: buy.newPoolNo.toFixed(4),
          },
        });

        // upsert Position
        const yesShareDelta = side === "YES" ? buy.sharesOut : new Decimal(0);
        const noShareDelta = side === "NO" ? buy.sharesOut : new Decimal(0);
        const yesCostDelta = side === "YES" ? amountIn : new Decimal(0);
        const noCostDelta = side === "NO" ? amountIn : new Decimal(0);

        if (existingPos) {
          await tx.position.update({
            where: { userId_marketId: { userId: user.id, marketId } },
            data: {
              yesShares: new Decimal(existingPos.yesShares.toString())
                .add(yesShareDelta)
                .toFixed(4),
              noShares: new Decimal(existingPos.noShares.toString())
                .add(noShareDelta)
                .toFixed(4),
              costYes: new Decimal(existingPos.costYes.toString())
                .add(yesCostDelta)
                .toFixed(4),
              costNo: new Decimal(existingPos.costNo.toString())
                .add(noCostDelta)
                .toFixed(4),
            },
          });
        } else {
          await tx.position.create({
            data: {
              userId: user.id,
              marketId,
              yesShares: yesShareDelta.toFixed(4),
              noShares: noShareDelta.toFixed(4),
              costYes: yesCostDelta.toFixed(4),
              costNo: noCostDelta.toFixed(4),
            },
          });
        }

        // 写流水
        await tx.ledger.create({
          data: {
            userId: user.id,
            type: "TRADE_DEBIT",
            amount: amountIn.neg().toFixed(4),
            balanceAfter: newBalance.toFixed(4),
            refMarketId: marketId,
            refTradeId: trade.id,
            note: `下注 ${side} ${amountIn.toFixed(0)} 积分`,
          },
        });

        return {
          sharesOut: Number(buy.sharesOut.toFixed(4)),
          avgPrice: Number(buy.avgPrice.toFixed(6)),
          newBalance: Number(newBalance.toFixed(4)),
          newPoolYes: buy.newPoolYes.toFixed(4),
          newPoolNo: buy.newPoolNo.toFixed(4),
        };
      },
      { isolationLevel: "Serializable", timeout: 15000, maxWait: 5000 },
    );

    return NextResponse.json({ success: true, ...result });
  } catch (e) {
    const msg = e instanceof Error ? e.message : "下注失败";
    // Postgres serialization_failure → 提示用户重试
    if (msg.includes("serializ") || msg.includes("40001")) {
      return NextResponse.json(
        { error: "市场刚刚有人下注，请稍后重试" },
        { status: 409 },
      );
    }
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
