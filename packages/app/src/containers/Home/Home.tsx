import React, { useEffect, useState } from "react";
import "react-circular-progressbar/dist/styles.css";
import useFantomApiData from "../../hooks/useFantomApiData";
import useFantomApi, { FantomApiMethods } from "../../hooks/useFantomApi";
import Balance from "./Balance";
import useWalletProvider from "../../hooks/useWalletProvider";
import { ContentBox, Heading1 } from "../../components";
import Spacer from "../../components/Spacer";
import Row from "../../components/Row";
import useSettings from "../../hooks/useSettings";
import TransactionHistory from "./TransactionHistory";

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
  const accountData = apiData[FantomApiMethods.getAccount].get(activeAddress);
  const fMintData = apiData[FantomApiMethods.getFMintForAccount].get(
    activeAddress
  );
  const delegationsData = apiData[
    FantomApiMethods.getDelegationsForAccount
  ].get(activeAddress);

  useFantomApi(FantomApiMethods.getTokenPrice, {
    to: settings.currency.toUpperCase(),
  });
  useFantomApi(
    FantomApiMethods.getAccount,
    fetchTransHistoryVars,
    activeAddress
  );
  useFantomApi(
    FantomApiMethods.getFMintForAccount,
    { address: activeAddress },
    activeAddress
  );
  useFantomApi(
    FantomApiMethods.getDelegationsForAccount,
    {
      address: activeAddress,
    },
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

  const isDoneLoading =
    activeAddress &&
    accountData?.data &&
    fMintData?.data &&
    delegationsData?.data &&
    tokenPrice?.data;

  return (
    <>
      <Balance
        loading={!isDoneLoading}
        accountData={accountData}
        fMint={fMintData}
        delegations={delegationsData}
        tokenPrice={tokenPrice?.data?.price?.price}
        currency={settings.currency}
      />
      <Spacer />
      <Row style={{ marginBottom: "1rem" }}>
        <TransactionHistory
          address={activeAddress}
          tokenPrice={tokenPrice?.data?.price?.price}
          currency={settings.currency}
          loading={!isDoneLoading}
          accountData={accountData}
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
