"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { PasswordInput } from "@/components/PasswordInput";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const canSubmit = username.length > 0 && password.length > 0 && !loading;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/login", {
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
      router.push("/");
      router.refresh();
    } catch {
      setError("网络错误，请重试");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-bg px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-surface border border-line rounded-2xl p-8 space-y-4 font-sans"
      >
        <h1
          className="font-serif text-[24px] font-bold text-center text-text mb-2"
          style={{ letterSpacing: "-0.3px" }}
        >
          登录
        </h1>

        <div>
          <label className="block text-sm font-medium mb-1 text-text">账号</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3 py-2 bg-bg border border-line-hard rounded text-text focus:outline-none focus:border-text"
            autoComplete="username"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-text">密码</label>
          <PasswordInput
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 bg-bg border border-line-hard rounded text-text focus:outline-none focus:border-text"
            autoComplete="current-password"
          />
        </div>

        {error && (
          <p className="text-sm text-no text-center bg-no-bg py-2 rounded">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full bg-text text-bg py-2 rounded font-semibold disabled:opacity-40 disabled:cursor-not-allowed transition-opacity"
        >
          {loading ? "登录中..." : "登录"}
        </button>

        <p className="text-sm text-center text-sub">
          还没有账号？
          <Link href="/register" className="text-text underline ml-1">
            注册
          </Link>
        </p>
      </form>
    </main>
  );
}
