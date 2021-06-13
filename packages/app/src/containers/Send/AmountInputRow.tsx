import React, { useContext, useEffect, useState } from "react";
import { ThemeContext } from "styled-components";
import {
  toCurrencySymbol,
  toFormattedBalance,
  unitToWei,
  weiToMaxUnit,
} from "../../utils/conversion";
import { BigNumber } from "@ethersproject/bignumber";
import Column from "../../components/Column";
import Row from "../../components/Row";
import { Button, Typo2 } from "../../components";
import walletSymbol from "../../assets/img/symbols/wallet.svg";
import Spacer from "../../components/Spacer";
import TokenSelectButton from "../../components/TokenSelectModal";
import InputError from "../../components/InputError";
import InputCurrency from "../../components/InputCurrency";
import FormattedValue from "../../components/FormattedBalance";

const AmountInputRow: React.FC<any> = ({
  accountAssets,
  accountBalance,
  currency,
  fantomPrice,
  initialInputValue,
  setAmountToSend,
  setTokenSelected,
  token,
}) => {
  const { color } = useContext(ThemeContext);
  const [inputValue, setInputValue] = useState(
    initialInputValue
      ? weiToMaxUnit(initialInputValue.toString()).toString()
      : ""
  );
  const [fiatValue, setFiatValue] = useState(null);
  const [error, setError] = useState(null);

  const isNative = token.symbol === "FTM";
  const tokenBalanceInWei = isNative ? accountBalance : token.balanceOf;
  const tokenBalance = weiToMaxUnit(tokenBalanceInWei, token.decimals);
  const formattedBalance = toFormattedBalance(tokenBalance);
  const formattedTotalValue = fiatValue && toFormattedBalance(fiatValue);

  const handleSetMax = () => {
    setError(null);
    setInputValue(weiToMaxUnit(tokenBalanceInWei, token.decimals).toString());
  };
  const handleTokenChange = (token: any) => {
    resetAmountToSend();
    setError(null);
    setTokenSelected(token);
  };
  const resetAmountToSend = () => {
    setInputValue("");
    setFiatValue(null);
    setAmountToSend(BigNumber.from(0));
  };

  useEffect(() => {
    setFiatValue(inputValue ? parseFloat(inputValue) * fantomPrice : null);
    setAmountToSend(
      error ? BigNumber.from(0) : unitToWei(inputValue, token.decimals)
    );
  }, [inputValue, fantomPrice, error]);

  return (
    <Column>
      <Row style={{ position: "relative", justifyContent: "space-between" }}>
        <Typo2 style={{ color: color.greys.grey() }}>Amount</Typo2>
        <Row>
          <img alt="" src={walletSymbol} />
          <Spacer size="sm" />
          <FormattedValue
            formattedValue={formattedBalance}
            tokenSymbol={token.symbol}
            color={color.greys.grey()}
            fontSize="16px"
          />
        </Row>
      </Row>
      <Spacer size="sm" />
      <Row
        style={{
          backgroundColor: "#202F49",
          borderRadius: "8px",
          height: "64px",
          alignItems: "center",
        }}
      >
        <Spacer />
        <InputCurrency
          value={inputValue}
          max={tokenBalance}
          handleValue={setInputValue}
          handleError={setError}
          token={token}
        />
        <Row style={{ flex: 1, alignItems: "center" }}>
          {isNative && formattedTotalValue?.length ? (
            <Row
              style={{ fontSize: "16px", flex: 4, color: color.greys.grey() }}
            >
              ~
              <FormattedValue
                formattedValue={formattedTotalValue}
                currencySymbol={toCurrencySymbol(currency)}
              />
            </Row>
          ) : (
            <div style={{ flex: 4 }} />
          )}
          <Spacer />
          <Button
            fontSize="14px"
            color={color.greys.grey()}
            padding="8px"
            style={{ flex: 1 }}
            variant="tertiary"
            onClick={handleSetMax}
          >
            MAX
          </Button>
          <Spacer />
          <TokenSelectButton
            currentToken={token}
            ftmBalance={accountBalance}
            assets={accountAssets}
            setTokenSelected={handleTokenChange}
          />
          <Spacer />
        </Row>
      </Row>
      <Spacer size="sm" />
      {error ? <InputError error={error} /> : <Spacer size="lg" />}
    </Column>
  );
};

export default AmountInputRow;
