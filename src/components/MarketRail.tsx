import Link from "next/link";
import { CATEGORY_LABELS, type CategoryKey } from "@/lib/market";

export interface RailItem {
  id: string;
  title: string;
  category: CategoryKey;
  isAi: boolean;
  hasParticipants: boolean;
  yesPct: number;
  noPct: number;
  yesOdd?: string;
  noOdd?: string;
  rightLabel: string;
  rightTone?: "neutral" | "warning";
}

interface RailProps {
  title: string;
  meta: string;
  hint: string;
  items: RailItem[];
  variant: "latest" | "closing";
}

export function MarketRail({ title, meta, hint, items, variant }: RailProps) {
  if (items.length === 0) return null;
  const cardWidth = variant === "latest" ? 220 : 200;
  return (
    <div className="mb-3.5">
      <div className="flex items-baseline justify-between px-[18px] pb-1.5">
        <div className="flex items-baseline gap-2">
          <span
            className="font-serif text-[15px] font-bold text-text"
            style={{ letterSpacing: "-0.3px" }}
          >
            {title}
          </span>
          <span className="text-[10.5px] text-sub font-mono">{meta}</span>
        </div>
        <span className="text-[11px] text-sub font-sans">{hint}</span>
      </div>
      <div
        className="flex gap-2 overflow-x-auto px-[18px] pb-1"
        style={{ scrollbarWidth: "none" }}
      >
        {items.map((it) => (
          <Link
            key={`${variant}-${it.id}`}
            href={`/market/${it.id}`}
            style={{ width: cardWidth }}
            className="shrink-0 p-2.5 bg-surface text-text rounded-xl border border-line font-sans flex flex-col gap-1.5 transition-all duration-150 hover:border-line-hard hover:shadow-sm active:scale-[0.985]"
          >
            <div className="flex items-center gap-1.5 text-[10.5px] text-sub">
              <span className="px-1.5 rounded-[3px] bg-chip text-text font-semibold">
                {CATEGORY_LABELS[it.category]}
              </span>
              {it.isAi && (
                <span className="font-bold text-text text-[10px]">AI</span>
              )}
              <span
                className={`ml-auto font-mono ${
                  it.rightTone === "warning" ? "text-no font-bold" : ""
                }`}
              >
                {it.rightTone === "warning" ? "● " : ""}
                {it.rightLabel}
              </span>
            </div>
            <div
              className="font-serif text-[13px] font-bold leading-[1.3] text-text line-clamp-2"
              style={{ letterSpacing: "-0.2px" }}
            >
              {it.title}
            </div>
            {it.hasParticipants ? (
              <div className="flex justify-between font-mono text-[10.5px]">
                <span className="text-yes font-bold">
                  YES {it.yesPct}%{it.yesOdd ? `·${it.yesOdd}` : ""}
                </span>
                <span className="text-no font-bold">
                  NO {it.noPct}%{it.noOdd ? `·${it.noOdd}` : ""}
                </span>
              </div>
            ) : (
              <div className="text-[10.5px] text-sub font-sans text-center py-0.5 border-t border-dashed border-line">
                暂无投注
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
