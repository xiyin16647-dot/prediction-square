"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Props {
  marketId: string;
  status: string;
  positionCount: number;
}

export function MarketActions({ marketId, status, positionCount }: Props) {
  const router = useRouter();
  const [outcome, setOutcome] = useState<"YES" | "NO" | "UNKNOWN">("YES");
  const [loading, setLoading] = useState<null | "cancel" | "resolve">(null);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<string | null>(null);

  const isTerminal = status === "RESOLVED" || status === "CANCELLED";

  async function call(path: "cancel" | "resolve") {
    const msg =
      path === "cancel"
        ? `确认下架该市场？将按公允价值退款给 ${positionCount} 个持仓用户`
        : `确认结算 outcome = ${outcome}？将按 1 积分/中奖份额赔付`;
    if (!confirm(msg)) return;
    setLoading(path);
    setError(null);
    try {
      const res = await fetch(`/api/admin/markets/${marketId}/${path}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(path === "resolve" ? { outcome } : {}),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "操作失败");
        setLoading(null);
        return;
      }
      setDone(path === "cancel" ? "已下架并退款" : `已结算（${outcome}）`);
      setLoading(null);
      router.refresh();
    } catch {
      setError("网络错误");
      setLoading(null);
    }
  }

  if (isTerminal) {
    return (
      <div className="text-[13px] text-admin-sub bg-admin-surface-alt rounded p-3 text-center">
        市场已{status === "RESOLVED" ? "结算" : "下架"}，无操作可执行
      </div>
    );
  }

  if (done) {
    return (
      <div className="bg-admin-ok-bg text-admin-ok p-3 rounded text-center font-semibold text-[13px]">
        ✓ {done}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div>
        <div className="text-[12px] text-admin-sub font-semibold mb-2">
          结算结果
        </div>
        <div className="grid grid-cols-3 gap-1.5 mb-2.5">
          {(["YES", "NO", "UNKNOWN"] as const).map((o) => (
            <button
              key={o}
              type="button"
              onClick={() => setOutcome(o)}
              className={`py-2 rounded text-[12px] font-semibold ${
                outcome === o
                  ? "bg-admin-primary text-white"
                  : "bg-admin-surface-alt text-admin-text-mid"
              }`}
            >
              {o}
            </button>
          ))}
        </div>
        <button
          type="button"
          onClick={() => call("resolve")}
          disabled={loading !== null}
          className="w-full py-2.5 bg-admin-ok text-white text-[13px] font-semibold rounded disabled:opacity-50"
        >
          {loading === "resolve" ? "结算中…" : `✓ 确认结算（${outcome}）`}
        </button>
        <div className="text-[11px] text-admin-mut mt-1.5 leading-relaxed">
          赢方按 1 积分/份赔付，输方归零。UNKNOWN 全部按 0.5 赔付。
        </div>
      </div>
      <div className="border-t border-admin-line-soft pt-3">
        <button
          type="button"
          onClick={() => call("cancel")}
          disabled={loading !== null}
          className="w-full py-2.5 bg-admin-danger text-white text-[13px] font-semibold rounded disabled:opacity-50"
        >
          {loading === "cancel" ? "下架中…" : "✕ 下架并退款"}
        </button>
        <div className="text-[11px] text-admin-mut mt-1.5 leading-relaxed">
          所有持仓按当前公允价（份额×当前价）退款。
        </div>
      </div>
      {error && (
        <div className="text-[12px] text-admin-danger bg-admin-danger-bg p-2 rounded">
          {error}
        </div>
      )}
    </div>
  );
}
