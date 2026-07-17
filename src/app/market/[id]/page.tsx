import { notFound } from "next/navigation";
import { PageHeader } from "@/components/PageHeader";
import { BetSheet } from "@/components/BetSheet";
import { Collapse } from "@/components/Collapse";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  CATEGORY_LABELS,
  type CategoryKey,
  poolToPrice,
  pctOf,
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

  let userInvested = 0;
  let userBalance = 0;
  let userPosition: {
    yesShares: number;
    noShares: number;
    costYes: number;
    costNo: number;
  } | null = null;
  if (user) {
    userBalance = Number(user.balance.toString());
    const pos = await prisma.position.findUnique({
      where: { userId_marketId: { userId: user.id, marketId: id } },
    });
    if (pos) {
      const costYes = Number(pos.costYes.toString());
      const costNo = Number(pos.costNo.toString());
      userInvested = costYes + costNo;
      userPosition = {
        yesShares: Number(pos.yesShares.toString()),
        noShares: Number(pos.noShares.toString()),
        costYes,
        costNo,
      };
    }
  }

  const { yesPrice, noPrice, total } = poolToPrice(
    market.poolYes,
    market.poolNo,
  );
  const yesPct = pctOf(yesPrice);
  const noPct = pctOf(noPrice);
  const yesPriceNum = Number(yesPrice.toFixed(4));
  const noPriceNum = Number(noPrice.toFixed(4));

  // 冻结判断（server component；Date.now 在 request 期间求值）
  // eslint-disable-next-line react-hooks/purity
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

  // 持仓估值（按当前边际价折算）
  let posValue = 0;
  let posPnl = 0;
  let posPnlPct = 0;
  let posTotalCost = 0;
  if (userPosition) {
    posValue =
      userPosition.yesShares * yesPriceNum +
      userPosition.noShares * noPriceNum;
    posTotalCost = userPosition.costYes + userPosition.costNo;
    posPnl = posValue - posTotalCost;
    posPnlPct = posTotalCost > 0 ? (posPnl / posTotalCost) * 100 : 0;
  }
  const hasBoth =
    userPosition &&
    userPosition.yesShares > 0 &&
    userPosition.noShares > 0;

  // 结算条件文案（从描述/解析规则推断）
  const closeAtStr = new Date(market.closesAt).toLocaleString("zh-CN", {
    hour12: false,
  });

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

        {/* 市场共识概率条（无赔率） */}
        <div className="mx-[18px] mb-4 p-4 bg-surface border border-line rounded-2xl font-sans">
          <div className="flex items-baseline justify-between mb-2.5">
            <span className="text-[12px] text-sub">市场共识</span>
            <span className="text-[11px] text-mut font-mono">
              {participantsCount.toLocaleString()} 人参与
            </span>
          </div>
          {participantsCount > 0 ? (
            <>
              <div className="flex h-2 rounded overflow-hidden mb-2 bg-line">
                <div className="bg-yes" style={{ width: `${yesPct}%` }} />
              </div>
              <div className="flex justify-between font-mono text-[14px]">
                <span className="text-yes font-bold">
                  YES <span className="text-[18px]">{yesPct}%</span>
                </span>
                <span className="text-no font-bold">
                  <span className="text-[18px]">{noPct}%</span> NO
                </span>
              </div>
            </>
          ) : (
            <div className="text-center text-sub text-[13px] py-3 border border-dashed border-line-hard rounded">
              暂无投注 · 你的下注会决定首发概率
            </div>
          )}
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
                <span className="text-text font-semibold">{betCap}P</span>
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

        {/* 我的持仓（成本/当前价值/盈亏） */}
        {userPosition &&
          (userPosition.yesShares > 0 || userPosition.noShares > 0) && (
            <div className="mx-[18px] mb-4 p-4 bg-surface border border-line rounded-2xl font-sans">
              <div className="text-[12px] text-sub mb-2.5">我的持仓</div>
              <div className="flex gap-3">
                <PosCell
                  side="YES"
                  shares={userPosition.yesShares}
                  cost={userPosition.costYes}
                  curPrice={yesPriceNum}
                />
                <PosCell
                  side="NO"
                  shares={userPosition.noShares}
                  cost={userPosition.costNo}
                  curPrice={noPriceNum}
                />
              </div>
              <div className="mt-3 pt-2.5 border-t border-line flex justify-between text-[12px]">
                <span className="text-sub">
                  总投入{" "}
                  <span className="font-mono text-text font-semibold">
                    {posTotalCost.toFixed(0)}
                  </span>{" "}
                  · 当前价值{" "}
                  <span className="font-mono text-text font-semibold">
                    {posValue.toFixed(2)}
                  </span>
                </span>
                <span
                  className={`font-mono font-bold ${posPnl >= 0 ? "text-yes" : "text-no"}`}
                >
                  {posPnl >= 0 ? "+" : ""}
                  {posPnl.toFixed(2)} ({posPnl >= 0 ? "+" : ""}
                  {posPnlPct.toFixed(1)}%)
                </span>
              </div>
              {hasBoth && (
                <div className="mt-2.5 p-2.5 bg-accent-bg border border-line rounded-lg text-[11.5px] text-sub leading-[1.55]">
                  💡 你同时持有 YES 和 NO，结算时只有一边能赢，另一边归 0。
                  双边持仓不会「稳赚」，反而会双倍承担滑点损失。
                </div>
              )}
            </div>
          )}

        {/* 折叠卡片 1：怎么玩 */}
        <Collapse title="怎么玩 · 1 分钟看懂" icon="🎮">
          <ol className="space-y-2 list-decimal pl-5">
            <li>
              <b className="text-text">这是一个二元预测</b>
              ：猜 YES（会发生）或 NO（不会发生）。
            </li>
            <li>
              <b className="text-text">概率就是市场共识</b>
              ：你看到的「YES 52%」是所有玩家用积分投票的结果，不是赔率，会随交易实时变化。
            </li>
            <li>
              <b className="text-text">怎么赚积分</b>
              ：买在低位 + 押对方向 = 赚多；买在高位 + 押对方向 = 赚少；押错方向 = 全亏。
            </li>
          </ol>
        </Collapse>

        {/* 折叠卡片 2：结算规则 */}
        <Collapse title="结算规则" icon="📋">
          <div className="space-y-1.5 font-mono text-[12.5px]">
            <Row k="截止时间" v={closeAtStr} />
            <Row k="冻结期" v="截止前 1 小时停止下注" />
            <Row
              k="结算条件"
              v={market.resolutionRule || "见市场背景描述"}
              multiline
            />
            <Row k="异常处理" v="若结算源数据缺失，市场作废，按公允价值退还" multiline />
          </div>
        </Collapse>
      </div>

      <BetSheet
        marketId={market.id}
        marketTitle={market.title}
        yesPrice={yesPriceNum}
        noPrice={noPriceNum}
        isLoggedIn={!!user}
        isFrozen={isFrozen}
        freezeReason={freezeReason}
        userBalance={userBalance}
        betCap={betCap}
        userInvested={userInvested}
        perMarketCap={PER_USER_PER_MARKET_CAP}
      />
    </main>
  );
}

