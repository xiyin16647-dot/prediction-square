"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface BetSheetProps {
  marketId: string;
  marketTitle: string;
  yesPrice: number;
  noPrice: number;
  isLoggedIn: boolean;
  isFrozen: boolean;
  freezeReason?: string;
  userBalance: number;
  betCap: number;
  userInvested: number;
  perMarketCap: number;
}

interface PreviewResult {
  sharesOut: number;
  avgPrice: number;
  slippage: number;
  priceBefore: number;
  priceAfter: number;
  payoutIfWin: number;
  pnlIfWin: number;
  pnlIfLose: number;
  _stake: number;
}

type SlippageLevel = "ok" | "warn" | "high" | "danger";

function slippageLevel(s: number): SlippageLevel {
  if (s < 0.02) return "ok";
  if (s < 0.05) return "warn";
  if (s < 0.1) return "high";
  return "danger";
}

const SLIPPAGE_TONE: Record<
  SlippageLevel,
  { color: string; label: string; hint?: string }
> = {
  ok: { color: "text-yes", label: "正常" },
  warn: { color: "text-gold", label: "略偏" },
  high: {
    color: "text-[#EA580C]",
    label: "偏高",
    hint: "成本偏高，建议减小金额或分批下注",
  },
  danger: {
    color: "text-no",
    label: "过大",
    hint: "你将以远高于市场共识价格成交，请谨慎",
  },
};

