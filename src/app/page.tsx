import { SquareHeader } from "@/components/SquareHeader";
import { UserStrip, GuestStrip } from "@/components/UserStrip";
import { CategoryTabs } from "@/components/CategoryTabs";
import { MarketCard, type MarketCardData } from "@/components/MarketCard";
import { MarketRail, type RailItem } from "@/components/MarketRail";
import { SortChips } from "@/components/SortChips";
import { BottomTabBar } from "@/components/BottomTabBar";
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
const HOT_LIST_LIMIT = 20;
const REAL_CATS = Object.keys(CATEGORY_LABELS) as CategoryKey[];
const SETTLEMENT_TYPES = [
  "RESOLVE_PAYOUT",
  "CANCEL_REFUND",
  "TIMEOUT_REFUND",
] as const;

export default async function HomePage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string; sort?: string }>;
}) {
  const { cat = "recommend", sort = "hot" } = await searchParams;
  const user = await getCurrentUser();

  // 计算今日盈亏（成本法：仅算今日已结算市场，payout − 该市场累计成本）
  // 单纯下注当天不影响盈亏（balance↓ + 持仓成本↑，相互抵消）
  let todayPnl = 0;
  if (user) {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);
    const settleLedgers = await prisma.ledger.findMany({
      where: {
        userId: user.id,
        type: { in: [...SETTLEMENT_TYPES] },
        createdAt: { gte: todayStart },
      },
      select: { refMarketId: true, amount: true },
    });
    if (settleLedgers.length > 0) {
      const todayPayouts = settleLedgers.reduce(
        (s, l) => s + Number(l.amount.toString()),
        0,
      );
      const settledIds = [
        ...new Set(
          settleLedgers
            .map((l) => l.refMarketId)
            .filter((x): x is string => !!x),
        ),
      ];
      const tradesAgg = await prisma.trade.groupBy({
        by: ["marketId"],
        where: { userId: user.id, marketId: { in: settledIds } },
        _sum: { amountIn: true },
      });
      const todayCosts = tradesAgg.reduce(
        (s, t) => s + Number(t._sum.amountIn?.toString() ?? "0"),
        0,
      );
      todayPnl = todayPayouts - todayCosts;
    }
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

  // 当前用户已下注的市场集合
  const myPositionIds = new Set<string>();
  if (user && allActive.length > 0) {
    const myPos = await prisma.position.findMany({
      where: {
        userId: user.id,
        marketId: { in: allActive.map((m) => m.id) },
        OR: [{ yesShares: { gt: 0 } }, { noShares: { gt: 0 } }],
      },
      select: { marketId: true },
    });
    for (const p of myPos) myPositionIds.add(p.marketId);
  }

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
      hasPosition: myPositionIds.has(m.id),
      hasParticipants: (countMap.get(m.id) ?? 0) > 0,
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
      hasParticipants: (countMap.get(m.id) ?? 0) > 0,
      yesPct: pctOf(yesPrice),
      noPct: pctOf(noPrice),
      rightLabel: m.publishedAt ? formatRelativeTime(m.publishedAt) : "—",
    };
  });

  const now = new Date();
  const next24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  const closingItems: RailItem[] = allActive
    .filter((m) => m.closesAt > now && m.closesAt < next24h)
    .sort((a, b) => a.closesAt.getTime() - b.closesAt.getTime())
    .slice(0, 5)
    .map((m) => {
      const { yesPrice, noPrice } = poolToPrice(m.poolYes, m.poolNo);
      return {
        id: m.id,
        title: m.title,
        category: m.category as CategoryKey,
        isAi: !!m.draftSource,
        hasParticipants: (countMap.get(m.id) ?? 0) > 0,
        yesPct: pctOf(yesPrice),
        noPct: pctOf(noPrice),
        yesOdd: priceToOdds(yesPrice),
        noOdd: priceToOdds(noPrice),
        rightLabel: formatCountdown(m.closesAt),
        rightTone: "warning",
      };
    });

  const isRecommend = cat === "recommend";
  const isCategory = (REAL_CATS as string[]).includes(cat);

  // 推荐 tab：参与人数 Top 20 = 热门市场
  // 分类 tab：该分类全部，按 sort 排
  let baseList: MarketRow[];
  if (isRecommend) {
    baseList = [...allActive]
      .sort(
        (a, b) => (countMap.get(b.id) ?? 0) - (countMap.get(a.id) ?? 0),
      )
      .slice(0, HOT_LIST_LIMIT);
  } else if (isCategory) {
    baseList = allActive.filter((m) => m.category === cat);
  } else {
    baseList = [];
  }

  // 仅分类 tab 应用 SortChips 排序；推荐 tab 始终按热度
  let sortedMain = baseList;
  if (isCategory) {
    const volumeMap = new Map<string, number>();
    if (sort === "volume" && baseList.length > 0) {
      const agg = await prisma.trade.groupBy({
        by: ["marketId"],
        where: { marketId: { in: baseList.map((m) => m.id) } },
        _sum: { amountIn: true },
      });
      for (const a of agg) {
        volumeMap.set(
          a.marketId,
          Number(a._sum.amountIn?.toString() ?? "0"),
        );
      }
    }
    sortedMain = [...baseList].sort((a, b) => {
      if (sort === "volume") {
        return (volumeMap.get(b.id) ?? 0) - (volumeMap.get(a.id) ?? 0);
      }
      if (sort === "closing") {
        return a.closesAt.getTime() - b.closesAt.getTime();
      }
      if (sort === "new") {
        const ta = a.publishedAt?.getTime() ?? a.createdAt.getTime();
        const tb = b.publishedAt?.getTime() ?? b.createdAt.getTime();
        return tb - ta;
      }
      return (countMap.get(b.id) ?? 0) - (countMap.get(a.id) ?? 0);
    });
  }
  const mainCards = sortedMain.map(toCardData);

  return (
    <main className="flex-1 mx-auto w-full max-w-[420px] flex flex-col bg-bg min-h-screen">
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
        {isRecommend && (
          <div className="px-[18px] pb-1.5 flex items-baseline gap-2">
            <span
              className="font-serif text-[18px] font-bold text-text"
              style={{ letterSpacing: "-0.3px" }}
            >
              热门市场
            </span>
            <span className="text-[10.5px] text-sub font-mono">
              近期最热 · {mainCards.length} 条
            </span>
          </div>
        )}
        {isCategory && <SortChips active={sort} cat={cat} />}
        {mainCards.length === 0 ? (
          <div className="px-[18px] py-8 text-center text-sub text-sm">
            该分类暂无市场
          </div>
        ) : (
          mainCards.map((c) => <MarketCard key={c.id} m={c} />)
        )}
        <div className="h-3" />
      </div>
      <BottomTabBar active="square" />
    </main>
  );
}
