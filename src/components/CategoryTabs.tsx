import Link from "next/link";

const TABS: { id: string; label: string }[] = [
  { id: "recommend", label: "推荐" },
  { id: "hot", label: "热门" },
  { id: "FINANCE", label: "金融" },
  { id: "TECH", label: "科技" },
  { id: "ENTERTAINMENT", label: "娱乐" },
  { id: "SPORTS", label: "体育" },
  { id: "SOCIETY", label: "社会" },
  { id: "TRENDY", label: "潮玩" },
  { id: "OTHER", label: "其他" },
];

export function CategoryTabs({ active }: { active: string }) {
  return (
    <div className="border-b border-line bg-bg sticky top-0 z-[5]">
      <div
        className="flex gap-1 overflow-x-auto px-3"
        style={{ scrollbarWidth: "none" }}
      >
        {TABS.map((tab) => {
          const on = active === tab.id;
          const href = tab.id === "recommend" ? "/" : `/?cat=${tab.id}`;
          return (
            <Link
              key={tab.id}
              href={href}
              scroll={false}
              className={`relative px-2.5 py-3 whitespace-nowrap font-sans text-sm cursor-pointer ${
                on ? "font-bold text-text" : "font-medium text-sub"
              }`}
            >
              {tab.label}
              {on && (
                <div className="absolute left-2.5 right-2.5 bottom-1.5 h-[3px] bg-text rounded-sm" />
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
