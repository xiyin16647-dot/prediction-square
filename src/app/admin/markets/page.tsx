import Link from "next/link";
import { redirect } from "next/navigation";
import { AdminShell } from "@/components/admin/AdminShell";
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

const STATUS_TABS = [
  { k: "all", l: "全部" },
  { k: "ACTIVE", l: "进行中" },
  { k: "FROZEN", l: "冻结" },
  { k: "RESOLVING", l: "待结算" },
  { k: "RESOLVED", l: "已结算" },
  { k: "CANCELLED", l: "已下架" },
  { k: "DRAFT", l: "草稿" },
] as const;

function formatDateTime(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export default async function AdminMarketsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const admin = await getCurrentAdmin();
  if (!admin) redirect("/admin/login");

  const { status = "all" } = await searchParams;

  const validStatus = STATUS_TABS.find((t) => t.k === status)?.k ?? "all";

  const markets = await prisma.market.findMany({
    where:
      validStatus === "all"
        ? {}
        : { status: validStatus as Exclude<typeof validStatus, "all"> },
    orderBy: { createdAt: "desc" },
  });

  const allCounts = await prisma.market.groupBy({
    by: ["status"],
    _count: { _all: true },
  });
  const totalCount = allCounts.reduce((sum, c) => sum + c._count._all, 0);
  const countMap = new Map(
    allCounts.map((c) => [c.status as string, c._count._all]),
  );

  return (
    <AdminShell
      active="events"
      crumbs={["事件管理"]}
      adminName={admin.username}
      rightAction={
        <Link
          href="/admin/markets/new"
          className="px-3.5 py-1.5 bg-admin-primary text-white text-[13px] font-semibold rounded hover:opacity-90"
        >
          + 手动建市场
        </Link>
      }
    >
      <div className="p-6">
        <div className="mb-5">
          <h1 className="text-xl font-bold text-admin-text">事件管理</h1>
          <p className="text-[13px] text-admin-sub mt-1">
            查看与管理所有市场，进行上下架、结算、退款操作
          </p>
        </div>

        <div className="flex gap-1 mb-4 flex-wrap">
          {STATUS_TABS.map((t) => {
            const on = validStatus === t.k;
            const count = t.k === "all" ? totalCount : countMap.get(t.k) ?? 0;
            return (
              <Link
                key={t.k}
                href={`/admin/markets?status=${t.k}`}
                className={`px-3 py-1.5 rounded text-[12.5px] font-semibold ${
                  on
                    ? "bg-admin-surface text-admin-text border border-admin-line-hard"
                    : "text-admin-sub hover:bg-admin-surface-alt"
                }`}
              >
                {t.l}{" "}
                <span className={on ? "text-admin-mut" : "text-admin-mut"}>
                  {count}
                </span>
              </Link>
            );
          })}
        </div>

        <div className="bg-admin-surface border border-admin-line rounded-lg overflow-hidden">
          <table className="w-full text-[13px]">
            <thead>
              <tr className="bg-admin-surface-alt border-b border-admin-line">
                <th className="px-3.5 py-2.5 text-left text-[11px] text-admin-sub font-semibold uppercase tracking-wider">
                  事件
                </th>
                <th className="px-3.5 py-2.5 text-left text-[11px] text-admin-sub font-semibold uppercase tracking-wider">
                  分类
                </th>
                <th className="px-3.5 py-2.5 text-left text-[11px] text-admin-sub font-semibold uppercase tracking-wider">
                  状态
                </th>
                <th className="px-3.5 py-2.5 text-left text-[11px] text-admin-sub font-semibold uppercase tracking-wider">
                  YES 价
                </th>
                <th className="px-3.5 py-2.5 text-left text-[11px] text-admin-sub font-semibold uppercase tracking-wider">
                  截止
                </th>
                <th className="px-3.5 py-2.5"></th>
              </tr>
            </thead>
            <tbody>
              {markets.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-3.5 py-12 text-center text-admin-sub"
                  >
                    暂无市场
                  </td>
                </tr>
              ) : (
                markets.map((m, i) => {
                  const { yesPrice } = poolToPrice(m.poolYes, m.poolNo);
                  const yesPct = pctOf(yesPrice);
                  return (
                    <tr
                      key={m.id}
                      className={i > 0 ? "border-t border-admin-line-soft" : ""}
                    >
                      <td className="px-3.5 py-3 max-w-[420px]">
                        <div className="font-semibold text-admin-text leading-snug truncate">
                          {m.title}
                        </div>
                        <div className="text-[11px] text-admin-mut mt-1 font-mono">
                          #{m.id.slice(-8)}
                          {m.draftSource ? " · AI" : " · 管理员手建"}
                        </div>
                      </td>
                      <td className="px-3.5 py-3">
                        <span className="px-2 py-0.5 rounded bg-admin-surface-alt text-admin-text-mid text-[11px] font-semibold">
                          {CATEGORY_LABELS[m.category as CategoryKey]}
                        </span>
                      </td>
                      <td className="px-3.5 py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                            STATUS_PILL[m.status]
                          }`}
                        >
                          {STATUS_LABELS[m.status]}
                        </span>
                      </td>
                      <td className="px-3.5 py-3 font-mono text-admin-text">
                        {yesPct}%
                      </td>
                      <td className="px-3.5 py-3 font-mono text-[12px] text-admin-sub whitespace-nowrap">
                        {formatDateTime(m.closesAt)}
                      </td>
                      <td className="px-3.5 py-3 text-right">
                        <Link
                          href={`/admin/markets/${m.id}`}
                          className="text-[12px] text-admin-text-mid hover:text-admin-text font-semibold"
                        >
                          管理 →
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminShell>
  );
}
