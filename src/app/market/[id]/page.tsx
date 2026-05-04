import { notFound } from "next/navigation";
import Decimal from "decimal.js";
import { PageHeader } from "@/components/PageHeader";
import { BetSheet } from "@/components/BetSheet";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  CATEGORY_LABELS,
  type CategoryKey,
  poolToPrice,
  pctOf,
  priceToOdds,
  formatDeadline,
} from "@/lib/market";

const FREEZE_WINDOW_MS = 60 * 60 * 1000;
const PER_USER_PER_MARKET_CAP = 5000;

export default async function MarketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await getCurrentUser();

  const market = await prisma.market.findUnique({ where: { id } });
  if (!market) notFound();

  const participantsCount = await prisma.position.count({
    where: {
      marketId: id,
      OR: [{ yesShares: { gt: 0 } }, { noShares: { gt: 0 } }],
    },
  });

  // 用户已投入金额
  let userInvested = 0;
  let userBalance = 0;
  let userPosition: { yesShares: number; noShares: number } | null = null;
  if (user) {
    userBalance = Number(user.balance.toString());
    const pos = await prisma.position.findUnique({
      where: { userId_marketId: { userId: user.id, marketId: id } },
    });
    if (pos) {
      userInvested =
        Number(pos.costYes.toString()) + Number(pos.costNo.toString());
      userPosition = {
        yesShares: Number(pos.yesShares.toString()),
        noShares: Number(pos.noShares.toString()),
      };
    }
  }

  const { yesPrice, noPrice, total } = poolToPrice(market.poolYes, market.poolNo);
  const yesPct = pctOf(yesPrice);
  const noPct = pctOf(noPrice);
  const yesOdd = priceToOdds(yesPrice);
  const noOdd = priceToOdds(noPrice);

  // 冻结判断：状态 FROZEN 或 距截止 < 1h
  const now = Date.now();
  const closeMs = market.closesAt.getTime();
  const inFreezeWindow = closeMs - now < FREEZE_WINDOW_MS;
  const isFrozen = market.status !== "ACTIVE" || inFreezeWindow;
  let freezeReason: string | undefined;
  if (market.status === "FROZEN") freezeReason = "已冻结，无法下注";
  else if (market.status === "RESOLVING") freezeReason = "已截止，等待结算";
  else if (market.status === "RESOLVED") freezeReason = "已结算";
  else if (market.status === "CANCELLED") freezeReason = "已下架";
  else if (inFreezeWindow) freezeReason = "距截止不足 1 小时，已冻结";

  // 用户下注上限：min(池子10%, 5000-已投入, 余额)
  const singleCap = total.mul(0.1);
  const remainPerMarket = Math.max(0, PER_USER_PER_MARKET_CAP - userInvested);
  const betCap = user
    ? Math.floor(
        Math.min(
          Number(singleCap.toFixed(0)),
          remainPerMarket,
          Math.floor(userBalance),
        ),
      )
    : 0;

  const isAi = !!market.draftSource;

  return (
    <main className="flex-1 mx-auto w-full max-w-[420px] flex flex-col bg-bg min-h-screen">
      <PageHeader title="预测详情" />

      <div className="flex-1 overflow-y-auto pb-4">
        {/* 标题块 */}
        <div className="px-[18px] pb-4">
          <div className="flex gap-1.5 items-center mb-2 text-[11px] text-sub font-sans">
            <span className="px-2 py-0.5 bg-chip rounded text-text font-semibold">
              {CATEGORY_LABELS[market.category as CategoryKey]}
            </span>
            {isAi && (
              <span className="px-2 py-0.5 rounded border border-accent text-accent font-semibold text-[10px]">
                AI 设局
              </span>
            )}
            <span className="ml-auto">{formatDeadline(market.closesAt)}</span>
          </div>
          <div
            className="font-serif text-[22px] font-bold leading-[1.3] text-text"
            style={{ letterSpacing: "-0.4px" }}
          >
            {market.title}
          </div>
        </div>

        {/* 市场共识概率条 */}
        <div className="mx-[18px] mb-4 p-4 bg-surface border border-line rounded-2xl font-sans">
          <div className="flex items-baseline justify-between mb-2.5">
            <span className="text-[12px] text-sub">市场共识</span>
            <span className="text-[11px] text-mut font-mono">
              {participantsCount.toLocaleString()} 人参与
            </span>
          </div>
          <div className="flex h-2 rounded overflow-hidden mb-2 bg-line">
            <div className="bg-yes" style={{ width: `${yesPct}%` }} />
          </div>
          <div className="flex justify-between font-mono text-[13px]">
            <span className="text-yes font-bold">
              YES {yesPct}%·×{yesOdd}
            </span>
            <span className="text-no font-bold">
              NO {noPct}%·×{noOdd}
            </span>
          </div>
          {user && (
            <div className="flex gap-3.5 mt-3 pt-2.5 border-t border-line text-[11px] text-sub">
              <span>
                单笔上限{" "}
                <span className="text-text font-semibold">
                  {Math.floor(Number(singleCap.toFixed(0)))}P
                </span>
              </span>
              <span>
                你还可投入{" "}
                <span className="text-text font-semibold">
                  {betCap}P
                </span>
              </span>
            </div>
          )}
        </div>

        {/* 解读：背景 + AI 分析 */}
        <div className="mx-[18px] mb-4 p-4 bg-accent-bg border border-line rounded-2xl font-sans">
          <div className="flex items-center gap-1.5 mb-3">
            <span className="text-[14px] font-bold text-text">解读</span>
            {market.aiBrief && (
              <span className="px-1.5 py-0.5 rounded bg-accent text-bg text-[10px] font-bold tracking-wider">
                AI
              </span>
            )}
          </div>
          <div className={market.aiBrief ? "mb-3" : ""}>
            <div className="text-[11px] text-sub font-semibold mb-1">
              市场背景
            </div>
            <div className="text-[13px] text-text leading-[1.6]">
              {market.description}
            </div>
          </div>
          {market.aiBrief && (
            <div>
              <div className="text-[11px] text-sub font-semibold mb-1">
                AI 分析
              </div>
              <div className="text-[13px] text-text leading-[1.6]">
                {market.aiBrief}
              </div>
            </div>
          )}
        </div>

        {/* 持仓简览（已下注用户可见） */}
        {userPosition &&
          (userPosition.yesShares > 0 || userPosition.noShares > 0) && (
            <div className="mx-[18px] mb-4 p-4 bg-surface border border-line rounded-2xl font-sans">
              <div className="text-[12px] text-sub mb-2">我的预测</div>
              <div className="flex gap-3">
                {userPosition.yesShares > 0 && (
                  <div className="flex-1 p-3 bg-yes-bg rounded-xl">
                    <div className="text-[10px] text-yes font-bold tracking-wider">
                      YES
                    </div>
                    <div className="font-mono text-[18px] font-bold text-yes mt-1">
                      {userPosition.yesShares.toFixed(2)}
                      <span className="text-[10px] text-sub ml-1">份</span>
                    </div>
                  </div>
                )}
                {userPosition.noShares > 0 && (
                  <div className="flex-1 p-3 bg-no-bg rounded-xl">
                    <div className="text-[10px] text-no font-bold tracking-wider">
                      NO
                    </div>
                    <div className="font-mono text-[18px] font-bold text-no mt-1">
                      {userPosition.noShares.toFixed(2)}
                      <span className="text-[10px] text-sub ml-1">份</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
      </div>

      <BetSheet
        marketId={market.id}
        marketTitle={market.title}
        yesOdd={yesOdd}
        noOdd={noOdd}
        isLoggedIn={!!user}
        isFrozen={isFrozen}
        freezeReason={freezeReason}
        userBalance={userBalance}
        betCap={betCap}
      />
    </main>
  );
}
