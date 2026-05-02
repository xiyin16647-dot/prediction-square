import Decimal from "decimal.js";

Decimal.set({ precision: 30 });

export interface AmmState {
  poolYes: Decimal;
  poolNo: Decimal;
}

export interface BuyResult {
  sharesOut: Decimal;
  newPoolYes: Decimal;
  newPoolNo: Decimal;
  avgPrice: Decimal;
}

/**
 * CPMM mint+swap：用户花 amountIn 积分买 side 方向。
 * 1. 系统铸造 amountIn 对 (YES+NO) 给用户
 * 2. 反方份额全部投入池子
 * 3. 池子按 k = poolYes×poolNo 还原另一方
 * 4. 用户最终持有 = amountIn + (旧池减去的份额)
 */
export function calcBuy(
  state: AmmState,
  amountIn: Decimal,
  side: "YES" | "NO",
): BuyResult {
  const k = state.poolYes.mul(state.poolNo);
  if (side === "YES") {
    const newPoolNo = state.poolNo.add(amountIn);
    const newPoolYes = k.div(newPoolNo);
    const sharesFromPool = state.poolYes.sub(newPoolYes);
    const sharesOut = amountIn.add(sharesFromPool);
    const avgPrice = amountIn.div(sharesOut);
    return { sharesOut, newPoolYes, newPoolNo, avgPrice };
  } else {
    const newPoolYes = state.poolYes.add(amountIn);
    const newPoolNo = k.div(newPoolYes);
    const sharesFromPool = state.poolNo.sub(newPoolNo);
    const sharesOut = amountIn.add(sharesFromPool);
    const avgPrice = amountIn.div(sharesOut);
    return { sharesOut, newPoolYes, newPoolNo, avgPrice };
  }
}

export function fairValue(
  yesShares: Decimal,
  noShares: Decimal,
  state: AmmState,
): Decimal {
  const total = state.poolYes.add(state.poolNo);
  if (total.lte(0)) return new Decimal(0);
  const yesPrice = state.poolNo.div(total);
  const noPrice = state.poolYes.div(total);
  return yesShares.mul(yesPrice).add(noShares.mul(noPrice));
}
