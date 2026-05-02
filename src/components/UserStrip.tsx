import Link from "next/link";

interface UserStripProps {
  nickname: string;
  balance: number;
  todayPnl: number;
}

export function UserStrip({ balance, todayPnl }: UserStripProps) {
  const pnlSign = todayPnl > 0 ? "+" : todayPnl < 0 ? "" : "";
  const pnlColor = todayPnl > 0 ? "text-yes" : todayPnl < 0 ? "text-no" : "text-text";
  return (
    <div className="mx-[18px] mb-2.5 px-3.5 py-2.5 bg-surface rounded-[14px] border border-line flex items-center gap-3 font-sans">
      <div>
        <div className="text-[10px] text-sub mb-0.5">积分余额</div>
        <div
          className="text-[18px] font-bold text-text"
          style={{ letterSpacing: "-0.4px" }}
        >
          {balance.toLocaleString()}
        </div>
      </div>
      <div className="w-px h-6 bg-line" />
      <div>
        <div className="text-[10px] text-sub mb-0.5">今日盈亏</div>
        <div className={`text-[15px] font-bold ${pnlColor}`}>
          {pnlSign}
          {todayPnl.toLocaleString()}
        </div>
      </div>
      <Link
        href="/positions"
        className="ml-auto px-2.5 py-1.5 bg-text text-bg rounded-full text-[11px] font-semibold"
      >
        我的持仓
      </Link>
    </div>
  );
}

export function GuestStrip() {
  return (
    <div className="mx-[18px] mb-2.5 px-3.5 py-2.5 bg-surface rounded-[14px] border border-line flex items-center gap-3 font-sans">
      <div className="text-sm text-sub">登录后即可下注，免费派 10000 积分</div>
      <Link
        href="/login"
        className="ml-auto px-2.5 py-1.5 bg-text text-bg rounded-full text-[11px] font-semibold"
      >
        登录 / 注册
      </Link>
    </div>
  );
}
