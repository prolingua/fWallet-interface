import React, { useContext, useEffect, useState } from "react";
import "react-circular-progressbar/dist/styles.css";
import useFantomApiData from "../../hooks/useFantomApiData";
import useFantomApi, { FantomApiMethods } from "../../hooks/useFantomApi";
import Balance from "./Balance";
import useWalletProvider from "../../hooks/useWalletProvider";
import {
  ContentBox,
  Heading1,
  LinkExt,
  OverlayButton,
  Typo1,
  Typo2,
  WrapA,
} from "../../components";
import Spacer from "../../components/Spacer";
import Column from "../../components/Column";
import Row from "../../components/Row";
import {
  formatHexToInt,
  millisecondsToTimeUnit,
  toCurrencySymbol,
  WeiToUnit,
} from "../../utils/conversion";
import { isSameAddress } from "../../utils/wallet";
import useSettings from "../../hooks/useSettings";
import styled, { ThemeContext } from "styled-components";
import config from "../../config/config.test";

// block: {number: "0xa0071", timestamp: "0x608d476c", __typename: "Block"}
// from: "0x9b2bb6290fb910a960ec344cdf2ae60ba89647f6"
// gasUsed: "0x5208"
// hash: "0xc7726392b1ba4eb25c27755c81a5fa6e1fd36244f0f2e86dbbdde30275d81046"
// status: "0x1"
// to: "0x93ff1ff42f534bbee207fa380d967c760d27076a"
// value: "0x8ac7230489e80000"

const TransactionLine: React.FC<any> = ({
  address,
  transaction,
  tokenPrice,
  currency,
}) => {
  const { color } = useContext(ThemeContext);
  const [expanded, setExpanded] = useState(false);
  const isSender = isSameAddress(address, transaction.from);
  const amount = WeiToUnit(formatHexToInt(transaction.value).toString());
  const value = amount * tokenPrice;
  const timestamp = formatHexToInt(transaction.block.timestamp) * 1000;
  const now = Date.now();
  const transactionTimeAgo = millisecondsToTimeUnit(now - timestamp);

  const transactionBase = (
    <Row style={{ width: "100%", cursor: "pointer" }}>
      <Row style={{ flex: 3 }}>
        <Typo1 style={{ color: color.greys.grey() }}>
          {isSender ? "Sent" : "Received"}
        </Typo1>
        <Spacer size="sm" />
        <Typo1 style={{ color: color.primary.cyan(), fontWeight: "bold" }}>
          {amount} FTM
        </Typo1>
        <Spacer size="sm" />
        <Typo1 style={{ color: color.greys.darkGrey() }}>
          ({`${toCurrencySymbol(currency)}${value.toFixed(2)}`})
        </Typo1>
      </Row>
      <Typo1 style={{ color: color.greys.grey(), flex: 1, textAlign: "end" }}>
        {transactionTimeAgo}
      </Typo1>
    </Row>
  );

  return (
    <OverlayButton onClick={() => setExpanded(!expanded)}>
      {expanded ? (
        <div
          style={{
            backgroundColor: color.primary.black(),
            margin: "-1rem",
            padding: "1rem",
            borderRadius: "8px",
            border: `1px solid ${color.greys.mediumGray()}`,
            boxSizing: "border-box",
            cursor: "default",
          }}
        >
          {transactionBase}
          <Spacer />
          <Row>
            <StyledPair>
              <StyledPairHeader>Date</StyledPairHeader>
              <StyledPairValue
                style={{ color: color.semiWhite, fontSize: "14px" }}
              >
                {new Date(timestamp).toDateString()}
              </StyledPairValue>
            </StyledPair>
            <div style={{ flex: 1 }} />
            <StyledPair>
              <StyledPairHeader>{isSender ? "To" : "From"}</StyledPairHeader>
              <StyledPairValue
                style={{ color: color.semiWhite, fontSize: "14px" }}
              >
                {isSender ? transaction.to : transaction.from}
              </StyledPairValue>
            </StyledPair>
          </Row>
          <Spacer />
          <Row>
            <StyledPair>
              <StyledPairHeader>Transaction ID</StyledPairHeader>
              <StyledPairValue
                style={{ color: color.semiWhite, fontSize: "14px" }}
              >
                <LinkExt
                  href={`${config.explorerUrl}${config.explorerTransactionPath}/${transaction.hash}`}
                  onClick={(e) => e.stopPropagation()}
                >
                  {transaction.hash}
                </LinkExt>
              </StyledPairValue>
            </StyledPair>
            <div style={{ flex: 1 }} />
            <div style={{ flex: 3 }} />
          </Row>
        </div>
      ) : (
        transactionBase
      )}
    </OverlayButton>
  );
};

const StyledPair = styled(Column)`
  flex: 5;
  max-width: 45%;
  align-items: flex-start;
`;

const StyledPairHeader = styled.div`
  color: ${(props) => props.theme.color.greys.grey()};
  font-size: 14px;
`;

const StyledPairValue = styled.div`
  color: ${(props) => props.theme.color.semiWhite};
  font-size: 14px;
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const TransactionHistory: React.FC<any> = ({
  loading,
  history,
  address,
  tokenPrice,
  currency,
}) => {
  const edges = history?.data?.account?.txList?.edges;

  return (
    <ContentBox style={{ flex: 1 }}>
      <Column style={{ width: "100%" }}>
        <Heading1>History</Heading1>
        <Spacer size="lg" />
        <>
          {loading ? (
            <div>LOADING...</div>
          ) : (
            edges &&
            edges.map((edge: any, index: number) => {
              return (
                <>
                  <TransactionLine
                    address={address}
                    transaction={edge.transaction}
                    tokenPrice={tokenPrice}
                    currency={currency}
                  />
                  <Spacer size="lg" />
                </>
              );
            })
          )}
        </>
      </Column>
    </ContentBox>
  );
};

const Home: React.FC<any> = () => {
  const { apiData } = useFantomApiData();
  const { walletContext } = useWalletProvider();
  const { settings } = useSettings();
  const activeAddress = walletContext.activeWallet.address
    ? walletContext.activeWallet.address.toLowerCase()
    : null;
  const [fetchTransHistoryVars, setFetchTransHistoryVars] = useState<any>({
    address: activeAddress,
    count: 10,
  });
  const tokenPrice = apiData[FantomApiMethods.getTokenPrice];
  const accountTransactionHistory = apiData[
    FantomApiMethods.getAccountTransactionHistory
  ].get(activeAddress);

  useFantomApi(FantomApiMethods.getTokenPrice, {
    to: settings.currency.toUpperCase(),
  });
  useFantomApi(
    FantomApiMethods.getAccountTransactionHistory,
    fetchTransHistoryVars,
    activeAddress
  );

  useEffect(() => {
    if (activeAddress) {
      setFetchTransHistoryVars({
        ...fetchTransHistoryVars,
        address: activeAddress,
      });
    }
  }, [activeAddress]);

  const transactionHistoryIsLoaded =
    activeAddress &&
    apiData[FantomApiMethods.getAccountTransactionHistory].has(activeAddress);

  return (
    <>
      <Balance />
      <Spacer />
      <Row style={{ marginBottom: "1rem" }}>
        <TransactionHistory
          address={activeAddress}
          tokenPrice={tokenPrice?.data?.price?.price}
          currency={settings.currency}
          loading={!transactionHistoryIsLoaded}
          history={accountTransactionHistory}
        />
        <Spacer />
        <ContentBox style={{ flex: 1 }}>
          <Heading1>Tokens</Heading1>
        </ContentBox>
      </Row>
    </>
  );
};

export default Home;
