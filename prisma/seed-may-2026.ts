/**
 * 2026-05-08 批量新增 9 个市场（科创板/黄金/石油）
 *
 * 跑法：
 *   set -a && source .env && set +a && npx tsx prisma/seed-may-2026.ts
 *
 * 安全约束：
 *   1. 仅做 INSERT，不删不改任何已有市场
 *   2. 脚本可重复跑（按 title 去重）
 *   3. seedAmount = 10000（与现网一致）
 *   4. status=ACTIVE，publishedAt=现在
 *   5. 时间均为 UTC，对应北京时间见每条注释
 */

import { prisma } from "../src/lib/db";

const SEED = 10000;
const CREATED_BY = "seed-2026-05-08-v1";

type Cat =
  | "FINANCE"
  | "TECH"
  | "ENTERTAINMENT"
  | "SPORTS"
  | "SOCIETY"
  | "TRENDY"
  | "OTHER";

interface MarketSeed {
  title: string;
  category: Cat;
  description: string;
  aiBrief: string;
  resolutionRule: string;
  closesAtUtc: string;
}

const rule = (lines: string[]) => lines.join("\n");

const markets: MarketSeed[] = [
  // ① 科创 50 — 北京 2026-05-30 15:00
  {
    title: "科创 50 指数 5 月内能否突破 1800 点",
    category: "TECH",
    description:
      "4 月单月科创 50 大涨超 25%，5/6 单日涨 5.47%，5/8 已站上 1640 点。算力租赁、存储芯片、AI 芯片三大主线接力共振，半导体超级周期叠加 DRAM/NAND 涨价预期。但前期涨幅过大，机构资金可能阶段性获利兑现，1800 点是关键阻力位。",
    aiBrief:
      "当前距目标约 +9.7%，月内能否触及取决于 AI/半导体主线能否延续，预期 YES 概率 40-50%。",
    resolutionRule: rule([
      "结算条件：5 月任一交易日（5/9—5/30）科创 50 指数（000688.SH）盘中或收盘价 ≥ 1800.00 → YES；否则 NO。",
      "结算源（主）：上海证券交易所官方指数行情",
      "结算源（备）：东方财富、新浪财经、同花顺一致数据",
      "基准价：以 5/8 收盘价入库（运营上线前核实并冻结）",
      "异常处理：若 5 月剩余交易日不足 5 天（极端事件），市场作废按公允价值退还",
    ]),
    closesAtUtc: "2026-05-30T07:00:00.000Z",
  },

  // ② 中芯国际市值 — 北京 2026-05-30 15:00
  {
    title: "中芯国际 5 月底总市值能否突破 1.1 万亿",
    category: "TECH",
    description:
      "中芯国际 5/6 收盘 123.1 元，市值约 9800 亿。AI 算力需求爆发推动晶圆代工产能利用率维持高位，2025 年净利润同比 +36.29%，2026 年指引「销售收入增幅高于可比同业平均」。冲破 1.1 万亿需股价再涨约 12%（约 138 元），仍低于 52 周高点 153 元。",
    aiBrief:
      "当前距目标约 +12% 涨幅，是「看势头能否延续」型市场，预期 YES 概率 40-50%。",
    resolutionRule: rule([
      "结算条件：5/30 收盘后，中芯国际（688981.SH）A 股总市值 ≥ 11,000 亿元 → YES；否则 NO。",
      "结算源（主）：上交所收盘价 × 公司公告总股本",
      "结算源（备）：东方财富、雪球总市值数据",
      "基准价：以 5/8 收盘市值入库（运营手动确认）",
      "异常处理：若 5/30 当日停牌，用前一交易日数据替代；若发生重大股本变动（送转/增发），标记重新评估",
    ]),
    closesAtUtc: "2026-05-30T07:00:00.000Z",
  },

  // ③ 寒武纪历史新高 — 北京 2026-06-30 15:00
  {
    title: "寒武纪 6 月内能否再创历史新高",
    category: "TECH",
    description:
      "寒武纪 4 月底重夺 A 股「股王」位置，AI 算力主线持续。但前期已有较大涨幅，存在获利回吐压力。6 月会迎来 Q2 业绩前瞻和 AI 芯片产业链中报数据，是关键催化点。",
    aiBrief:
      "股王地位 + 历史新高的双重叙事，是最有故事性的市场之一。",
    resolutionRule: rule([
      "结算条件：6 月任一交易日（6/2—6/30）寒武纪（688256.SH）盘中最高价 > 当前历史最高盘中价 → YES；否则 NO。",
      "结算源：上交所盘中行情数据",
      "基准价：以 5/31 24:00 之前的历史最高盘中价为基准（运营 6/1 凌晨冻结写入）",
      "复权处理：如发生分红/送转，按前复权计算",
      "排除项：异常一字板触及不计入",
      "异常处理：若 6 月停牌天数 > 3，市场作废按公允价值退还",
    ]),
    closesAtUtc: "2026-06-30T07:00:00.000Z",
  },

  // ④ COMEX 黄金 — 北京 2026-06-30 03:00 = UTC 2026-06-29 19:00
  {
    title: "COMEX 黄金 6 月底前能否突破 5000 美元/盎司",
    category: "FINANCE",
    description:
      "COMEX 黄金 5/8 主力报 4733 美元，已突破 4700 关口。美伊冲突反复 + 美联储宽松预期 + 央行持续购金（中国 4 月连续第 18 个月增持）三大利好支撑高位，但短期超买信号明显，5000 是关键心理关口。",
    aiBrief:
      "停火达成则金价可能快速回调，紧张升级则可能突破。当前 4733 距 5000 仅 +5.6%，但需要持续动力。",
    resolutionRule: rule([
      "结算条件：截止前 COMEX 黄金主力合约盘中最高价 ≥ 5000.00 美元/盎司 → YES；否则 NO。",
      "结算源（主）：CME 官方期货行情",
      "结算源（备）：Investing.com、汇通财经、东方财富一致数据",
      "基准价：以 4/30 收盘价入库",
      "排除项：盘后电子盘异常价格若被交易所撤销则不计入",
      "异常处理：若发生交易所重大停牌或熔断，市场作废",
    ]),
    closesAtUtc: "2026-06-29T19:00:00.000Z",
  },

  // ⑤ 沪金主力 — 北京 2026-05-30 15:00
  {
    title: "沪金主力合约 5 月底能否站上 1100 元/克",
    category: "FINANCE",
    description:
      "沪金主力 5/6 报 1026.46 元/克，单日涨 2.27%。美元走软 + 美联储新权力架构（沃什接任）+ 地缘政治三线共振推动金价。要冲破 1100 需再涨约 7%。",
    aiBrief:
      "月内单边走势难以保证，预期 YES 概率 40-50%。",
    resolutionRule: rule([
      "结算条件：5/30 沪金主力合约（AU2606 或当时主力合约）收盘价 ≥ 1100.00 元/克 → YES；否则 NO。",
      "结算源（主）：上海期货交易所官方收盘价",
      "结算源（备）：东方财富、金投网、汇通财经",
      "基准价：以 4/30 收盘价入库",
      "主力合约切换：以 5/30 当日「主力合约」定义为准（成交量最大合约）",
      "异常处理：若交易所暂停沪金交易，市场作废",
    ]),
    closesAtUtc: "2026-05-30T07:00:00.000Z",
  },

  // ⑥ 黄金 ETF 涨幅 — 北京 2026-05-30 15:00
  {
    title: "黄金 ETF（518880）5 月涨幅能否超 10%",
    category: "FINANCE",
    description:
      "黄金 ETF（518880）跟踪沪金价格，5 月初已伴随沪金创历史新高。要月度涨幅破 10%，需要金价继续上行。当前金价高位 + 短期超买，月度 +10% 既不容易也不夸张。",
    aiBrief:
      "把门槛从 5% 提到 10% 后，从「几乎必然 YES」变成有难度的目标。",
    resolutionRule: rule([
      "结算条件：(5/30 收盘价 − 4/30 收盘价) / 4/30 收盘价 ≥ 10.00% → YES；否则 NO。",
      "结算源：上交所 ETF 收盘价数据",
      "基准价：以 4/30 收盘价入库",
      "复权处理：如 5 月发生分红除权，按前复权处理",
      "异常处理：若 ETF 暂停交易 > 3 天，市场作废",
    ]),
    closesAtUtc: "2026-05-30T07:00:00.000Z",
  },

  // ⑦ 布伦特原油 — 北京 2026-05-30 23:00 = UTC 15:00
  {
    title: "布伦特原油 5 月底能否站上 110 美元",
    category: "FINANCE",
    description:
      "布伦特 5/7-5/8 在 96.9-101 美元间剧烈震荡。美伊和平协议预期主导短期方向：协议达成则油价回落 80-90，谈判破裂则可能突破 110。高盛预测如霍尔木兹封锁延续，2026 全年布伦特均价或超 100 美元。",
    aiBrief:
      "结果几乎完全取决于美伊冲突走向，是地缘事件驱动型市场。",
    resolutionRule: rule([
      "结算条件：5 月任一交易日布伦特原油主力合约盘中最高价 ≥ 110.00 美元/桶 → YES；否则 NO。",
      "结算源（主）：ICE 官方价格",
      "结算源（备）：Investing.com、Trading Economics",
      "基准价：以 4/30 收盘价入库",
      "排除项：电子盘闪崩价格若被交易所撤销则不计入",
      "异常处理：若霍尔木兹完全关闭导致 ICE 暂停，市场作废按公允价值退还",
    ]),
    closesAtUtc: "2026-05-30T15:00:00.000Z",
  },

  // ⑧ OPEC+ 减产 — 北京 2026-06-05 18:00 = UTC 10:00
  {
    title: "OPEC+ 6 月会议是否决定再次减产",
    category: "FINANCE",
    description:
      "OPEC+ 在 5 月内已小幅增产以平抑美伊冲突推升的油价。6 月会议是关键时间点：若届时油价回落（停火达成），OPEC+ 可能转向减产保价；若油价仍高位，则维持现有产量。机构观点分歧大。",
    aiBrief:
      "政策事件型市场，结果硬数据驱动，无歧义。是 Polymarket 风格的优质市场。",
    resolutionRule: rule([
      "结算条件：6/5 18:00（北京）前，OPEC+ 官方公告中明确包含「在原有产量基础上新增减产」字样 → YES；否则 NO。",
      "结算源（主）：OPEC 官方网站新闻稿",
      "结算源（备）：路透、彭博、新华社、华尔街日报压倒性媒体共识",
      "关键定义：「新增减产」= 在 5 月已宣布的产量基础上进一步降低配额；「延长现有减产」不算 YES（这只是维持现状）",
      "异常处理：若会议延期，顺延至实际公告日；若取消，结算为 NO",
    ]),
    closesAtUtc: "2026-06-05T10:00:00.000Z",
  },

  // ⑨ 中石油 — 北京 2026-05-30 15:00
  {
    title: "中石油 A 股 5 月底股价能否突破 13 元",
    category: "FINANCE",
    description:
      "中石油（601857）5/8 报价 11.12 元，日内 -1.33%。5/6 油气板块整体调整反映停火预期下油价担忧。但若美伊谈判破裂 + 油价反弹，中石油作为权重股有上行动力。52 周区间 7.33-13.69，13 元接近年内高点。",
    aiBrief:
      "当前 11.12 元，距 13 元需 +16.9%，依赖油价走势，月内触及难度较大但不排除地缘事件驱动。",
    resolutionRule: rule([
      "结算条件：5/30 中国石油（601857.SH）A 股收盘价 ≥ 13.00 元 → YES；否则 NO。",
      "结算源（主）：上交所官方收盘价",
      "结算源（备）：东方财富、新浪财经、同花顺",
      "基准价：以 4/30 收盘价入库（运营务必上线前确认实时价）",
      "复权处理：如 5 月发生分红除权，按前复权计算",
      "异常处理：若停牌，用最近交易日数据替代",
    ]),
    closesAtUtc: "2026-05-30T07:00:00.000Z",
  },
];

