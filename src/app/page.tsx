import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";

export default async function HomePage() {
  const user = await getCurrentUser();

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="max-w-5xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold">预测市场</h1>
          <nav className="flex items-center gap-4 text-sm">
            {user ? (
              <>
                <span className="text-gray-700">
                  {user.nickname} · 积分{" "}
                  <span className="font-semibold">
                    {Math.floor(Number(user.balance))}
                  </span>
                </span>
                <form action="/api/auth/logout" method="post">
                  <button
                    type="submit"
                    className="text-gray-500 hover:text-gray-700"
                  >
                    退出
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link href="/login" className="text-blue-600 hover:underline">
                  登录
                </Link>
                <Link href="/register" className="text-blue-600 hover:underline">
                  注册
                </Link>
              </>
            )}
          </nav>
        </div>
      </header>

      <section className="max-w-5xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-semibold mb-4">市场列表</h2>
        <p className="text-gray-500">市场功能开发中⋯</p>
      </section>
    </main>
  );
}
