import React, { useContext, useEffect, useState } from "react";
import { ThemeContext } from "styled-components";
import Row from "../../components/Row";
import { ContentBox, Heading1, Typo1 } from "../../components";
import Spacer from "../../components/Spacer";
import { Token } from "../../shared/types";
import Column from "../../components/Column";
import TokenBalance from "../../components/TokenBalance";
import Scrollbar from "../../components/Scrollbar";
import { FANTOM_NATIVE } from "../../utils/common";
import useFantomNative from "../../hooks/useFantomNative";
import { BigNumber } from "@ethersproject/bignumber";
import Loader from "../../components/Loader";
import useWalletProvider from "../../hooks/useWalletProvider";

const TokensContent: React.FC<any> = ({ assetList }) => {
  const { walletContext } = useWalletProvider();
  const { color } = useContext(ThemeContext);
  const [tokenList, setTokenList] = useState([]);
  const { getBalance } = useFantomNative();

  useEffect(() => {
    const assetsWithBalance = assetList.filter(
      (asset: any) => asset.balanceOf !== "0x0"
    );
    getBalance().then((balance: BigNumber) => {
      setTokenList([
        { ...FANTOM_NATIVE, balanceOf: balance },
        ...assetsWithBalance,
      ]);
    });
  }, [assetList, walletContext.activeWallet.address]);

  return (
    <div style={{ bottom: 0, marginRight: "-1.5rem" }}>
      <Row style={{ justifyContent: "space-between", paddingRight: "1.5rem" }}>
        <Typo1 style={{ fontWeight: "bold", color: color.greys.grey() }}>
          Asset
        </Typo1>
        <Typo1 style={{ fontWeight: "bold", color: color.greys.grey() }}>
          Balance
        </Typo1>
      </Row>
      <Spacer size="lg" />
      <Scrollbar style={{ height: "30rem" }}>
        {tokenList.map((token: Token) => {
          return (
            <div key={token.address} style={{ paddingRight: "1.5rem" }}>
              <TokenBalance token={token} />
              <Spacer size="lg" />
            </div>
          );
        })}
      </Scrollbar>
    </div>
  );
};

const Tokens: React.FC<any> = ({ loading, tokenList }) => {
  return (
    <ContentBox style={{ flex: 1 }}>
      <Column style={{ width: "100%" }}>
        <Heading1>Tokens</Heading1>
        <Spacer size="lg" />
        {loading ? <Loader /> : <TokensContent assetList={tokenList} />}
      </Column>
    </ContentBox>
  );
};

export default Tokens;
