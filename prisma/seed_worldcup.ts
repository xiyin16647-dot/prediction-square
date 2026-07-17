import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

// Add 2026 World Cup final markets. Idempotent: skip titles that already exist.
// Local + Vercel share the same Neon DB, so both update automatically.
const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const NOW = Date.now();
const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;
// Final is 2026-07-19 (Sun). Close market the day after the final.
const CLOSES_AT = new Date(NOW + 2 * DAY + 6 * HOUR);
const PUBLISHED_AGO = new Date(NOW - 1 * HOUR);

interface WcMarket {
  title: string;
  description: string;
  resolutionRule: string;
  poolYes: number; // yesPrice = poolNo / (poolYes+poolNo)
  poolNo: number;
  yesPct: number; // for logging
  aiBrief: string;
}

const MARKETS: WcMarket[] = [
  {
    title: "阿根廷能否卫冕 2026 世界杯冠军？",
    description:
      "2026 美加墨世界杯决赛：梅西率领的阿根廷（卫冕冠军）对阵西班牙。半决赛阿根廷 2:1 淘汰英格兰，状态火热。决赛 7 月 19 日于新泽西 MetLife 球场进行。",
    resolutionRule:
      "以 FIFA 官方决赛终场比分（含加时与点球）为准，阿根廷夺冠为 YES，否则为 NO。决赛时间：2026-07-19。",
    // target yesPrice ≈ 0.58 → poolNo/(poolYes+poolNo)=0.58
    poolYes: 8400,
    poolNo: 11600,
    yesPct: 58,
    aiBrief:
      "AI 综合：阿根廷卫冕冠军、半决赛 2:1 胜英格兰状态正佳，机构夺冠概率约 34–40%，略占优但决赛一场定胜负，存在较大不确定性。",
  },
  {
    title: "西班牙能否击败阿根廷夺得 2026 世界杯冠军？",
    description:
      "2026 美加墨世界杯决赛：西班牙对阵阿根廷。半决赛西班牙 2:0 淘汰法国，展现强大控制力。决赛 7 月 19 日于新泽西 MetLife 球场进行。",
    resolutionRule:
      "以 FIFA 官方决赛终场比分（含加时与点球）为准，西班牙夺冠为 YES，否则为 NO。决赛时间：2026-07-19。",
    // target yesPrice ≈ 0.42
    poolYes: 11600,
    poolNo: 8400,
    yesPct: 42,
    aiBrief:
      "AI 综合：西班牙半决赛 2:0 胜法国、控球与青训体系成熟，机构夺冠概率约 23–25%，决赛中略处下风但具备爆冷能力。",
  },
];

async function main() {
  const existing = await prisma.market.findMany({
    where: { title: { in: MARKETS.map((m) => m.title) } },
    select: { title: true, status: true },
  });
  const existingTitles = new Set(existing.map((e) => e.title));
  const toCreate = MARKETS.filter((m) => !existingTitles.has(m.title));

  console.log(`已存在 ${existing.length} 个世界杯同名市场，将新建 ${toCreate.length} 个`);
  for (const m of existing) console.log(`  · 已存在 [${m.status}] ${m.title}`);

  for (const m of toCreate) {
    await prisma.market.create({
      data: {
        title: m.title,
        description: m.description,
        resolutionRule: m.resolutionRule,
        category: "SPORTS",
        aiBrief: m.aiBrief,
        status: "ACTIVE",
        closesAt: CLOSES_AT,
        publishedAt: PUBLISHED_AGO,
        poolYes: m.poolYes,
        poolNo: m.poolNo,
        seedAmount: m.poolYes + m.poolNo,
        draftSource: "manual-worldcup",
      },
    });
    console.log(`  + [ACTIVE] YES≈${m.yesPct}% | ${m.title}`);
  }

  const active = await prisma.market.count({ where: { status: "ACTIVE" } });
  const sports = await prisma.market.count({
    where: { status: "ACTIVE", category: "SPORTS" },
  });
  console.log(`✅ Done. ACTIVE: ${active} total (SPORTS: ${sports})`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
