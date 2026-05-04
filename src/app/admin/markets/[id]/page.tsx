import Link from "next/link";
import { redirect, notFound } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
import { MarketActions } from "@/components/admin/MarketActions";
import { getCurrentAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/db";
import {
  CATEGORY_LABELS,
  type CategoryKey,
  poolToPrice,
  pctOf,
} from "@/lib/market";

const STATUS_LABELS: Record<string, string> = {
  DRAFT: "草稿",
  ACTIVE: "进行中",
  FROZEN: "冻结",
  RESOLVING: "待结算",
  RESOLVED: "已结算",
  CANCELLED: "已下架",
};

const STATUS_PILL: Record<string, string> = {
  DRAFT: "bg-admin-surface-alt text-admin-sub",
  ACTIVE: "bg-admin-ok-bg text-admin-ok",
  FROZEN: "bg-admin-warn-bg text-admin-warn",
  RESOLVING: "bg-admin-info-bg text-admin-info",
  RESOLVED: "bg-admin-surface-alt text-admin-text-mid",
  CANCELLED: "bg-admin-danger-bg text-admin-danger",
};

function fmt(d: Date | null): string {
  if (!d) return "—";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default async function AdminMarketDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  const { id } = await params;
  const market = await prisma.market.findUnique({ where: { id } });
  if (!market) notFound();

  const positionsCount = await prisma.position.count({
    where: {
      marketId: id,
      OR: [{ yesShares: { gt: 0 } }, { noShares: { gt: 0 } }],
    },
  });
  const tradesCount = await prisma.trade.count({ where: { marketId: id } });

  const { yesPrice, noPrice } = poolToPrice(market.poolYes, market.poolNo);
  const yesPct = pctOf(yesPrice);
  const noPct = pctOf(noPrice);

  return (
    <AdminShell
      active="events"
      crumbs={["事件管理", market.title.slice(0, 24)]}
      adminName={admin.username}
    >
      <div className="p-6">
        <Link
          href="/admin/markets"
          className="text-[13px] text-admin-sub hover:text-admin-text mb-3.5 inline-block"
        >
          ← 返回事件管理
        </Link>
        <div className="grid grid-cols-[1fr_320px] gap-5">
          <div className="space-y-4">
            <div className="bg-admin-surface border border-admin-line rounded-lg p-5">
              <div className="flex items-center gap-1.5 mb-3 flex-wrap">
                <span className="px-2 py-0.5 rounded bg-admin-surface-alt text-admin-text-mid text-[11px] font-semibold">
                  {CATEGORY_LABELS[market.category as CategoryKey]}
                </span>
                <span className="px-2 py-0.5 rounded border border-admin-line-hard text-admin-text-mid text-[11px] font-semibold">
                  {market.draftSource ? "AI 设局" : "管理员手建"}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                    STATUS_PILL[market.status]
                  }`}
                >
                  {STATUS_LABELS[market.status]}
                </span>
                {market.outcome && (
                  <span
                    className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                      market.outcome === "YES"
                        ? "bg-admin-ok-bg text-admin-ok"
                        : market.outcome === "NO"
                          ? "bg-admin-danger-bg text-admin-danger"
                          : "bg-admin-surface-alt text-admin-sub"
                    }`}
                  >
                    结果：{market.outcome}
                  </span>
                )}
                <span className="ml-auto text-[11px] text-admin-mut font-mono">
                  #{market.id.slice(-12)}
                </span>
              </div>
              <h1
                className="text-[20px] font-bold text-admin-text leading-snug mb-2.5"
                style={{ letterSpacing: "-0.3px" }}
              >
                {market.title}
              </h1>
              <p className="text-[13px] text-admin-text-mid leading-[1.65] mb-3 whitespace-pre-wrap">
                {market.description}
              </p>
              <div className="grid grid-cols-2 gap-2.5">
                <Field label="判定截止时间" value={fmt(market.closesAt)} mono />
                <Field label="发布时间" value={fmt(market.publishedAt)} mono />
                <Field
                  label="结算规则"
                  value={market.resolutionRule}
                  colSpan={2}
                />
                <Field label="结算时间" value={fmt(market.resolvedAt)} mono />
              </div>
            </div>

            <div className="bg-admin-surface border border-admin-line rounded-lg p-5">
              <div className="text-[12px] text-admin-sub font-semibold mb-3">
                市场状态
              </div>
              <div className="grid grid-cols-4 gap-2.5">
                <Stat label="YES 价" value={`${yesPct}%`} />
                <Stat label="NO 价" value={`${noPct}%`} />
                <Stat label="参与人数" value={positionsCount.toString()} />
                <Stat label="成交笔数" value={tradesCount.toString()} />
              </div>
              <div className="mt-3 pt-3 border-t border-admin-line-soft grid grid-cols-3 gap-2.5">
                <Stat
                  label="poolYes"
                  value={Number(market.poolYes.toString()).toFixed(2)}
                  mono
                />
                <Stat
                  label="poolNo"
                  value={Number(market.poolNo.toString()).toFixed(2)}
                  mono
                />
                <Stat
                  label="种子液"
                  value={Number(market.seedAmount.toString()).toFixed(0)}
                  mono
                />
              </div>
            </div>

            {market.aiBrief && (
              <div className="bg-admin-info-bg border border-admin-line rounded-lg p-5">
                <div className="text-[12px] font-bold text-admin-info mb-2">
                  AI 轻解读
                </div>
                <p className="text-[13px] text-admin-text leading-[1.65]">
                  {market.aiBrief}
                </p>
              </div>
            )}
          </div>

          <aside>
            <div className="bg-admin-surface border border-admin-line rounded-lg p-4 sticky top-4">
              <div className="text-[13px] font-bold text-admin-text mb-3">
                操作
              </div>
              <MarketActions
                marketId={market.id}
                status={market.status}
                positionCount={positionsCount}
              />
              <div className="pt-3 mt-3 border-t border-admin-line-soft text-[11px] text-admin-sub leading-relaxed">
                结算 / 下架是不可撤销操作。会立即变更所有持仓用户的余额并写入流水。
              </div>
            </div>
          </aside>
        </div>
      </div>
    </AdminShell>
  );
}

function Field({
  label,
  value,
  mono,
  colSpan,
}: {
  label: string;
  value: string;
  mono?: boolean;
  colSpan?: number;
}) {
  return (
    <div
      className={`p-2.5 bg-admin-bg rounded border border-admin-line-soft ${
        colSpan === 2 ? "col-span-2" : ""
      }`}
    >
      <div className="text-[11px] text-admin-sub mb-1 font-semibold">
        {label}
      </div>
      <div
        className={`text-[13px] font-semibold text-admin-text ${
          mono ? "font-mono" : ""
        }`}
      >
        {value}
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <div className="text-[11px] text-admin-sub mb-0.5">{label}</div>
      <div
        className={`text-[15px] font-bold text-admin-text ${
          mono ? "font-mono" : ""
        }`}
      >
        {value}
      </div>
    </div>
  );
}
