import { weiToUnit } from "./conversion";

export const getTotalFTMBalanceForAccount = (
  balance: number,
  staked: number,
  collateral: number,
  price: number
) => {
  return weiToUnit((balance + staked + collateral) * price);
};

export const getTokenPrice = (tokenPrice: any) => {
  return tokenPrice.price.price;
};
