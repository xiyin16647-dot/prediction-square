import Link from "next/link";

const NAV: {
  id: string;
  label: string;
  href: string;
  count?: number | null;
  soon?: boolean;
}[] = [
  { id: "dash", label: "数据看板", href: "/admin/dashboard", soon: true },
  { id: "review", label: "事件审核", href: "/admin/review", count: 0, soon: true },
  { id: "events", label: "事件管理", href: "/admin/markets" },
  { id: "users", label: "用户管理", href: "/admin/users", soon: true },
  { id: "settings", label: "系统设置", href: "/admin/settings", soon: true },
];

interface Props {
  active: string;
  crumbs: string[];
  adminName: string;
  children: React.ReactNode;
  rightAction?: React.ReactNode;
}

export function AdminShell({
  active,
  crumbs,
  adminName,
  children,
  rightAction,
}: Props) {
  return (
    <div className="fixed inset-0 bg-admin-bg text-admin-text font-sans flex overflow-hidden">
      <aside className="w-[232px] bg-admin-surface border-r border-admin-line flex flex-col shrink-0">
        <div className="px-4 py-5 border-b border-admin-line-soft">
          <div
            className="text-[13.5px] font-bold text-admin-text"
            style={{ letterSpacing: "-0.2px" }}
          >
            Prediction Square
          </div>
          <div className="text-[11px] text-admin-sub mt-0.5">
            管理后台 · 先行版
          </div>
        </div>
        <nav className="flex-1 p-2 overflow-y-auto">
          {NAV.map((n) => {
            const isActive = n.id === active;
            const baseCls = `w-full flex items-center justify-between px-3 py-2.5 mb-px rounded text-[13px]`;
            if (n.soon) {
              return (
                <div
                  key={n.id}
                  className={`${baseCls} text-admin-mut cursor-not-allowed`}
                >
                  <span>{n.label}</span>
                  <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-admin-surface-alt text-admin-sub">
                    即将
                  </span>
                </div>
              );
            }
            return (
              <Link
                key={n.id}
                href={n.href}
                className={`${baseCls} ${
                  isActive
                    ? "bg-admin-surface-alt text-admin-text font-semibold"
                    : "text-admin-text-mid font-medium hover:bg-admin-surface-alt"
                }`}
              >
                <span>{n.label}</span>
                {n.count != null && (
                  <span className="text-[11px] px-1.5 py-0.5 rounded-full bg-admin-surface-alt text-admin-sub">
                    {n.count}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>
        <div className="p-3.5 border-t border-admin-line-soft flex items-center gap-2.5">
          <div className="size-7 rounded-full bg-admin-surface-alt flex items-center justify-center text-[12px] font-bold text-admin-text">
            {adminName[0]?.toUpperCase() ?? "A"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-[12.5px] font-semibold text-admin-text truncate">
              {adminName}
            </div>
            <div className="text-[11px] text-admin-sub">管理员</div>
          </div>
          <form action="/api/admin/logout" method="post">
            <button
              type="submit"
              className="text-[11px] text-admin-sub hover:text-admin-text"
            >
              退出
            </button>
          </form>
        </div>
      </aside>
      <div className="flex-1 flex flex-col min-w-0">
        <div className="h-14 px-5 border-b border-admin-line bg-admin-surface flex items-center gap-3.5 shrink-0">
          <div className="flex-1 flex items-center gap-1.5 text-[13px] text-admin-sub">
            {crumbs.map((c, i) => (
              <span
                key={i}
                className={
                  i === crumbs.length - 1
                    ? "text-admin-text font-semibold"
                    : ""
                }
              >
                {i > 0 && <span className="mx-1.5 text-admin-mut">/</span>}
                {c}
              </span>
            ))}
          </div>
          {rightAction}
        </div>
        <div className="flex-1 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
