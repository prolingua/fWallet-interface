import React, { useContext } from "react";
import { ThemeContext } from "styled-components";
import Row from "../../components/Row";
import { ContentBox, Heading1, Typo1 } from "../../components";
import { getAccountAssets } from "../../utils/account";
import Spacer from "../../components/Spacer";
import { Token } from "../../shared/types";
import Column from "../../components/Column";
import TokenBalance from "../../components/TokenBalance";

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
            <TokenBalance token={token} />
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
