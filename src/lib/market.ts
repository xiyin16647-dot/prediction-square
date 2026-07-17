import Decimal from "decimal.js";

Decimal.set({ precision: 30 });

export const CATEGORY_LABELS = {
  FINANCE: "金融",
  TECH: "科技",
  ENTERTAINMENT: "娱乐",
  SPORTS: "体育",
  SOCIETY: "社会",
  TRENDY: "潮玩",
  OTHER: "其他",
} as const;

export type CategoryKey = keyof typeof CATEGORY_LABELS;

type DecLike = Decimal | string | number | { toString(): string };

function toDec(v: DecLike): Decimal {
  return new Decimal(v.toString());
}

export function poolToPrice(poolYes: DecLike, poolNo: DecLike) {
  const py = toDec(poolYes);
  const pn = toDec(poolNo);
  const total = py.add(pn);
  if (total.lte(0)) {
    return { yesPrice: new Decimal(0.5), noPrice: new Decimal(0.5), total };
  }
  return {
    yesPrice: pn.div(total),
    noPrice: py.div(total),
    total,
  };
}

export function pctOf(price: Decimal): number {
  return Math.round(price.mul(100).toNumber());
}

export function formatRelativeTime(date: Date): string {
  const ms = Date.now() - date.getTime();
  const min = Math.floor(ms / 60000);
  if (min < 1) return "刚刚";
  if (min < 60) return `${min} 分钟前`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr} 小时前`;
  const d = Math.floor(hr / 24);
  return `${d} 天前`;
}

export function formatCountdown(target: Date): string {
  const ms = target.getTime() - Date.now();
  if (ms <= 0) return "已结束";
  const totalSec = Math.floor(ms / 1000);
  const h = String(Math.floor(totalSec / 3600)).padStart(2, "0");
  const m = String(Math.floor((totalSec % 3600) / 60)).padStart(2, "0");
  const s = String(totalSec % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

export function formatDeadline(date: Date): string {
  const ms = date.getTime() - Date.now();
  if (ms <= 0) return "已截止";
  const days = Math.floor(ms / (24 * 3600 * 1000));
  if (days < 1) {
    const hours = Math.floor(ms / 3600000);
    return `${hours} 小时后截止`;
  }
  if (days <= 7) return `${days} 天后截止`;
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${m}月${d}日 截止`;
}
