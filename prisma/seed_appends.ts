import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

// Seed that APPENDS ACTIVE markets without deleting existing ones
// (the committed seed.ts does deleteMany{} which fails on FK constraints
//  because old markets still have positions/trades). This is safe & idempotent:
// skip titles that already exist.

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const NOW = Date.now();
const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

type Cat =
  | "FINANCE"
  | "TECH"
  | "ENTERTAINMENT"
  | "SPORTS"
  | "SOCIETY"
  | "TRENDY"
  | "OTHER";

interface SeedMarket {
  title: string;
  description: string;
  resolutionRule: string;
  category: Cat;
  closesInMs: number;
  publishedAgoMs: number;
  poolYes: number;
  poolNo: number;
  isAi: boolean;
  aiBrief?: string;
}

const SEED_MARKETS: SeedMarket[] = [
  {
    title: "美联储 9 月议息会议是否会降息 25bp？",
    description:
      "当前市场预期分化，CPI 数据将于会前公布。多位官员近期讲话偏鸽。",
    resolutionRule: "以美联储官方公告为准。降息幅度 ≥ 25bp 算 YES。",
    category: "FINANCE",
    closesInMs: 7 * DAY,
    publishedAgoMs: 2 * HOUR,
    poolYes: 7600,
    poolNo: 12400,
    isAi: true,
    aiBrief: "AI 综合：CPI 已连续 2 月低于预期，市场已 price-in 25bp 概率约 65%。",
  },
  {
    title: "iPhone 17 Pro 全球首发周销量是否突破 1500 万台？",
    description: "分析师预期区间 1300–1700 万台。需以 Apple 财报披露口径为准。",
    resolutionRule: "Apple 公布的首发周（含周末）激活/出货量 ≥ 1500 万为 YES。",
    category: "TECH",
    closesInMs: 14 * DAY,
    publishedAgoMs: 4 * HOUR,
    poolYes: 11800,
    poolNo: 8200,
    isAi: true,
  },
  {
    title: "BTC 是否在下月底前突破 12 万美元？",
    description: "现货 ETF 资金近期净流入，链上活跃度回升。",
    resolutionRule: "以 Coinbase 现货 BTC/USD 在到期前任意时刻 ≥ 120,000 为 YES。",
    category: "FINANCE",
    closesInMs: 28 * DAY,
    publishedAgoMs: 6 * HOUR,
    poolYes: 14400,
    poolNo: 5600,
    isAi: false,
  },
  {
    title: "科创 50 指数本月内能否突破 1800 点？",
    description: "半导体与 AI 算力板块持续走强，量能配合。",
    resolutionRule: " Wind 口径，本月内科创 50 指数任意交易日收盘 ≥ 1800 为 YES。",
    category: "TECH",
    closesInMs: 12 * DAY,
    publishedAgoMs: 3 * HOUR,
    poolYes: 8800,
    poolNo: 11200,
    isAi: true,
  },
  {
    title: "COMEX 黄金年底前能否突破 5000 美元/盎司？",
    description: "央行购金延续，实际利率回落预期支撑金价。",
    resolutionRule: "COMEX 黄金主力合约在到期前任意时刻 ≥ 5000 美元/盎司为 YES。",
    category: "FINANCE",
    closesInMs: 21 * DAY,
    publishedAgoMs: 8 * HOUR,
    poolYes: 9600,
    poolNo: 10400,
    isAi: false,
  },
  {
    title: "Labubu 新款上市首日是否售罄？",
    description: "泡泡玛特新品发售，预计供应量有限。",
    resolutionRule: "泡泡玛特官方商城首日 24h 内显示售罄为 YES。",
    category: "TRENDY",
    closesInMs: 4 * DAY,
    publishedAgoMs: 22 * HOUR,
    poolYes: 4400,
    poolNo: 15600,
    isAi: true,
  },
  {
    title: "本月全国票房能否突破 40 亿？",
    description: "多部大片集中上映，暑期档火力全开。",
    resolutionRule: "猫眼专业版口径，本月累计票房 ≥ 40 亿为 YES。",
    category: "ENTERTAINMENT",
    closesInMs: 20 * DAY,
    publishedAgoMs: 1 * DAY,
    poolYes: 7600,
    poolNo: 12400,
    isAi: true,
  },
  {
    title: "湖人能否在下一场主场比赛中获胜？",
    description: "主场作战，核心后卫状态回暖。",
    resolutionRule: "NBA 官方比分页面为准，湖人胜出为 YES。",
    category: "SPORTS",
    closesInMs: 18 * HOUR,
    publishedAgoMs: 18 * HOUR,
    poolYes: 10200,
    poolNo: 9800,
    isAi: false,
  },
];

async function main() {
  const existing = await prisma.market.findMany({
    where: { title: { in: SEED_MARKETS.map((m) => m.title) } },
    select: { title: true },
  });
  const existingTitles = new Set(existing.map((e) => e.title));
  const toCreate = SEED_MARKETS.filter((m) => !existingTitles.has(m.title));

  console.log(`已有 ${existing.length} 个同名市场，将新建 ${toCreate.length} 个 ACTIVE 市场`);

  for (const m of toCreate) {
    await prisma.market.create({
      data: {
        title: m.title,
        description: m.description,
        resolutionRule: m.resolutionRule,
        category: m.category,
        aiBrief: m.aiBrief ?? null,
        status: "ACTIVE",
        closesAt: new Date(NOW + m.closesInMs),
        publishedAt: new Date(NOW - m.publishedAgoMs),
        poolYes: m.poolYes,
        poolNo: m.poolNo,
        seedAmount: m.poolYes + m.poolNo,
        draftSource: m.isAi ? "ai-seed" : null,
      },
    });
    console.log(`  + ${m.title}`);
  }

  const activeCount = await prisma.market.count({ where: { status: "ACTIVE" } });
  const total = await prisma.market.count();
  console.log(`✅ Done. ACTIVE markets: ${activeCount} / total: ${total}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
