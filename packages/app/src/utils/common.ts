import { weiToUnit } from "./conversion";
import { BigNumber } from "@ethersproject/bignumber";

export const getTotalFTMBalanceForAccount = (
  balance: BigNumber,
  staked: BigNumber,
  collateral: BigNumber,
  price: string
) => {
  const total = weiToUnit(balance.add(staked).add(collateral));
  return total * parseFloat(price);
};

export const getTokenPrice = (tokenPrice: any) => {
  return tokenPrice.price.price;
};
