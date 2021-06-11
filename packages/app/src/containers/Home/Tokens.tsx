import React, { useContext } from "react";
import { ThemeContext } from "styled-components";
import Row from "../../components/Row";
import { ContentBox, Heading1, Typo1, Typo2 } from "../../components";
import { hexToUnit, toFormattedBalance } from "../../utils/conversion";
import { getAccountAssets } from "../../utils/account";
import Spacer from "../../components/Spacer";
import { Token } from "../../shared/types";
import Column from "../../components/Column";

export const TokenBalanceLine: React.FC<any> = ({
  token,
  imageSize = " 32px",
}) => {
  const { color } = useContext(ThemeContext);

  const formattedBalance = toFormattedBalance(
    hexToUnit(token.balanceOf, token.decimals)
  );
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
      <Row style={{ alignItems: "center" }}>
        <Typo2
          style={{
            fontWeight: "bold",
            color: color.primary.semiWhite(),
          }}
        >
          {formattedBalance[0]}
          {formattedBalance[1]}
        </Typo2>
      </Row>
    </Row>
  );
};

const TokensContent: React.FC<any> = ({ assetList }) => {
  const { color } = useContext(ThemeContext);
  const accountAssets = getAccountAssets(assetList);

  return (
    <div>
      <Row style={{ justifyContent: "space-between" }}>
        <Typo1 style={{ fontWeight: "bold", color: color.greys.grey() }}>
          Asset
        </Typo1>
        <Typo1 style={{ fontWeight: "bold", color: color.greys.grey() }}>
          Balance
        </Typo1>
      </Row>
      <Spacer size="lg" />
      {accountAssets.map((token: Token) => {
        return (
          <div key={token.address}>
            <TokenBalanceLine token={token} />
            <Spacer size="lg" />
          </div>
        );
      })}
    </div>
  );
};

const Tokens: React.FC<any> = ({ loading, tokenList }) => {
  return (
    <ContentBox style={{ flex: 1 }}>
      <Column style={{ width: "100%" }}>
        <Heading1>Tokens</Heading1>
        <Spacer size="lg" />
        {loading ? (
          <div>LOADING...</div>
        ) : (
          <TokensContent assetList={tokenList.data} />
        )}
      </Column>
    </ContentBox>
  );
};

export default Tokens;
