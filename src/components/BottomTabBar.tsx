import Link from "next/link";

export type TabKey = "square" | "rank" | "me";

const TABS: { k: TabKey; label: string; icon: string; href: string }[] = [
  { k: "square", label: "广场", icon: "⌂", href: "/" },
  { k: "rank", label: "排行", icon: "☰", href: "/rank" },
  { k: "me", label: "我的", icon: "◉", href: "/me" },
];

export function BottomTabBar({ active }: { active: TabKey }) {
  return (
    <div className="grid grid-cols-3 items-center border-t border-line bg-bg pt-2 pb-6 font-sans shrink-0">
      {TABS.map((it) => {
        const on = active === it.k;
        return (
          <Link
            key={it.k}
            href={it.href}
            className={`text-center ${on ? "text-text" : "text-sub"}`}
          >
            <div className="text-xl leading-none">{it.icon}</div>
            <div
              className={`text-[10px] mt-1 ${on ? "font-bold" : "font-medium"}`}
            >
              {it.label}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
