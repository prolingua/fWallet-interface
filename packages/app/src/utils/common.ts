import { weiToUnit } from "./conversion";
import { BigNumber } from "@ethersproject/bignumber";
import { Token } from "../shared/types";
import FtmLogo from "../assets/img/tokens/FTM.svg";

export const FANTOM_NATIVE: Token = {
  address: null,
  decimals: 18,
  name: "Fantom",
  symbol: "FTM",
  logoURL: FtmLogo,
};

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
