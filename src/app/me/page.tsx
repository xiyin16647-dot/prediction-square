import Link from "next/link";
import { BottomTabBar } from "@/components/BottomTabBar";
import { getCurrentUser } from "@/lib/auth";

export default async function MePage() {
  const user = await getCurrentUser();
  return (
    <main className="flex-1 mx-auto w-full max-w-[420px] flex flex-col bg-bg min-h-screen">
      <div className="px-[18px] pt-4 pb-2.5">
        <h1
          className="font-serif text-[26px] font-bold text-text"
          style={{ letterSpacing: "-0.6px" }}
        >
          我的
        </h1>
      </div>
      {user ? (
        <div className="px-[18px] flex-1">
          <div className="bg-surface border border-line rounded-[14px] p-4 flex items-center gap-3 mb-4">
            <div className="size-12 rounded-full bg-chip flex items-center justify-center text-text font-bold">
              {user.nickname[0]?.toUpperCase()}
            </div>
            <div className="flex-1">
              <div className="text-text font-bold">{user.nickname}</div>
              <div className="text-xs text-sub mt-0.5">@{user.username}</div>
            </div>
          </div>
          <div className="bg-surface border border-line rounded-[14px] p-4 mb-4">
            <div className="text-[10px] text-sub mb-1">积分余额</div>
            <div
              className="font-mono text-[28px] font-bold text-text"
              style={{ letterSpacing: "-0.6px" }}
            >
              {Math.floor(Number(user.balance.toString())).toLocaleString()}
            </div>
          </div>
          <div className="text-center text-sub text-sm py-8">
            持仓 / 历史功能开发中⋯
          </div>
          <form action="/api/auth/logout" method="post" className="text-center">
            <button
              type="submit"
              className="text-xs text-sub px-4 py-2 border border-line-hard rounded-full"
            >
              退出登录
            </button>
          </form>
        </div>
      ) : (
        <div className="px-[18px] flex-1 flex flex-col items-center justify-center gap-4">
          <p className="text-sub">登录后查看积分、持仓和历史</p>
          <div className="flex gap-3">
            <Link
              href="/login"
              className="px-4 py-2 bg-text text-bg rounded-full text-sm font-semibold"
            >
              登录
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 border border-line-hard text-text rounded-full text-sm font-semibold"
            >
              注册
            </Link>
          </div>
        </div>
      )}
      <BottomTabBar active="me" />
    </main>
  );
}