async function main() {
  console.log(`本批共 ${markets.length} 个市场，先做去重检查...`);

  // 按 title 去重，避免重复跑导致重复市场
  const existingTitles = new Set(
    (
      await prisma.market.findMany({
        where: { title: { in: markets.map((m) => m.title) } },
        select: { title: true },
      })
    ).map((r) => r.title),
  );

  const toInsert = markets.filter((m) => !existingTitles.has(m.title));
  const skipped = markets.filter((m) => existingTitles.has(m.title));

  if (skipped.length > 0) {
    console.log(`\n跳过已存在的 ${skipped.length} 个：`);
    for (const m of skipped) console.log(`  - ${m.title}`);
  }

  if (toInsert.length === 0) {
    console.log("\n没有新市场需要插入。");
    await prisma.$disconnect();
    return;
  }

  console.log(`\n准备插入 ${toInsert.length} 个新市场...\n`);
  let i = 0;
  for (const m of toInsert) {
    i++;
    const created = await prisma.market.create({
      data: {
        title: m.title,
        category: m.category,
        description: m.description,
        aiBrief: m.aiBrief,
        resolutionRule: m.resolutionRule,
        closesAt: new Date(m.closesAtUtc),
        status: "ACTIVE",
        publishedAt: new Date(),
        poolYes: SEED,
        poolNo: SEED,
        seedAmount: SEED,
        createdBy: CREATED_BY,
      },
    });
    console.log(
      `[${i}/${toInsert.length}] ✓ ${created.id}  ${created.title}`,
    );
  }

  console.log(`\n✓ 完成。新增 ${toInsert.length} 个市场，跳过 ${skipped.length} 个。`);
  await prisma.$disconnect();
}

main().catch(async (e) => {
  console.error("✗ 失败：", e);
  await prisma.$disconnect();
  process.exit(1);
});
