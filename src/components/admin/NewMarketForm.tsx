"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const CATEGORIES = [
  ["FINANCE", "金融"],
  ["TECH", "科技"],
  ["ENTERTAINMENT", "娱乐"],
  ["SPORTS", "体育"],
  ["SOCIETY", "社会"],
  ["TRENDY", "潮玩"],
  ["OTHER", "其他"],
] as const;

type CategoryKey = (typeof CATEGORIES)[number][0];

type AiField = "description" | "resolutionRule" | "aiBrief" | "initialYesPct";

export function NewMarketForm() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    description: "",
    resolutionRule: "",
    category: "FINANCE" as CategoryKey,
    aiBrief: "",
    closesAt: "",
    initialYesPct: 50,
    seedAmount: 20000,
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState<AiField | null>(null);
  const [aiError, setAiError] = useState<string | null>(null);

  function set<K extends keyof typeof form>(k: K, v: (typeof form)[K]) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function aiSuggest(field: AiField) {
    setAiError(null);
    if (form.title.trim().length < 5) {
      setAiError("先填题目（至少 5 字）再用 AI 推荐");
      return;
    }
    setAiLoading(field);
    try {
      const res = await fetch("/api/admin/ai-suggest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          field,
          title: form.title,
          category: form.category,
          closesAt: form.closesAt || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setAiError(data.error ?? "AI 调用失败");
        return;
      }
      if (field === "initialYesPct") {
        set("initialYesPct", Number(data.value));
      } else {
        set(field, String(data.value));
      }
    } catch {
      setAiError("网络错误");
    } finally {
      setAiLoading(null);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/markets", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          aiBrief: form.aiBrief.trim() || undefined,
          initialYesPct: Number(form.initialYesPct),
          seedAmount: Number(form.seedAmount),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "创建失败");
        setLoading(false);
        return;
      }
      router.push("/admin/markets");
      router.refresh();
    } catch {
      setError("网络错误");
      setLoading(false);
    }
  }

  const aiBtn = (field: AiField) => (
    <button
      type="button"
      onClick={() => aiSuggest(field)}
      disabled={aiLoading !== null}
      className="text-[11px] text-admin-primary font-semibold hover:opacity-80 disabled:opacity-40"
    >
      {aiLoading === field ? "AI 写作中…" : "✨ AI 写"}
    </button>
  );

  return (
    <form onSubmit={submit} className="max-w-2xl space-y-4">
      <Field label="题目">
        <input
          type="text"
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
          required
          minLength={5}
          maxLength={120}
          className="w-full px-3 py-2 bg-admin-surface border border-admin-line-hard rounded text-admin-text text-sm focus:outline-none focus:border-admin-primary"
          placeholder="如：美联储 6 月议息会议是否会降息 25bp？"
        />
      </Field>
      <Field label="详细说明" action={aiBtn("description")}>
        <textarea
          value={form.description}
          onChange={(e) => set("description", e.target.value)}
          required
          rows={3}
          className="w-full px-3 py-2 bg-admin-surface border border-admin-line-hard rounded text-admin-text text-sm focus:outline-none focus:border-admin-primary resize-none"
          placeholder="背景、当前情况"
        />
      </Field>
      <Field label="结算规则" action={aiBtn("resolutionRule")}>
        <textarea
          value={form.resolutionRule}
          onChange={(e) => set("resolutionRule", e.target.value)}
          required
          rows={2}
          className="w-full px-3 py-2 bg-admin-surface border border-admin-line-hard rounded text-admin-text text-sm focus:outline-none focus:border-admin-primary resize-none"
          placeholder="精确说明什么算 YES，例如：6/12 FOMC 决议降息 ≥ 25bp 即 YES"
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="分类">
          <select
            value={form.category}
            onChange={(e) => set("category", e.target.value as CategoryKey)}
            className="w-full px-3 py-2 bg-admin-surface border border-admin-line-hard rounded text-admin-text text-sm focus:outline-none focus:border-admin-primary"
          >
            {CATEGORIES.map(([k, l]) => (
              <option key={k} value={k}>
                {l}
              </option>
            ))}
          </select>
        </Field>
        <Field label="判定截止时间">
          <input
            type="datetime-local"
            value={form.closesAt}
            onChange={(e) => set("closesAt", e.target.value)}
            required
            className="w-full px-3 py-2 bg-admin-surface border border-admin-line-hard rounded text-admin-text text-sm focus:outline-none focus:border-admin-primary"
          />
        </Field>
      </div>
      <Field label="AI 轻解读（可选）" action={aiBtn("aiBrief")}>
        <textarea
          value={form.aiBrief}
          onChange={(e) => set("aiBrief", e.target.value)}
          rows={2}
          className="w-full px-3 py-2 bg-admin-surface border border-admin-line-hard rounded text-admin-text text-sm focus:outline-none focus:border-admin-primary resize-none"
          placeholder="一句话背景介绍，让用户 3 秒看懂"
        />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="初始 YES 概率（%）" action={aiBtn("initialYesPct")}>
          <input
            type="number"
            min={1}
            max={99}
            value={form.initialYesPct}
            onChange={(e) => set("initialYesPct", Number(e.target.value))}
            required
            className="w-full px-3 py-2 bg-admin-surface border border-admin-line-hard rounded text-admin-text text-sm font-mono focus:outline-none focus:border-admin-primary"
          />
          <div className="text-[11px] text-admin-sub mt-1">
            决定 YES/NO 起始价格，50 = 等概率
          </div>
        </Field>
        <Field label="种子流动性">
          <input
            type="number"
            min={1000}
            max={1000000}
            value={form.seedAmount}
            onChange={(e) => set("seedAmount", Number(e.target.value))}
            required
            className="w-full px-3 py-2 bg-admin-surface border border-admin-line-hard rounded text-admin-text text-sm font-mono focus:outline-none focus:border-admin-primary"
          />
          <div className="text-[11px] text-admin-sub mt-1">
            池子总量，越大滑点越小，建议 20000+
          </div>
        </Field>
      </div>

      {aiError && (
        <div className="text-[12px] text-admin-danger bg-admin-danger-bg p-2 rounded">
          {aiError}
        </div>
      )}
      {error && (
        <div className="text-[12px] text-admin-danger bg-admin-danger-bg p-2 rounded">
          {error}
        </div>
      )}

      <div className="flex gap-2 pt-2">
        <button
          type="button"
          onClick={() => router.push("/admin/markets")}
          disabled={loading}
          className="px-4 py-2 bg-admin-surface border border-admin-line-hard text-admin-text-mid text-sm font-semibold rounded disabled:opacity-50"
        >
          取消
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-5 py-2 bg-admin-primary text-white text-sm font-semibold rounded disabled:opacity-50"
        >
          {loading ? "创建中…" : "创建并上线"}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  action,
  children,
}: {
  label: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <label className="block text-[12px] text-admin-sub font-semibold">
          {label}
        </label>
        {action}
      </div>
      {children}
    </div>
  );
}
