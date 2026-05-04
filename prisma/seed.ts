import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});
const prisma = new PrismaClient({ adapter });

const NOW = Date.now();
const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

interface SeedMarket {
  title: string;
  description: string;
  resolutionRule: string;
  category:
    | "FINANCE"
    | "TECH"
    | "ENTERTAINMENT"
    | "SPORTS"
    | "SOCIETY"
    | "TRENDY"
    | "OTHER";
  closesInMs: number;
  publishedAgoMs: number;
  poolYes: number;
  poolNo: number;
  isAi: boolean;
  aiBrief?: string;
}

const SEED_MARKETS: SeedMarket[] = [
  {
    title: "美联储 6 月议息会议是否会降息 25bp？",
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
    title: "BTC 是否在 6 月 30 日前突破 12 万美元？",
    description: "当前价 108,420 美元，距离目标 +10.7%。现货 ETF 资金近期净流入。",
    resolutionRule:
      "以 Coinbase 现货 BTC/USD 在 6 月 30 日 24:00 UTC 前任意时刻 ≥ 120,000 为 YES。",
    category: "FINANCE",
    closesInMs: 28 * DAY,
    publishedAgoMs: 6 * HOUR,
    poolYes: 14400,
    poolNo: 5600,
    isAi: false,
  },
  {
    title: "《长安二十四时》上映首周末票房是否破 6 亿？",
    description: "猫眼专业版预测区间 5.2–6.8 亿。开画口碑分化。",
    resolutionRule: "猫眼专业版口径，首周末（周五至周日）累计票房 ≥ 6 亿为 YES。",
    category: "ENTERTAINMENT",
    closesInMs: 5 * DAY,
    publishedAgoMs: 12 * HOUR,
    poolYes: 9400,
    poolNo: 10600,
    isAi: true,
  },
  {
    title: "湖人能否在西部决赛抢七中获胜？",
    description: "主场作战，詹姆斯出战时间存疑。",
    resolutionRule: "NBA 官方比分页面为准，湖人胜出为 YES。",
    category: "SPORTS",
    closesInMs: 18 * HOUR,
    publishedAgoMs: 18 * HOUR,
    poolYes: 10200,
    poolNo: 9800,
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
    title: "5 月份全国出生人口是否超过 80 万？",
    description: "国家统计局数据预计 6 月中旬公布。",
    resolutionRule: "国家统计局公布的 5 月出生人口 ≥ 80 万为 YES。",
    category: "SOCIETY",
    closesInMs: 20 * DAY,
    publishedAgoMs: 1 * DAY,
    poolYes: 13000,
    poolNo: 7000,
    isAi: false,
  },
];

async function main() {
  await prisma.market.deleteMany({});
  console.log("已清空旧市场，开始种子注入...");

  for (const m of SEED_MARKETS) {
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
  }

  const total = await prisma.market.count();
  console.log(`✅ Seed 完成，当前市场总数：${total}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
