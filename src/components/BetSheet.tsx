"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface BetSheetProps {
  marketId: string;
  marketTitle: string;
  yesOdd: string;
  noOdd: string;
  isLoggedIn: boolean;
  isFrozen: boolean;
  freezeReason?: string;
  userBalance: number;
  betCap: number;
}

export function BetSheet(props: BetSheetProps) {
  const router = useRouter();
  const [step, setStep] = useState<"view" | "confirm" | "done">("view");
  const [side, setSide] = useState<"YES" | "NO" | null>(null);
  const [stake, setStake] = useState<number>(200);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<{
    sharesOut: number;
    newBalance: number;
  } | null>(null);

  const cap = Math.floor(props.betCap);
  const odd = side === "YES" ? props.yesOdd : props.noOdd;
  const payout = useMemo(
    () => (side ? Math.round(stake * Number(odd)) : 0),
    [side, stake, odd],
  );

  const presets = useMemo(() => {
    const out: { label: string; v: number }[] = [];
    for (const v of [100, 200, 400]) {
      if (v <= cap) out.push({ label: String(v), v });
    }
    if (cap > 0) out.push({ label: "MAX", v: cap });
    return out;
  }, [cap]);

  const startBet = (s: "YES" | "NO") => {
    if (!props.isLoggedIn) {
      router.push("/login");
      return;
    }
    if (props.isFrozen || cap < 1) return;
    setSide(s);
    setStake(Math.min(200, cap));
    setStep("confirm");
    setError(null);
  };

  async function submit() {
    if (!side || loading) return;
    if (stake < 1 || stake > cap) {
      setError(`下注金额需在 1 ~ ${cap} 之间`);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/trade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          marketId: props.marketId,
          side,
          amountIn: stake,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "下注失败");
        setLoading(false);
        return;
      }
      setDone({ sharesOut: data.sharesOut, newBalance: data.newBalance });
      setStep("done");
      setLoading(false);
    } catch {
      setError("网络错误");
      setLoading(false);
    }
  }

  function closeDone() {
    router.push("/");
    router.refresh();
  }

  // ==== bottom CTA in view step ====
  const cta = (
    <div className="px-4 pt-3 pb-7 bg-bg border-t border-line">
      {!props.isLoggedIn ? (
        <Link
          href="/login"
          className="block w-full py-3.5 rounded-xl bg-text text-bg text-center font-bold text-[15px]"
        >
          登录后下注
        </Link>
      ) : props.isFrozen ? (
        <div className="text-center py-3.5 rounded-xl bg-chip text-sub font-semibold">
          {props.freezeReason ?? "已冻结，无法下注"}
        </div>
      ) : cap < 1 ? (
        <div className="text-center py-3.5 rounded-xl bg-chip text-sub font-semibold">
          余额不足或已达单市场上限
        </div>
      ) : (
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => startBet("YES")}
            className="flex-1 py-3.5 rounded-xl bg-yes text-bg font-bold text-[15px]"
          >
            下注 YES · ×{props.yesOdd}
          </button>
          <button
            type="button"
            onClick={() => startBet("NO")}
            className="flex-1 py-3.5 rounded-xl bg-no text-bg font-bold text-[15px]"
          >
            下注 NO · ×{props.noOdd}
          </button>
        </div>
      )}
    </div>
  );

  return (
    <>
      {step === "view" && cta}

      {step === "confirm" && side && (
        <div
          className="fixed inset-0 bg-black/40 z-30 flex items-end justify-center"
          onClick={() => !loading && setStep("view")}
        >
          <div
            className="w-full max-w-[420px] bg-bg rounded-t-[22px] px-[18px] pt-5 pb-8 font-sans"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-9 h-1 rounded-sm bg-line mx-auto mb-3.5" />
            <div
              className="font-serif text-[18px] font-bold text-text"
              style={{ letterSpacing: "-0.2px" }}
            >
              确认下注 ·{" "}
              <span className={side === "YES" ? "text-yes" : "text-no"}>
                {side}
              </span>
            </div>
            <div className="text-[12px] text-sub mt-1 mb-3.5 line-clamp-2">
              {props.marketTitle}
            </div>

            <div className="p-3.5 bg-surface border border-line rounded-[14px] mb-3">
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-[12px] text-sub">投注金额</span>
                <span className="text-[11px] text-mut font-mono">
                  余额 {props.userBalance.toLocaleString()}P · 上限 {cap}P
                </span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <input
                  type="number"
                  min={1}
                  max={cap}
                  value={stake}
                  onChange={(e) => {
                    const n = Number(e.target.value);
                    setStake(Number.isFinite(n) ? n : 0);
                  }}
                  className="font-mono text-[32px] font-bold text-text bg-transparent outline-none w-32"
                  style={{ letterSpacing: "-0.5px" }}
                />
                <span className="text-[14px] text-sub font-semibold">P</span>
              </div>
              {presets.length > 0 && (
                <div className="flex gap-1.5 mt-3">
                  {presets.map((p) => {
                    const on = stake === p.v;
                    return (
                      <button
                        key={p.label}
                        type="button"
                        onClick={() => setStake(p.v)}
                        className={`flex-1 py-2 rounded-lg text-[12px] font-semibold ${
                          on ? "bg-text text-bg" : "bg-chip text-text"
                        }`}
                      >
                        {p.label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            <div
              className={`p-3.5 rounded-[14px] mb-3.5 ${
                side === "YES" ? "bg-yes-soft" : "bg-no-soft"
              }`}
            >
              <div className="flex justify-between text-[12px] text-sub mb-1">
                <span>预测正确返还</span>
                <span className="font-mono">×{odd}</span>
              </div>
              <div
                className={`font-mono text-[26px] font-bold ${
                  side === "YES" ? "text-yes" : "text-no"
                }`}
                style={{ letterSpacing: "-0.5px" }}
              >
                +{payout}
                <span className="text-[12px] text-sub ml-1">P</span>
              </div>
              <div className="text-[11px] text-sub mt-1">
                预测错误将损失 {stake}P
              </div>
            </div>

            {error && (
              <div className="text-[12px] text-no bg-no-bg py-2 px-3 rounded mb-3">
                {error}
              </div>
            )}

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => !loading && setStep("view")}
                disabled={loading}
                className="px-5 py-3.5 rounded-xl bg-chip text-text font-semibold text-[14px] disabled:opacity-50"
              >
                取消
              </button>
              <button
                type="button"
                onClick={submit}
                disabled={loading || stake < 1 || stake > cap}
                className={`flex-1 py-3.5 rounded-xl text-bg font-bold text-[15px] disabled:opacity-50 ${
                  side === "YES" ? "bg-yes" : "bg-no"
                }`}
              >
                {loading ? "提交中…" : `确认下注 ${stake}P`}
              </button>
            </div>
          </div>
        </div>
      )}

      {step === "done" && done && (
        <div className="fixed inset-0 bg-black/50 z-30 flex items-center justify-center px-4">
          <div className="w-full max-w-sm bg-bg rounded-[20px] px-5 py-7 text-center font-sans">
            <div className="text-[34px] mb-1.5">✓</div>
            <div
              className="font-serif text-[19px] font-bold text-text mb-1"
              style={{ letterSpacing: "-0.2px" }}
            >
              下注成功
            </div>
            <div className="text-[12px] text-sub mb-3.5">
              获得 {done.sharesOut.toFixed(2)} 份 {side} · 余额 {Math.floor(
                done.newBalance,
              ).toLocaleString()}P
            </div>
            <div className="p-3 bg-surface border border-line rounded-xl text-[12px] text-sub leading-[1.5] mb-4">
              结算后赢家按 1 积分/份兑付。可在
              <b className="text-text">「我的」</b>
              查看持仓与历史。
            </div>
            <button
              type="button"
              onClick={closeDone}
              className="w-full py-3 rounded-[10px] bg-text text-bg font-semibold text-[14px]"
            >
              返回广场继续
            </button>
          </div>
        </div>
      )}
    </>
  );
}
