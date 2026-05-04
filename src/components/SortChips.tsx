import Link from "next/link";

const SORTS = [
  { k: "hot", label: "热度" },
  { k: "volume", label: "成交量" },
  { k: "closing", label: "即将截止" },
  { k: "new", label: "最新" },
];

export function SortChips({
  active = "hot",
  cat = "recommend",
}: {
  active?: string;
  cat?: string;
}) {
  return (
    <div
      className="flex gap-1.5 px-[18px] pb-3 overflow-x-auto"
      style={{ scrollbarWidth: "none" }}
    >
      {SORTS.map((s) => {
        const on = active === s.k;
        const params = new URLSearchParams();
        if (cat !== "recommend") params.set("cat", cat);
        if (s.k !== "hot") params.set("sort", s.k);
        const qs = params.toString();
        const href = qs ? `/?${qs}` : "/";
        return (
          <Link
            key={s.k}
            href={href}
            scroll={false}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold shrink-0 ${
              on
                ? "bg-text text-bg border-0"
                : "bg-transparent text-sub border border-line-hard"
            }`}
          >
            {s.label}
          </Link>
        );
      })}
    </div>
  );
}
