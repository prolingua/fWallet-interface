import { WeiToUnit } from "./conversion";

export const getTotalFTMBalanceForAccount = (
  balance: number,
  staked: number,
  collateral: number,
  price: number
) => {
  return WeiToUnit((balance + staked + collateral) * price);
};
