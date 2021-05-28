import React, { useContext, useEffect, useState } from "react";
import "react-circular-progressbar/dist/styles.css";
import useFantomApiData from "../../hooks/useFantomApiData";
import useFantomApi, { FantomApiMethods } from "../../hooks/useFantomApi";
import Balance from "./Balance";
import useWalletProvider from "../../hooks/useWalletProvider";
import Spacer from "../../components/Spacer";
import useSettings from "../../hooks/useSettings";
import TransactionHistory from "./TransactionHistory";
import { ThemeContext } from "styled-components";
import { ResponsiveRow } from "../../components/Row/Row";
import Tokens from "./Tokens";

const Home: React.FC<any> = () => {
  const { breakpoints } = useContext(ThemeContext);
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
  const accountData = apiData[
    FantomApiMethods.getAccountTransactionHistory
  ].get(activeAddress);
  const fMintData = apiData[FantomApiMethods.getFMintForAccount].get(
    activeAddress
  );
  const delegationsData = apiData[
    FantomApiMethods.getDelegationsForAccount
  ].get(activeAddress);
  const assetsList = apiData[FantomApiMethods.getAssetsListForAccount].get(
    activeAddress
  );

  useFantomApi(FantomApiMethods.getTokenPrice, {
    to: settings.currency.toUpperCase(),
  });
  useFantomApi(
    FantomApiMethods.getAccountTransactionHistory,
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
  useFantomApi(
    FantomApiMethods.getAssetsListForAccount,
    {
      owner: activeAddress,
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

  const isDoneLoadingBalance =
    activeAddress &&
    accountData?.data &&
    fMintData?.data &&
    delegationsData?.data &&
    tokenPrice?.data;

  const isDoneLoadingTransactionHistory =
    activeAddress && accountData?.data && tokenPrice?.data;

  const isDoneLoadingTokens = activeAddress && assetsList?.data;

  return (
    <>
      <Balance
        loading={!isDoneLoadingBalance}
        accountData={accountData}
        fMint={fMintData}
        delegations={delegationsData}
        tokenPrice={tokenPrice?.data?.price?.price}
        currency={settings.currency}
      />
      <Spacer />
      <ResponsiveRow
        breakpoint={breakpoints.ultra}
        breakpointReverse
        style={{ marginBottom: "1rem" }}
      >
        <TransactionHistory
          loading={!isDoneLoadingTransactionHistory}
          address={activeAddress}
          tokenPrice={tokenPrice?.data?.price?.price}
          currency={settings.currency}
          accountData={accountData}
        />
        <Spacer />
        <Tokens loading={!isDoneLoadingTokens} tokenList={assetsList} />
      </ResponsiveRow>
    </>
  );
};

export default Home;
