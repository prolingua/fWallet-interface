import React, { useContext } from "react";
import { ThemeContext } from "styled-components";
import { useQuery } from "@apollo/client";
import { ERC20_ASSETS, GET_ACCOUNT_BALANCE } from "../../graphql/subgraph";
import { getAccountAssetBalance, getAccountBalance } from "../../utils/account";
import { toFormattedBalance, weiToUnit } from "../../utils/conversion";
import { Typo2 } from "../index";
import FormattedValue from "../FormattedBalance";

const AddressBalance: React.FC<any> = ({ address, token }) => {
  const { color } = useContext(ThemeContext);
  const isNative = token.symbol === "FTM";
  const { data } = useQuery(isNative ? GET_ACCOUNT_BALANCE : ERC20_ASSETS, {
    variables: isNative ? { address } : { owner: address },
  });
  const balance =
    data && isNative
      ? getAccountBalance(data)
      : getAccountAssetBalance(data, token.address);
  const formattedBalance =
    balance && toFormattedBalance(weiToUnit(balance, token.decimals));

  return (
    <Typo2 style={{ color: color.greys.grey() }}>
      {formattedBalance && (
        <FormattedValue
          formattedValue={formattedBalance}
          tokenSymbol={token.symbol}
        />
      )}
    </Typo2>
  );
};

export default AddressBalance;
