import React, { useContext } from "react";
import { ThemeContext } from "styled-components";
import { ContentBox, Heading1 } from "../../components";
import Column from "../../components/Column";
import Spacer from "../../components/Spacer";
import Row from "../../components/Row";
import StatPair from "../../components/StatPair";
import {
  toCurrencySymbol,
  toFormattedBalance,
  weiToUnit,
} from "../../utils/conversion";
import { getAccountDelegationSummary } from "../../utils/delegation";
import { getLockedCollateral } from "../../utils/fMint";
import { getAccountBalance } from "../../utils/account";
import { getTotalFTMBalanceForAccount } from "../../utils/common";
import Loader from "../../components/Loader";
import useAccountSnapshot from "../../hooks/useAccountSnapshot";
import useWalletProvider from "../../hooks/useWalletProvider";
import useSettings from "../../hooks/useSettings";
import ErrorBoundary from "../../components/ErrorBoundary";

const BalanceContent: React.FC<any> = ({
  accountData,
  fMint,
  delegations,
  tokenPrice,
  currency,
}) => {
  const { color } = useContext(ThemeContext);
  const { walletContext } = useWalletProvider();
  const { accountSnapshots } = useAccountSnapshot();
  const { settings } = useSettings();

  const accountBalance = getAccountBalance(accountData);
  const totalDelegated = getAccountDelegationSummary(delegations);
  const fMintFTMCollateral = getLockedCollateral(fMint);
  // const cRatioPercentage = getCurrentCRatio(fMint);

  const availableFTM = toFormattedBalance(weiToUnit(accountBalance));
  const stakedFTM = toFormattedBalance(weiToUnit(totalDelegated.totalStaked));
  const rewardsFTM = toFormattedBalance(
    weiToUnit(totalDelegated.totalPendingRewards)
  );
  // const mintedSFTM = toFormattedBalance(
  //   weiToUnit(totalDelegated.totalMintedSFTM)
  // );
  // const lockedFTMCollateral = toFormattedBalance(weiToUnit(fMintFTMCollateral));
  const assetBalance =
    accountSnapshots[walletContext.activeWallet.address]?.walletAssetValue[
      settings.currency
    ];

  const totalBalance = toFormattedBalance(
    (
      getTotalFTMBalanceForAccount(
        accountBalance,
        totalDelegated.totalStaked,
        fMintFTMCollateral,
        tokenPrice
      ) + assetBalance
    ).toString()
  );

  return (
    <Row style={{ flexWrap: "wrap", gap: "2rem" }}>
      <Column style={{ flex: 2 }}>
        <Row style={{ alignItems: "flex-end" }}>
          <div style={{ fontSize: "64px", fontWeight: "bold" }}>
            {`${toCurrencySymbol(currency)}${totalBalance[0]}`}
          </div>
          <div
            style={{
              fontSize: "32px",
              fontWeight: "bold",
              color: color.greys.darkGrey(),
              marginBottom: ".5rem",
            }}
          >
            {totalBalance[1]}
          </div>
        </Row>
      </Column>
      <Row
        style={{
          flex: 4,
          flexWrap: "wrap",
          gap: "2rem",
        }}
      >
        <StatPair
          title="Available"
          value1={availableFTM[0]}
          value2={availableFTM[1]}
          suffix="FTM"
        />
        <StatPair
          title="Staked"
          value1={stakedFTM[0]}
          value2={stakedFTM[1]}
          suffix="FTM"
        />
        <StatPair
          title="Pending rewards"
          value1={rewardsFTM[0]}
          value2={rewardsFTM[1]}
          suffix="FTM"
        />
      </Row>
      {/*<Column style={{ flex: 2 }}>*/}
      {/*  <StatPair*/}
      {/*    title="Minted sFTM"*/}
      {/*    value1={mintedSFTM[0]}*/}
      {/*    value2={mintedSFTM[1]}*/}
      {/*    suffix="sFTM"*/}
      {/*  />*/}
      {/*  <Spacer />*/}
      {/*  <StatPair*/}
      {/*    title="Locked collateral"*/}
      {/*    value1={lockedFTMCollateral[0]}*/}
      {/*    value2={lockedFTMCollateral[1]}*/}
      {/*    suffix="FTM"*/}
      {/*  />*/}
      {/*  /!*<Spacer />*!/*/}
      {/*  /!*<StatPair title="Net APY" value1="8.41%" value2="" suffix="" />*!/*/}
      {/*</Column>*/}
      {/*<Column style={{ flex: 2 }}>*/}
      {/*  <CRatio value={cRatioPercentage ? cRatioPercentage.toFixed(0) : 0} />*/}
      {/*</Column>*/}
    </Row>
  );
};

const Balance: React.FC<any> = ({
  accountData,
  fMint,
  delegations,
  tokenPrice,
  currency,
  loading,
}) => {
  return (
    <ContentBox style={{ width: "100%", boxSizing: "border-box" }}>
      <Column style={{ flex: 1 }}>
        <Heading1>Balance</Heading1>
        <Spacer size="xs" />
        <ErrorBoundary name="[Home][Balance]">
          {loading ? (
            <Loader />
          ) : (
            <BalanceContent
              accountData={accountData.data}
              fMint={fMint.data}
              delegations={delegations.data}
              tokenPrice={tokenPrice}
              currency={currency}
            />
          )}
        </ErrorBoundary>
      </Column>
    </ContentBox>
  );
};

export default Balance;
