import { Token } from "../shared/types";
import { formatHexToInt } from "./conversion";

export interface ERC20Tokens {
  erc20TokenList: Token[];
}

export const filterTokensWithBalance = (tokenList: ERC20Tokens) => {
  if (!tokenList?.erc20TokenList) {
    return;
  }

  return tokenList.erc20TokenList.filter(
    (token) => formatHexToInt(token.balanceOf) > 0
  );
};
