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
  hasParticipants: boolean;
  deadline: string;
  yesPct: number;
  noPct: number;
}

function OptionPill({
  side,
  pct,
}: {
  side: "YES" | "NO";
  pct: number;
}) {
  const isYes = side === "YES";
  return (
    <div
      className={`flex-1 px-3.5 py-3 rounded-xl flex items-baseline justify-between font-sans transition-all duration-150 group-hover:scale-[1.015] active:scale-[0.985] ${
        isYes
          ? "bg-yes-bg group-hover:ring-2 group-hover:ring-yes/30"
          : "bg-no-bg group-hover:ring-2 group-hover:ring-no/30"
      }`}
    >
      <span
        className={`text-xs font-bold tracking-[0.5px] ${isYes ? "text-yes" : "text-no"}`}
      >
        {side}
      </span>
      <span
        className={`text-[18px] font-bold ${isYes ? "text-yes" : "text-no"}`}
        style={{ letterSpacing: "-0.3px" }}
      >
        {pct}
        <span className="text-[11px]">%</span>
      </span>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="px-3.5 py-3 rounded-xl border border-dashed border-line-hard text-center text-[12px] text-sub font-sans transition-colors group-hover:border-text group-hover:text-text">
      暂无投注 · 抢首发 →
    </div>
  );
}

export function MarketCard({ m }: { m: MarketCardData }) {
  return (
    <Link
      href={`/market/${m.id}`}
      className="group block mx-[18px] mb-3.5 p-4 bg-surface rounded-2xl border border-line font-sans transition-all duration-150 hover:border-line-hard hover:shadow-md active:scale-[0.995]"
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
      {m.hasParticipants ? (
        <div className="flex gap-2">
          <OptionPill side="YES" pct={m.yesPct} />
          <OptionPill side="NO" pct={m.noPct} />
        </div>
      ) : (
        <EmptyState />
      )}
    </Link>
  );
}
