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
  priceBefore: Decimal;
  priceAfter: Decimal;
  slippage: Decimal;
}

export function marginalPrice(state: AmmState, side: "YES" | "NO"): Decimal {
  const total = state.poolYes.add(state.poolNo);
  if (total.lte(0)) return new Decimal(0.5);
  return side === "YES" ? state.poolNo.div(total) : state.poolYes.div(total);
}

/**
 * CPMM mint+swap：用户花 amountIn 积分买 side 方向。
 * 1. 系统铸造 amountIn 对 (YES+NO) 给用户
 * 2. 反方份额全部投入池子
 * 3. 池子按 k = poolYes×poolNo 还原另一方
 * 4. 用户最终持有 = amountIn + (旧池减去的份额)
 *
 * slippage = (avgPrice - priceBefore) / priceBefore
 *   即用户实际成交均价比共识价高出的比例。
 */
export function calcBuy(
  state: AmmState,
  amountIn: Decimal,
  side: "YES" | "NO",
): BuyResult {
  const k = state.poolYes.mul(state.poolNo);
  const priceBefore = marginalPrice(state, side);

  let sharesOut: Decimal;
  let newPoolYes: Decimal;
  let newPoolNo: Decimal;

  if (side === "YES") {
    newPoolNo = state.poolNo.add(amountIn);
    newPoolYes = k.div(newPoolNo);
    const sharesFromPool = state.poolYes.sub(newPoolYes);
    sharesOut = amountIn.add(sharesFromPool);
  } else {
    newPoolYes = state.poolYes.add(amountIn);
    newPoolNo = k.div(newPoolYes);
    const sharesFromPool = state.poolNo.sub(newPoolNo);
    sharesOut = amountIn.add(sharesFromPool);
  }

  const avgPrice = amountIn.div(sharesOut);
  const priceAfter = marginalPrice(
    { poolYes: newPoolYes, poolNo: newPoolNo },
    side,
  );
  const slippage = priceBefore.gt(0)
    ? avgPrice.sub(priceBefore).div(priceBefore)
    : new Decimal(0);

  return {
    sharesOut,
    newPoolYes,
    newPoolNo,
    avgPrice,
    priceBefore,
    priceAfter,
    slippage,
  };
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
