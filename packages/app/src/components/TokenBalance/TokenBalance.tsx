import React, { useContext } from "react";
import styled, { ThemeContext } from "styled-components";
import {
  hexToUnit,
  toCurrencySymbol,
  toFormattedBalance,
} from "../../utils/conversion";
import Row from "../Row";
import { ContentBox, Typo1, Typo2 } from "../index";
import useTokenPrice from "../../hooks/useTokenPrice";
import useSettings from "../../hooks/useSettings";

export const TokenBalance: React.FC<any> = ({ token, imageSize = " 32px" }) => {
  const { settings } = useSettings();
  const { tokenPrices } = useTokenPrice();

  const balance = hexToUnit(token.balanceOf, token.decimals);
  const value = tokenPrices[
    token.symbol.toLowerCase() === "ftm" ? "wftm" : token.symbol.toLowerCase()
  ]
    ? tokenPrices[
        token.symbol.toLowerCase() === "ftm"
          ? "wftm"
          : token.symbol.toLowerCase()
      ].price[settings.currency] * balance
    : 0;
  const formattedBalance = toFormattedBalance(balance);
  return (
    <Row style={{ justifyContent: "space-between" }}>
      <Row style={{ alignItems: "center" }}>
        <img
          alt=""
          style={{ width: imageSize, height: imageSize, marginRight: ".4rem" }}
          src={token.logoURL}
        />
        <Typo1 style={{ fontWeight: "bold" }}>{token.symbol}</Typo1>
      </Row>
      <Row style={{ alignItems: "center", position: "relative" }}>
        <StyledBalance>
          {formattedBalance[0]}
          {formattedBalance[1]}
          {value > 0.1 && (
            <div className="balance-tooltip">
              {toCurrencySymbol(settings.currency)}
              {value.toFixed(2)}
            </div>
          )}
        </StyledBalance>
      </Row>
    </Row>
  );
};

const StyledBalance = styled(Typo2)`
  font-weight: bold;
  color: #eff3fb;
  cursor: default;

  .balance-tooltip {
    font-weight: normal;
    visibility: hidden;
    position: absolute;
    z-index: 1;
  }

  &:hover .balance-tooltip {
    visibility: visible;
  }
`;

export default TokenBalance;
