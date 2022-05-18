import React, { useEffect, useState } from "react";
import styled from "styled-components";
import {
  hexToUnit,
  toCurrencySymbol,
  toFormattedBalance,
} from "../../utils/conversion";
import Row from "../Row";
import { Typo1, Typo2 } from "../index";
import useTokenPrice from "../../hooks/useTokenPrice";
import useSettings from "../../hooks/useSettings";
import useCoingeckoApi from "../../hooks/useCoingeckoApi";
import Spacer from "../Spacer";

export const TokenBalance: React.FC<any> = ({ token, imageSize = " 32px" }) => {
  const { settings } = useSettings();
  const { getCoinInfo } = useCoingeckoApi();
  const { tokenPrices } = useTokenPrice();

  const [tokenUrl, setTokenUrl] = useState(token.logoURL);

  useEffect(() => {
    if (token.logoURL === "https://repository.fantom.network/logos/erc20.svg") {
      if (tokenPrices[token.symbol.toLowerCase()]) {
        getCoinInfo(tokenPrices[token.symbol.toLowerCase()].cgCode).then(
          (response) => {
            setTokenUrl(response.data.image.small);
          }
        );
      }
    }
  }, [token]);

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
          src={tokenUrl}
        />
        <Spacer size="xs" />
        <Typo1 style={{ fontWeight: "bold" }}>{token.symbol}</Typo1>
      </Row>
      <Row style={{ alignItems: "center", position: "relative" }}>
        <StyledBalance noOfDigits={formattedBalance[0].length + 2}>
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

const StyledBalance = styled(Typo2)<{ noOfDigits: number }>`
  font-weight: bold;
  color: #eff3fb;
  cursor: default;

  .balance-tooltip {
    font-weight: normal;
    visibility: hidden;
    position: absolute;
    left: ${(props) => `-${props.noOfDigits / 3 + 5}rem`};
    top: -0.21rem;
  }

  &:hover .balance-tooltip {
    visibility: visible;
    background-color: rgba(10, 22, 46, 1);
    padding: 0.5rem 1rem;
    border-radius: 8px;
    zindex: 1000;
  }
`;

export default TokenBalance;
