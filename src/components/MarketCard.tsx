import Link from "next/link";
import { CATEGORY_LABELS, type CategoryKey } from "@/lib/market";

export interface MarketCardData {
  id: string;
  title: string;
  description: string;
  category: CategoryKey;
  isAi: boolean;
  isHot: boolean;
  hasPosition: boolean;
  deadline: string;
  yesPct: number;
  noPct: number;
  yesOdd: string;
  noOdd: string;
}

function OptionPill({
  side,
  pct,
  odd,
}: {
  side: "YES" | "NO";
  pct: number;
  odd: string;
}) {
  const isYes = side === "YES";
  return (
    <div
      className={`flex-1 px-3.5 py-3 rounded-xl flex items-baseline justify-between font-sans ${
        isYes ? "bg-yes-bg" : "bg-no-bg"
      }`}
    >
      <span
        className={`text-xs font-bold tracking-[0.5px] ${isYes ? "text-yes" : "text-no"}`}
      >
        {side}
      </span>
      <span>
        <span
          className={`text-[18px] font-bold ${isYes ? "text-yes" : "text-no"}`}
          style={{ letterSpacing: "-0.3px" }}
        >
          {pct}
          <span className="text-[11px]">%</span>
        </span>
        <span
          className={`text-[10px] ml-1 ${isYes ? "text-yes" : "text-no"} opacity-70`}
        >
          ×{odd}
        </span>
      </span>
    </div>
  );
}

export function MarketCard({ m }: { m: MarketCardData }) {
  return (
    <Link
      href={`/market/${m.id}`}
      className="block mx-[18px] mb-3.5 p-4 bg-surface rounded-2xl border border-line font-sans"
    >
      <div className="flex items-center gap-2 mb-2.5 text-[11px] text-sub">
        <span className="px-2 py-0.5 bg-chip rounded text-text font-semibold">
          {CATEGORY_LABELS[m.category]}
        </span>
        {m.isAi && (
          <span className="px-2 py-0.5 rounded border border-line-hard text-text font-bold text-[10px]">
            AI 设局
          </span>
        )}
        {m.isHot && (
          <span className="text-no font-semibold text-[11px]">🔥 热议</span>
        )}
        {m.hasPosition && (
          <span className="px-2 py-0.5 rounded bg-yes-bg text-yes font-bold text-[10px]">
            已下注
          </span>
        )}
        <span className="ml-auto font-mono">{m.deadline}</span>
      </div>
      <div
        className="font-serif text-[19px] font-bold leading-[1.32] text-text mb-1.5"
        style={{ letterSpacing: "-0.3px" }}
      >
        {m.title}
      </div>
      <div className="text-[13px] text-sub leading-[1.5] mb-3.5 line-clamp-2">
        {m.description}
      </div>
      <div className="flex gap-2">
        <OptionPill side="YES" pct={m.yesPct} odd={m.yesOdd} />
        <OptionPill side="NO" pct={m.noPct} odd={m.noOdd} />
      </div>
    </Link>
  );
}
