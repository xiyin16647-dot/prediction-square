"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const usernameValid = /^[a-zA-Z0-9_]{3,20}$/.test(username);
  const passwordValid = password.length >= 6 && password.length <= 50;
  const confirmValid = confirm.length > 0 && confirm === password;
  const canSubmit = usernameValid && passwordValid && confirmValid && !loading;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? "注册失败");
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
    <main className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md bg-white rounded-lg shadow p-8 space-y-4"
      >
        <h1 className="text-2xl font-bold text-center mb-2">注册</h1>

        <div>
          <label className="block text-sm font-medium mb-1">账号</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="3-20 字符，字母数字下划线"
            autoComplete="username"
          />
          {username.length > 0 && !usernameValid && (
            <p className="text-sm text-red-600 mt-1">
              账号必须 3-20 字符，仅含字母、数字、下划线
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">密码</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="6-50 字符"
            autoComplete="new-password"
          />
          {password.length > 0 && !passwordValid && (
            <p className="text-sm text-red-600 mt-1">密码必须 6-50 字符</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">确认密码</label>
          <input
            type="password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full px-3 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
            autoComplete="new-password"
          />
          {confirm.length > 0 && !confirmValid && (
            <p className="text-sm text-red-600 mt-1">两次密码不一致</p>
          )}
        </div>

        {error && (
          <p className="text-sm text-red-600 text-center bg-red-50 py-2 rounded">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "注册中..." : "注册"}
        </button>

        <p className="text-sm text-center text-gray-600">
          已有账号？
          <Link href="/login" className="text-blue-600 hover:underline ml-1">
            登录
          </Link>
        </p>
      </form>
    </main>
  );
}
