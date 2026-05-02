import { BottomTabBar } from "@/components/BottomTabBar";

export default function RankPage() {
  return (
    <main className="flex-1 mx-auto w-full max-w-[420px] flex flex-col bg-bg min-h-screen">
      <div className="px-[18px] pt-4 pb-2.5">
        <h1
          className="font-serif text-[26px] font-bold text-text"
          style={{ letterSpacing: "-0.6px" }}
        >
          排行榜
        </h1>
        <p className="text-sm text-sub mt-1">按累计收益排</p>
      </div>
      <div className="flex-1 px-[18px] py-12 text-center text-sub text-sm">
        排行榜功能开发中⋯
      </div>
      <BottomTabBar active="rank" />
    </main>
  );
}
