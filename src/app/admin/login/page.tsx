"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "登录失败");
        setLoading(false);
        return;
      }
      router.push("/admin");
      router.refresh();
    } catch {
      setError("网络错误");
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-admin-bg flex items-center justify-center px-4 font-sans">
      <form
        onSubmit={submit}
        className="w-full max-w-sm bg-admin-surface border border-admin-line rounded-xl p-7 space-y-4"
      >
        <div>
          <div
            className="text-admin-text font-bold text-[15px]"
            style={{ letterSpacing: "-0.2px" }}
          >
            Prediction Square
          </div>
          <div className="text-admin-sub text-xs mt-0.5">管理后台 · 先行版</div>
        </div>
        <div>
          <label className="block text-xs text-admin-sub mb-1.5 font-semibold">
            账号
          </label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            className="w-full px-3 py-2 bg-admin-bg border border-admin-line-hard rounded text-admin-text text-sm focus:outline-none focus:border-admin-primary"
          />
        </div>
        <div>
          <label className="block text-xs text-admin-sub mb-1.5 font-semibold">
            密码
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            className="w-full px-3 py-2 bg-admin-bg border border-admin-line-hard rounded text-admin-text text-sm focus:outline-none focus:border-admin-primary"
          />
        </div>
        {error && (
          <p className="text-sm text-admin-danger bg-admin-danger-bg py-2 px-3 rounded">
            {error}
          </p>
        )}
        <button
          type="submit"
          disabled={loading || !username || !password}
          className="w-full py-2.5 bg-admin-primary text-white text-sm font-semibold rounded disabled:opacity-50"
        >
          {loading ? "登录中…" : "登录"}
        </button>
      </form>
    </div>
  );
}
