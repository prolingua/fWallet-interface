import React, { useContext } from "react";
import Row, { ResponsiveRow } from "../../components/Row/Row";
import { ThemeContext } from "styled-components";
import Column from "../../components/Column";
import { Button, ContentBox, Heading1, Typo1, Typo2 } from "../../components";
import Spacer from "../../components/Spacer";
import StatPair from "../../components/StatPair";
import useFantomApi, { FantomApiMethods } from "../../hooks/useFantomApi";
import useFantomApiData from "../../hooks/useFantomApiData";
import useWalletProvider from "../../hooks/useWalletProvider";
import { getAccountDelegationSummary } from "../../utils/delegations";
import { toFormattedBalance, weiToUnit } from "../../utils/conversion";
import { getAccountBalance } from "../../utils/account";

const OverviewContent: React.FC<any> = ({ accountDelegationsData }) => {
  const totalDelegated = getAccountDelegationSummary(accountDelegationsData);
  const stakedFTM = toFormattedBalance(weiToUnit(totalDelegated.totalStaked));
  return (
    <Row>
      <StatPair
        title="Staked FTM"
        value1={stakedFTM[0]}
        value2={stakedFTM[1]}
        suffix="FTM"
      />
    </Row>
  );
};
const Overview: React.FC<any> = ({ loading, accountDelegations }) => {
  return (
    <ContentBox>
      <Column>
        <Heading1>Overview</Heading1>
        <Spacer />
        {loading ? (
          <div>Loading...</div>
        ) : (
          <OverviewContent accountDelegationsData={accountDelegations.data} />
        )}
      </Column>
    </ContentBox>
  );
};

const DelegateContent: React.FC<any> = ({ accountBalanceData }) => {
  const accountBalance = getAccountBalance(accountBalanceData);
  const formattedAccountBalance = toFormattedBalance(weiToUnit(accountBalance));
  return (
    <StatPair
      title="Available FTM"
      value1={formattedAccountBalance[0]}
      value2={formattedAccountBalance[1]}
      suffix="FTM"
    />
  );
};
const Delegate: React.FC<any> = ({ loading, accountBalance }) => {
  return (
    <ContentBox style={{ flex: 1 }}>
      <Column>
        <Heading1>Delegate</Heading1>
        <Spacer />
        <Typo2 style={{ color: "#B7BECB" }}>
          Delegate your FTM to a validator node and earn staking rewards.
        </Typo2>
        <Spacer />
        {loading ? (
          <div>Loading...</div>
        ) : (
          <DelegateContent accountBalanceData={accountBalance.data} />
        )}
        <Spacer />
        <Button variant="primary">Stake now</Button>
      </Column>
    </ContentBox>
  );
};

const Staking: React.FC<any> = () => {
  const { breakpoints } = useContext(ThemeContext);
  const { apiData } = useFantomApiData();
  const { walletContext } = useWalletProvider();

  const activeAddress = walletContext.activeWallet.address
    ? walletContext.activeWallet.address.toLowerCase()
    : null;

  const accountDelegations = apiData[
    FantomApiMethods.getDelegationsForAccount
  ].get(activeAddress);
  const accountBalance = apiData[FantomApiMethods.getAccountBalance].get(
    activeAddress
  );

  const overviewIsDoneLoading = activeAddress && accountDelegations?.data;
  const delegateIsDoneLoading = activeAddress && accountBalance?.data;

  useFantomApi(
    FantomApiMethods.getDelegationsForAccount,
    {
      address: activeAddress,
    },
    activeAddress
  );

  useFantomApi(
    FantomApiMethods.getAccountBalance,
    {
      address: activeAddress,
    },
    activeAddress
  );

  return (
    <ResponsiveRow breakpoint={breakpoints.ultra}>
      <Column style={{ flex: 7 }}>
        <Overview
          loading={!overviewIsDoneLoading}
          accountDelegations={accountDelegations}
        />
        <Spacer />
        <Row>
          <Delegate
            loading={!delegateIsDoneLoading}
            accountBalance={accountBalance}
          />
          <Spacer />
          <ContentBox style={{ flex: 1 }}>
            <Heading1>Rewards</Heading1>
          </ContentBox>
        </Row>
        <Spacer />
        <Row>
          <ContentBox style={{ flex: 1 }}>
            <Heading1>Liquid Staking</Heading1>
          </ContentBox>
          <Spacer />
          <ContentBox style={{ flex: 1, backgroundColor: "transparent" }} />
        </Row>
      </Column>
      <Spacer />
      <Column style={{ flex: 5 }}>
        <ContentBox>
          <Heading1>Active Delegations</Heading1>
        </ContentBox>
      </Column>
    </ResponsiveRow>
  );
};

export default Staking;
