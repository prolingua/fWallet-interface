import { weiToUnit } from "./conversion";
import { BigNumber } from "@ethersproject/bignumber";
import { Token } from "../shared/types";
import FtmLogo from "../assets/img/tokens/FTM.svg";
import { format } from "date-fns";

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
  if (!tokenPrice?.price?.price) {
    return 0;
  }
  return tokenPrice.price.price;
};

export const formatDate = (date: Date, toFormat = "LLL d, yyy, HH:mm") => {
  return format(date, toFormat);
};