export function BetSheet(props: BetSheetProps) {
  const router = useRouter();
  const [step, setStep] = useState<"view" | "confirm" | "done">("view");
  const [side, setSide] = useState<"YES" | "NO" | null>(null);
  const [stake, setStake] = useState<number>(200);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<PreviewResult | null>(null);
  const [previewing, setPreviewing] = useState(false);
  const [showDangerConfirm, setShowDangerConfirm] = useState(false);
  const [done, setDone] = useState<{
    sharesOut: number;
    newBalance: number;
    avgPrice: number;
  } | null>(null);

  const cap = Math.floor(props.betCap);
  const sidePrice = side === "YES" ? props.yesPrice : props.noPrice;

  const presets = useMemo(() => {
    const out: { label: string; v: number }[] = [];
    for (const v of [50, 100, 500, 1000]) {
      if (v <= cap) out.push({ label: String(v), v });
    }
    return out;
  }, [cap]);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const previewSeqRef = useRef(0);

  useEffect(() => {
    if (step !== "confirm" || !side) return;
    if (stake < 1 || stake > cap) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const seq = ++previewSeqRef.current;
    debounceRef.current = setTimeout(async () => {
      setPreviewing(true);
      try {
        const res = await fetch("/api/trade/preview", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            marketId: props.marketId,
            side,
            amountIn: stake,
          }),
        });
        const data = await res.json();
        if (seq !== previewSeqRef.current) return;
        if (res.ok) {
          setPreview({ ...data, _stake: stake });
        } else {
          setPreview(null);
          setError(data.error ?? "预览失败");
        }
      } catch {
        if (seq === previewSeqRef.current) setPreview(null);
      } finally {
        if (seq === previewSeqRef.current) setPreviewing(false);
      }
    }, 200);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [stake, side, step, cap, props.marketId]);

  // 派生：仅当 preview 对应的 stake 与当前 stake 一致且在合法范围时才使用
  const livePreview =
    preview && stake >= 1 && stake <= cap && preview._stake === stake
      ? preview
      : null;

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
    setPreview(null);
  };

  async function submit() {
    if (!side || loading) return;
    if (stake < 1 || stake > cap) {
      setError(`下注金额需在 1 ~ ${cap} 之间`);
      return;
    }
    if (!livePreview) {
      setError("成交预览未就绪，请稍候再试");
      return;
    }
    if (
      slippageLevel(livePreview.slippage) === "danger" &&
      !showDangerConfirm
    ) {
      setShowDangerConfirm(true);
      return;
    }
    setShowDangerConfirm(false);
    setLoading(true);
    setError(null);

    // 实际滑点容忍 = 预览滑点 + 0.5% 缓冲，避免下单瞬间池子有人动导致拒绝
    const acceptedSlippage = Math.max(0.005, livePreview.slippage + 0.005);

    try {
      const res = await fetch("/api/trade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          marketId: props.marketId,
          side,
          amountIn: stake,
          acceptedSlippage,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "下注失败");
        setLoading(false);
        return;
      }
      setDone({
        sharesOut: data.sharesOut,
        newBalance: data.newBalance,
        avgPrice: data.avgPrice,
      });
      setStep("done");
      setLoading(false);
    } catch {
      setError("网络错误");
      setLoading(false);
    }
  }

  function closeDone() {
    setStep("view");
    setDone(null);
    setPreview(null);
    setSide(null);
    router.refresh();
  }

  // ==== 底部 CTA：买 YES 0.52 / 买 NO 0.48 ====
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
        <div className="flex gap-2.5">
          <button
            type="button"
            onClick={() => startBet("YES")}
            className="flex-1 min-h-[56px] rounded-xl bg-yes text-bg font-bold shadow-md transition-all duration-150 hover:brightness-110 hover:shadow-lg active:scale-[0.96] active:shadow-sm flex flex-col items-center justify-center"
          >
            <span className="text-[15px]">买 YES</span>
            <span className="text-[12px] font-mono opacity-80 mt-0.5">
              {props.yesPrice.toFixed(3)}
            </span>
          </button>
          <button
            type="button"
            onClick={() => startBet("NO")}
            className="flex-1 min-h-[56px] rounded-xl bg-no text-bg font-bold shadow-md transition-all duration-150 hover:brightness-110 hover:shadow-lg active:scale-[0.96] active:shadow-sm flex flex-col items-center justify-center"
          >
            <span className="text-[15px]">买 NO</span>
            <span className="text-[12px] font-mono opacity-80 mt-0.5">
              {props.noPrice.toFixed(3)}
            </span>
          </button>
        </div>
      )}
    </div>
  );

  // ==== 成交预览展示 ====
  const slipLv = livePreview ? slippageLevel(livePreview.slippage) : "ok";
  const slipTone = SLIPPAGE_TONE[slipLv];

  return (
    <>
      {step === "view" && cta}

      {step === "confirm" && side && (
        <div
          className="fixed inset-0 bg-black/40 z-30 flex items-end justify-center"
          onClick={() => !loading && setStep("view")}
        >
          <div
            className="w-full max-w-[420px] bg-bg rounded-t-[22px] px-[18px] pt-5 pb-8 font-sans max-h-[92vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-9 h-1 rounded-sm bg-line mx-auto mb-3.5" />

            {/* 标题 */}
            <div className="flex items-baseline justify-between mb-1">
              <div
                className="font-serif text-[18px] font-bold text-text"
                style={{ letterSpacing: "-0.2px" }}
              >
                买{" "}
                <span className={side === "YES" ? "text-yes" : "text-no"}>
                  {side}
                </span>{" "}
                <span className="text-sub font-mono text-[14px] font-semibold">
                  @ {sidePrice.toFixed(3)}
                </span>
              </div>
              <span className="text-[11px] text-mut font-mono">
                余额 {props.userBalance.toLocaleString()}P
              </span>
            </div>
            <div className="text-[12px] text-sub mb-3.5 line-clamp-1">
              {props.marketTitle}
            </div>

            {/* 金额输入 */}
            <div className="p-3.5 bg-surface border border-line rounded-[14px] mb-3">
              <div className="flex items-baseline justify-between mb-2">
                <span className="text-[12px] text-sub">投入金额</span>
                <span className="text-[11px] text-mut font-mono">
                  单笔上限 {cap}P
                </span>
              </div>
              <div className="flex items-baseline gap-1.5">
                <input
                  type="number"
                  min={1}
                  max={cap}
                  value={stake || ""}
                  onChange={(e) => {
                    const n = Number(e.target.value);
                    setStake(Number.isFinite(n) ? Math.floor(n) : 0);
                  }}
                  className="font-mono text-[32px] font-bold text-text bg-transparent outline-none w-32"
                  style={{ letterSpacing: "-0.5px" }}
                />
                <span className="text-[14px] text-sub font-semibold">
                  积分
                </span>
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

            {/* 成交预览：8 字段 */}
            <div className="p-3.5 bg-surface border border-line rounded-[14px] mb-3 text-[13px]">
              <div className="text-[11px] text-sub font-semibold mb-2 flex items-center gap-1.5">
                <span>📊 成交预览</span>
                {previewing && (
                  <span className="text-mut text-[10px]">计算中…</span>
                )}
              </div>
              {livePreview ? (
                <>
                  <div className="flex justify-between py-1">
                    <span className="text-sub">买入</span>
                    <span
                      className={`font-mono font-bold ${side === "YES" ? "text-yes" : "text-no"}`}
                    >
                      {livePreview.sharesOut.toFixed(2)} 份 {side}
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-sub">单份成本</span>
                    <span className="font-mono text-text">
                      {livePreview.avgPrice.toFixed(4)} 积分 / 份
                    </span>
                  </div>
                  <div className="text-[11px] text-mut mt-0.5 mb-1 leading-[1.5]">
                    💡 单份成本随下注金额变化：金额越大，单价越偏离市场共识价（即滑点）。
                  </div>
                  <div className="flex justify-between py-1 items-center">
                    <span className="text-sub">滑点</span>
                    <span className={`font-mono font-bold ${slipTone.color}`}>
                      {(livePreview.slippage * 100).toFixed(2)}% ·{" "}
                      {slipTone.label}
                    </span>
                  </div>
                  {slipTone.hint && (
                    <div
                      className={`text-[11px] mt-1 mb-1 ${slipTone.color} opacity-90`}
                    >
                      ⚠ {slipTone.hint}
                    </div>
                  )}
                  <div className="border-t border-line my-2" />
                  <div className="text-[11px] text-mut mb-1.5">
                    结算时赢家每份兑 1 积分，输家每份归 0。
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-sub">✅ 若 {side} 赢</span>
                    <span className="font-mono text-yes font-bold text-right">
                      {livePreview.sharesOut.toFixed(2)} 份 × 1
                      <br />
                      <span className="text-[12px]">
                        = {livePreview.payoutIfWin.toFixed(0)} 积分（净赚 +
                        {livePreview.pnlIfWin.toFixed(0)}）
                      </span>
                    </span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-sub">
                      ❌ 若 {side === "YES" ? "NO" : "YES"} 赢
                    </span>
                    <span className="font-mono text-no font-bold text-right">
                      {livePreview.sharesOut.toFixed(2)} 份 × 0
                      <br />
                      <span className="text-[12px]">
                        = 0 积分（损失 {livePreview.pnlIfLose.toFixed(0)}）
                      </span>
                    </span>
                  </div>
                  <div className="border-t border-line my-2" />
                  <div className="flex justify-between py-1 text-[12px]">
                    <span className="text-sub">交易后概率</span>
                    <span className="font-mono text-mut">
                      {(side === "YES"
                        ? livePreview.priceBefore * 100
                        : (1 - livePreview.priceBefore) * 100
                      ).toFixed(1)}
                      %
                      <span className="mx-1">→</span>
                      <span
                        className={side === "YES" ? "text-yes" : "text-no"}
                      >
                        {(side === "YES"
                          ? livePreview.priceAfter * 100
                          : (1 - livePreview.priceAfter) * 100
                        ).toFixed(1)}
                        %
                      </span>
                    </span>
                  </div>
                </>
              ) : (
                <div className="text-mut text-[12px] py-2 text-center">
                  {stake < 1
                    ? "请输入金额"
                    : stake > cap
                      ? "金额超过上限"
                      : "正在计算…"}
                </div>
              )}
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
                disabled={
                  loading ||
                  stake < 1 ||
                  stake > cap ||
                  !livePreview ||
                  previewing
                }
                className={`flex-1 min-h-[52px] rounded-xl text-bg font-bold text-[15px] shadow-md transition-all duration-150 hover:brightness-110 hover:shadow-lg active:scale-[0.96] disabled:opacity-50 disabled:hover:brightness-100 disabled:active:scale-100 ${
                  side === "YES" ? "bg-yes" : "bg-no"
                }`}
              >
                {loading
                  ? "提交中…"
                  : `确认买入 ${side}（${stake} 积分）`}
              </button>
            </div>

            <div className="text-[11px] text-mut mt-3 text-center font-mono">
              本市场已投入 {Math.floor(props.userInvested)} · 剩余额度{" "}
              {Math.max(0, props.perMarketCap - Math.floor(props.userInvested))}
            </div>
          </div>
        </div>
      )}

      {/* 大滑点二次确认 */}
      {showDangerConfirm && livePreview && side && (
        <div className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center px-4">
          <div className="w-full max-w-sm bg-bg rounded-[18px] px-5 py-6 font-sans">
            <div
              className="font-serif text-[18px] font-bold text-no mb-2"
              style={{ letterSpacing: "-0.2px" }}
            >
              ⚠️ 滑点过大
            </div>
            <div className="text-[13px] text-text mb-3 leading-[1.6]">
              你这笔交易的滑点为{" "}
              <span className="text-no font-mono font-bold">
                {(livePreview.slippage * 100).toFixed(1)}%
              </span>
              ，将以远高于市场共识价格的成本成交。
            </div>
            <div className="text-[12px] text-sub mb-4 leading-[1.6]">
              建议：
              <br />· 减小投入金额，分批下注
              <br />· 或者等市场流动性更深时再交易
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowDangerConfirm(false)}
                className="flex-1 py-3 rounded-xl bg-text text-bg font-semibold text-[14px]"
              >
                减小金额
              </button>
              <button
                type="button"
                onClick={submit}
                className="flex-1 py-3 rounded-xl bg-chip text-sub font-semibold text-[14px] hover:text-text"
              >
                仍然继续
              </button>
            </div>
          </div>
        </div>
      )}

      {step === "done" && done && side && (
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
              获得 {done.sharesOut.toFixed(2)} 份 {side} · 成交价{" "}
              {done.avgPrice.toFixed(3)}
            </div>
            <div className="p-3 bg-surface border border-line rounded-xl text-[12px] text-sub leading-[1.5] mb-4">
              余额 {Math.floor(done.newBalance).toLocaleString()}P · 结算后赢家按
              1 积分/份兑付
            </div>
            <button
              type="button"
              onClick={closeDone}
              className="w-full py-3 rounded-[10px] bg-text text-bg font-semibold text-[14px]"
            >
              知道了
            </button>
          </div>
        </div>
      )}
    </>
  );
}
