import { SquareHeader } from "@/components/SquareHeader";
import { UserStrip, GuestStrip } from "@/components/UserStrip";
import { CategoryTabs } from "@/components/CategoryTabs";
import { MarketCard, type MarketCardData } from "@/components/MarketCard";
import { MarketRail, type RailItem } from "@/components/MarketRail";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import {
  CATEGORY_LABELS,
  type CategoryKey,
  poolToPrice,
  pctOf,
  priceToOdds,
  formatRelativeTime,
  formatCountdown,
  formatDeadline,
} from "@/lib/market";

const HOT_RANK_LIMIT = 3;
const REAL_CATS = Object.keys(CATEGORY_LABELS) as CategoryKey[];
const TODAY_PNL_TYPES = [
  "TRADE_DEBIT",
  "RESOLVE_PAYOUT",
  "CANCEL_REFUND",
  "TIMEOUT_REFUND",
] as const;

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>;
}) {
  const { cat = "recommend" } = await searchParams;
  const user = await getCurrentUser();

  // 计算今日盈亏（不含注册奖励）
  let todayPnl = 0;
  if (user) {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const result = await prisma.ledger.aggregate({
      where: {
        userId: user.id,
        type: { in: [...TODAY_PNL_TYPES] },
        createdAt: { gte: todayStart },
      },
      _sum: { amount: true },
    });
    todayPnl = Number(result._sum.amount?.toString() ?? "0");
  }

  // 拉所有 ACTIVE 市场
  const allActive = await prisma.market.findMany({
    where: { status: "ACTIVE" },
    orderBy: { publishedAt: "desc" },
  });

  // 计算每个市场的参与人数（用于热度）
  const participantCounts =
    allActive.length > 0
      ? await prisma.position.groupBy({
          by: ["marketId"],
          where: {
            marketId: { in: allActive.map((m) => m.id) },
            OR: [{ yesShares: { gt: 0 } }, { noShares: { gt: 0 } }],
          },
          _count: { _all: true },
        })
      : [];
  const countMap = new Map(
    participantCounts.map((p) => [p.marketId, p._count._all]),
  );

  // 热度：参与人数 Top 3 且必须 > 0
  const sorted = [...allActive].sort(
    (a, b) => (countMap.get(b.id) ?? 0) - (countMap.get(a.id) ?? 0),
  );
  const hotIds = new Set(
    sorted
      .slice(0, HOT_RANK_LIMIT)
      .filter((m) => (countMap.get(m.id) ?? 0) > 0)
      .map((m) => m.id),
  );

  type MarketRow = (typeof allActive)[number];

  function toCardData(m: MarketRow): MarketCardData {
    const { yesPrice, noPrice } = poolToPrice(m.poolYes, m.poolNo);
    return {
      id: m.id,
      title: m.title,
      description: m.description,
      category: m.category as CategoryKey,
      isAi: !!m.draftSource,
      isHot: hotIds.has(m.id),
      deadline: formatDeadline(m.closesAt),
      yesPct: pctOf(yesPrice),
      noPct: pctOf(noPrice),
      yesOdd: priceToOdds(yesPrice),
      noOdd: priceToOdds(noPrice),
    };
  }

  const latestItems: RailItem[] = allActive.slice(0, 5).map((m) => {
    const { yesPrice, noPrice } = poolToPrice(m.poolYes, m.poolNo);
    return {
      id: m.id,
      title: m.title,
      category: m.category as CategoryKey,
      isAi: !!m.draftSource,
      yesPct: pctOf(yesPrice),
      noPct: pctOf(noPrice),
      rightLabel: m.publishedAt ? formatRelativeTime(m.publishedAt) : "—",
    };
  });

  const next24h = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const closingItems: RailItem[] = allActive
    .filter((m) => m.closesAt < next24h)
    .sort((a, b) => a.closesAt.getTime() - b.closesAt.getTime())
    .slice(0, 5)
    .map((m) => {
      const { yesPrice, noPrice } = poolToPrice(m.poolYes, m.poolNo);
      return {
        id: m.id,
        title: m.title,
        category: m.category as CategoryKey,
        isAi: !!m.draftSource,
        yesPct: pctOf(yesPrice),
        noPct: pctOf(noPrice),
        yesOdd: priceToOdds(yesPrice),
        noOdd: priceToOdds(noPrice),
        rightLabel: formatCountdown(m.closesAt),
        rightTone: "warning",
      };
    });

  let mainList = allActive;
  if (cat === "hot") {
    mainList = allActive.filter((m) => hotIds.has(m.id));
  } else if ((REAL_CATS as string[]).includes(cat)) {
    mainList = allActive.filter((m) => m.category === cat);
  }
  const mainCards = mainList.map(toCardData);

  const mainTitle =
    cat === "recommend" || cat === "hot"
      ? "本周"
      : CATEGORY_LABELS[cat as CategoryKey] ?? "全部";

  return (
    <main className="flex-1 mx-auto w-full max-w-[420px] flex flex-col bg-bg">
      <SquareHeader />
      {user ? (
        <UserStrip
          nickname={user.nickname}
          balance={Number(user.balance.toString())}
          todayPnl={todayPnl}
        />
      ) : (
        <GuestStrip />
      )}
      <CategoryTabs active={cat} />
      <div className="flex-1 overflow-y-auto pt-4">
        {cat === "recommend" && (
          <>
            <MarketRail
              variant="latest"
              title="最新市场"
              meta={`今日新上 · ${latestItems.length} 条`}
              hint="按上架时间"
              items={latestItems}
            />
            <MarketRail
              variant="closing"
              title="即将截止"
              meta={`24h 内 · ${closingItems.length} 条`}
              hint="抓紧下注"
              items={closingItems}
            />
          </>
        )}
        <div className="px-[18px] pb-1.5 flex items-baseline gap-2">
          <span
            className="font-serif text-[18px] font-bold text-text"
            style={{ letterSpacing: "-0.3px" }}
          >
            热门市场
          </span>
          <span className="text-[10.5px] text-sub font-mono">
            {mainTitle} · {mainCards.length} 条
          </span>
        </div>
        {mainCards.length === 0 ? (
          <div className="px-[18px] py-8 text-center text-sub text-sm">
            该分类暂无市场
          </div>
        ) : (
          mainCards.map((c) => <MarketCard key={c.id} m={c} />)
        )}
        {user && (
          <div className="px-[18px] py-4 text-center">
            <form action="/api/auth/logout" method="post">
              <button type="submit" className="text-[11px] text-sub">
                退出登录（{user.nickname}）
              </button>
            </form>
          </div>
        )}
        <div className="h-3" />
      </div>
    </main>
  );
}