function PosCell({
  side,
  shares,
  cost,
  curPrice,
}: {
  side: "YES" | "NO";
  shares: number;
  cost: number;
  curPrice: number;
}) {
  const isYes = side === "YES";
  if (shares <= 0) {
    return (
      <div className="flex-1 p-3 bg-surface-alt rounded-xl">
        <div
          className={`text-[10px] font-bold tracking-wider ${isYes ? "text-yes" : "text-no"}`}
        >
          {side}
        </div>
        <div className="font-mono text-[14px] text-mut mt-1">未持有</div>
        <div className="text-[10px] text-mut mt-1">—</div>
      </div>
    );
  }
  const value = shares * curPrice;
  const pnl = value - cost;
  return (
    <div className={`flex-1 p-3 rounded-xl ${isYes ? "bg-yes-bg" : "bg-no-bg"}`}>
      <div
        className={`text-[10px] font-bold tracking-wider ${isYes ? "text-yes" : "text-no"}`}
      >
        {side}
      </div>
      <div
        className={`font-mono text-[18px] font-bold mt-1 ${isYes ? "text-yes" : "text-no"}`}
      >
        {shares.toFixed(2)}
        <span className="text-[10px] text-sub ml-1">份</span>
      </div>
      <div className="text-[10.5px] text-sub mt-1 font-mono">
        成本 {cost.toFixed(0)} ·{" "}
        <span className={pnl >= 0 ? "text-yes" : "text-no"}>
          {pnl >= 0 ? "+" : ""}
          {pnl.toFixed(1)}
        </span>
      </div>
    </div>
  );
}

function Row({
  k,
  v,
  multiline,
}: {
  k: string;
  v: string;
  multiline?: boolean;
}) {
  if (multiline) {
    return (
      <div>
        <div className="text-sub mb-0.5">{k}</div>
        <div className="text-text whitespace-pre-wrap">{v}</div>
      </div>
    );
  }
  return (
    <div className="flex justify-between">
      <span className="text-sub">{k}</span>
      <span className="text-text">{v}</span>
    </div>
  );
}
