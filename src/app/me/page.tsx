import Link from "next/link";
import Decimal from "decimal.js";
import { BottomTabBar } from "@/components/BottomTabBar";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

const REGISTER_BONUS = 10000;

function formatPnl(n: number): string {
  const rounded = Math.round(n);
  if (rounded > 0) return `+${rounded}`;
  return String(rounded);
}

function formatShortDate(d: Date): string {
  return `${d.getMonth() + 1}月${d.getDate()}日`;
}

type TradeStatus = "WIN" | "LOSS" | "PENDING" | "TIE" | "REFUND";

export default async function MePage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <main className="flex-1 mx-auto w-full max-w-[420px] flex flex-col bg-bg min-h-screen">
        <div className="px-[18px] pt-4 pb-2.5">
          <h1
            className="font-serif text-[26px] font-bold text-text"
            style={{ letterSpacing: "-0.6px" }}
          >
            我的
          </h1>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-[18px]">
          <p className="text-sub">登录后查看积分、持仓和历史</p>
          <div className="flex gap-3">
            <Link
              href="/login"
              className="px-4 py-2 bg-text text-bg rounded-full text-sm font-semibold"
            >
              登录
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 border border-line-hard text-text rounded-full text-sm font-semibold"
            >
              注册
            </Link>
          </div>
        </div>
        <BottomTabBar active="me" />
      </main>
    );
  }

  const balance = Number(user.balance.toString());

  // 排名 = 余额比当前用户大的用户数 + 1
  const aheadCount = await prisma.user.count({
    where: { balance: { gt: user.balance } },
  });
  const myRank = aheadCount + 1;

  // 拉用户所有 Trade（包含 Market 关联）
  const trades = await prisma.trade.findMany({
    where: { userId: user.id },
    include: { market: true },
    orderBy: { createdAt: "desc" },
  });

  // 拉用户当前持仓，用于计算未实现盈亏（公允价值）
  const positions = await prisma.position.findMany({
    where: {
      userId: user.id,
      OR: [{ yesShares: { gt: 0 } }, { noShares: { gt: 0 } }],
    },
    include: { market: true },
  });

  // 成本法：持仓按买入成本计入资产，下注前后总资产不变
  let activeCost = new Decimal(0);
  for (const p of positions) {
    const s = p.market.status;
    if (s === "ACTIVE" || s === "FROZEN" || s === "RESOLVING") {
      activeCost = activeCost
        .add(p.costYes.toString())
        .add(p.costNo.toString());
    }
  }

  const activeCostNum = activeCost.toNumber();
  const totalAssets = balance + activeCostNum;
  const totalPnl = totalAssets - REGISTER_BONUS;
  const pnlPct = (totalPnl / REGISTER_BONUS) * 100;
  const pnlPositive = totalPnl >= 0;

  // 统计
  const totalBets = trades.length;
  const totalStaked = trades.reduce(
    (sum, t) => sum + Number(t.amountIn.toString()),
    0,
  );
  const avgStake = totalBets > 0 ? Math.round(totalStaked / totalBets) : 0;

  // 胜率：已结算市场中押对的比例
  const resolved = trades.filter((t) => t.market.status === "RESOLVED");
  const wins = resolved.filter((t) => t.market.outcome === t.side).length;
  const winRate =
    resolved.length > 0 ? Math.round((wins / resolved.length) * 100) : null;

  function tradeResult(t: (typeof trades)[number]): {
    status: TradeStatus;
    pnl: string;
  } {
    const m = t.market;
    if (m.status === "CANCELLED") return { status: "REFUND", pnl: "退款" };
    if (m.status !== "RESOLVED") return { status: "PENDING", pnl: "—" };
    if (m.outcome === "UNKNOWN") {
      const payout = Number(t.sharesOut.toString()) * 0.5;
      return {
        status: "TIE",
        pnl: formatPnl(payout - Number(t.amountIn.toString())),
      };
    }
    if (m.outcome === t.side) {
      const payout = Number(t.sharesOut.toString());
      return {
        status: "WIN",
        pnl: formatPnl(payout - Number(t.amountIn.toString())),
      };
    }
    return {
      status: "LOSS",
      pnl: formatPnl(-Number(t.amountIn.toString())),
    };
  }

  return (
    <main className="flex-1 mx-auto w-full max-w-[420px] flex flex-col bg-bg min-h-screen">
      <div className="px-[18px] pt-4 pb-2.5">
        <h1
          className="font-serif text-[26px] font-bold text-text"
          style={{ letterSpacing: "-0.6px" }}
        >
          我的
        </h1>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Profile */}
        <div className="px-[18px] pb-4 flex items-center gap-3.5 font-sans">
          <div className="size-14 rounded-full bg-text text-bg flex items-center justify-center text-[22px] font-bold">
            {user.nickname[0]?.toUpperCase() ?? "?"}
          </div>
          <div className="flex-1 min-w-0">
            <div
              className="font-serif text-[18px] font-bold text-text truncate"
              style={{ letterSpacing: "-0.2px" }}
            >
              {user.nickname}
            </div>
            <div className="text-[11.5px] text-sub mt-1 truncate">
              @{user.username} · 排名 #{myRank}
            </div>
          </div>
        </div>

        {/* 账户摘要 */}
        <div className="mx-[18px] mb-4 p-4 bg-surface border border-line rounded-2xl font-sans">
          <div className="text-[11px] text-sub mb-1">当前总积分</div>
          <div className="flex items-baseline gap-2">
            <span
              className="font-mono text-[30px] font-bold text-text"
              style={{ letterSpacing: "-0.5px" }}
            >
              {Math.round(totalAssets).toLocaleString()}
            </span>
            <span
              className={`text-[13px] font-semibold ${
                pnlPositive ? "text-yes" : "text-no"
              }`}
            >
              {formatPnl(totalPnl)} ({pnlPositive ? "+" : ""}
              {pnlPct.toFixed(1)}%)
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2.5 mt-3 pt-3 border-t border-line">
            <div>
              <div className="text-[11px] text-sub">可投注</div>
              <div className="text-[15px] font-bold text-text font-mono mt-0.5">
                {Math.floor(balance).toLocaleString()}
                <span className="text-[11px] text-sub ml-0.5">P</span>
              </div>
            </div>
            <div>
              <div className="text-[11px] text-sub">持仓中</div>
              <div className="text-[15px] font-bold text-text font-mono mt-0.5">
                {Math.round(activeCostNum).toLocaleString()}
                <span className="text-[11px] text-sub ml-0.5">P</span>
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2.5 mt-3.5 pt-3.5 border-t border-line">
            <div>
              <div className="text-[11px] text-sub">胜率</div>
              <div className="text-[16px] font-bold text-text font-mono">
                {winRate === null ? "—" : `${winRate}%`}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-sub">总场次</div>
              <div className="text-[16px] font-bold text-text font-mono">
                {totalBets}
              </div>
            </div>
            <div>
              <div className="text-[11px] text-sub">平均下注</div>
              <div className="text-[16px] font-bold text-text font-mono">
                {avgStake}P
              </div>
            </div>
          </div>
        </div>

        {/* 预测历史 */}
        <div
          className="px-[18px] pb-2 font-serif text-[16px] font-bold text-text"
          style={{ letterSpacing: "-0.2px" }}
        >
          预测历史
        </div>
        {trades.length === 0 ? (
          <div className="mx-[18px] mb-4 py-8 text-center text-sub text-sm">
            还没下过注，去广场看看？
          </div>
        ) : (
          <div className="mx-[18px] mb-4 bg-surface border border-line rounded-2xl font-sans overflow-hidden">
            {trades.map((t, i) => {
              const { status, pnl } = tradeResult(t);
              const pnlColor =
                status === "WIN"
                  ? "text-yes"
                  : status === "LOSS"
                    ? "text-no"
                    : "text-sub";
              return (
                <Link
                  key={t.id}
                  href={`/market/${t.marketId}`}
                  className={`flex items-center gap-2.5 px-3.5 py-3 ${
                    i > 0 ? "border-t border-line" : ""
                  }`}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-[12.5px] text-text font-medium leading-[1.4] truncate">
                      {t.market.title}
                    </div>
                    <div className="text-[10.5px] text-sub mt-1 font-mono">
                      <span
                        className={`px-1.5 py-0.5 rounded font-bold ${
                          t.side === "YES"
                            ? "bg-yes-bg text-yes"
                            : "bg-no-bg text-no"
                        }`}
                      >
                        {t.side}
                      </span>
                      &nbsp;
                      {Math.round(Number(t.amountIn.toString()))}P ·{" "}
                      {formatShortDate(t.createdAt)}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div
                      className={`font-mono text-[13px] font-bold ${pnlColor}`}
                    >
                      {pnl}
                    </div>
                    <div className="text-[9.5px] text-sub mt-0.5 tracking-wider font-bold">
                      {status}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        <div className="px-[18px] py-4 text-center">
          <form action="/api/auth/logout" method="post">
            <button
              type="submit"
              className="text-xs text-sub px-4 py-2 border border-line-hard rounded-full"
            >
              退出登录
            </button>
          </form>
        </div>
      </div>

      <BottomTabBar active="me" />
    </main>
  );
}
