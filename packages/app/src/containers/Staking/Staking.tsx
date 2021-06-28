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
import {
  AccountDelegation,
  Delegation,
  getAccountDelegations,
  getAccountDelegationSummary,
  getDelegations,
} from "../../utils/delegations";
import { toFormattedBalance, weiToUnit } from "../../utils/conversion";
import { getAccountBalance } from "../../utils/account";
import DelegationBalance from "../../components/DelegationBalance";

export interface ActiveDelegation {
  delegation: AccountDelegation;
  delegationInfo: Delegation;
}
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
        spacer="xs"
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
      spacer="xs"
      titleColor="#19E1FF"
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
        <Column style={{ marginTop: "auto", width: "100%" }}>
          <Spacer />
          {loading ? (
            <div>Loading...</div>
          ) : (
            <DelegateContent accountBalanceData={accountBalance.data} />
          )}
          <Spacer />
          <Button variant="primary">Stake now</Button>
        </Column>
      </Column>
    </ContentBox>
  );
};

const RewardsContent: React.FC<any> = ({ accountDelegationsData }) => {
  const totalDelegated = getAccountDelegationSummary(accountDelegationsData);
  const rewardsFTM = toFormattedBalance(
    weiToUnit(totalDelegated.totalPendingRewards)
  );
  return (
    <StatPair
      title="Pending rewards"
      value1={rewardsFTM[0]}
      value2={rewardsFTM[1]}
      suffix="FTM"
      spacer="xs"
      titleColor="#19E1FF"
    />
  );
};
const Rewards: React.FC<any> = ({ loading, accountDelegations }) => {
  return (
    <ContentBox style={{ flex: 1 }}>
      <Column>
        <Heading1>Rewards</Heading1>
        <Spacer />
        <Typo2 style={{ color: "#B7BECB" }}>
          Claim your rewards or compound them to maximize your returns.
        </Typo2>
        <Spacer />
        <Column style={{ marginTop: "auto", width: "100%" }}>
          {loading ? (
            <div>Loading...</div>
          ) : (
            <RewardsContent accountDelegationsData={accountDelegations.data} />
          )}
          <Spacer />
          <Button variant="primary">Claim rewards</Button>
        </Column>
      </Column>
    </ContentBox>
  );
};

const LiquidStakingContent: React.FC<any> = ({ accountDelegationsData }) => {
  const totalDelegated = getAccountDelegationSummary(accountDelegationsData);
  const mintedSFTM = toFormattedBalance(
    weiToUnit(totalDelegated.totalMintedSFTM)
  );
  return (
    <StatPair
      title="Minted sFTM"
      value1={mintedSFTM[0]}
      value2={mintedSFTM[1]}
      suffix="FTM"
      spacer="xs"
      titleColor="#19E1FF"
    />
  );
};
const LiquidStaking: React.FC<any> = ({ loading, accountDelegations }) => {
  return (
    <ContentBox style={{ flex: 1 }}>
      <Column>
        <Heading1>Liquid Staking</Heading1>
        <Spacer />
        <Typo2 style={{ color: "#B7BECB" }}>
          Mint sFTM and use it as collateral in Fantom Finance.
        </Typo2>
        <Spacer />
        <Column style={{ marginTop: "auto", width: "100%" }}>
          {loading ? (
            <div>Loading...</div>
          ) : (
            <LiquidStakingContent
              accountDelegationsData={accountDelegations.data}
            />
          )}
          <Spacer />
          <Button variant="primary">Mint sFTM</Button>
          <Spacer size="sm" />
          <Button style={{ backgroundColor: "#202F49" }} variant="primary">
            Repay sFTM
          </Button>
        </Column>
      </Column>
    </ContentBox>
  );
};

const ActiveDelegationsContent: React.FC<any> = ({
  accountDelegationsData,
  delegationsData,
}) => {
  const { color } = useContext(ThemeContext);
  const accountDelegations = getAccountDelegations(accountDelegationsData);
  const delegations = getDelegations(delegationsData);
  const activeDelegations = accountDelegations.map(
    (accountDelegation: any) => ({
      ...accountDelegation,
      delegationInfo: delegations.find((delegation) => {
        return delegation.id === accountDelegation.delegation.toStakerId;
      }),
    })
  );

  return (
    <div>
      <Row style={{ justifyContent: "space-between" }}>
        <Typo2 style={{ fontWeight: "bold", color: color.greys.grey() }}>
          Validator
        </Typo2>
        <Typo2 style={{ fontWeight: "bold", color: color.greys.grey() }}>
          Balance
        </Typo2>
      </Row>
      <Spacer size="lg" />
      {activeDelegations.map((delegation: ActiveDelegation) => {
        return (
          <div key={delegation.delegation.toStakerId}>
            <DelegationBalance activeDelegation={delegation} />
            <Spacer size="lg" />
          </div>
        );
      })}
    </div>
  );
};
const ActiveDelegations: React.FC<any> = ({
  loading,
  accountDelegations,
  delegations,
}) => {
  return (
    <ContentBox>
      <Column style={{ width: "100%" }}>
        <Heading1>Active Delegations</Heading1>
        <Spacer />
        {loading ? (
          <div>Loading...</div>
        ) : (
          <ActiveDelegationsContent
            accountDelegationsData={accountDelegations.data}
            delegationsData={delegations.data}
          />
        )}
        <Spacer />
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

  const delegations = apiData[FantomApiMethods.getDelegations];
  const accountDelegations = apiData[
    FantomApiMethods.getDelegationsForAccount
  ].get(activeAddress);
  const accountBalance = apiData[FantomApiMethods.getAccountBalance].get(
    activeAddress
  );

  const accountDelegationsIsDoneLoading =
    activeAddress && accountDelegations?.data;
  const delegateIsDoneLoading = activeAddress && accountBalance?.data;
  const activeDelegationsIsDoneLoading =
    activeAddress && accountDelegations?.data && delegations?.data;

  useFantomApi(FantomApiMethods.getDelegations);

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
    <ResponsiveRow
      breakpoint={breakpoints.ultra}
      style={{ marginBottom: "1.5rem" }}
    >
      <Column style={{ flex: 7 }}>
        <Overview
          loading={!accountDelegationsIsDoneLoading}
          accountDelegations={accountDelegations}
        />
        <Spacer />
        <Row>
          <Delegate
            loading={!delegateIsDoneLoading}
            accountBalance={accountBalance}
          />
          <Spacer />
          <Rewards
            loading={!accountDelegationsIsDoneLoading}
            accountDelegations={accountDelegations}
          />
        </Row>
        <Spacer />
        <Row>
          <LiquidStaking
            loading={!accountDelegationsIsDoneLoading}
            accountDelegations={accountDelegations}
          />
          <Spacer />
          <ContentBox style={{ flex: 1, backgroundColor: "transparent" }} />
        </Row>
      </Column>
      <Spacer />
      <Column style={{ flex: 5 }}>
        <ActiveDelegations
          loading={!activeDelegationsIsDoneLoading}
          accountDelegations={accountDelegations}
          delegations={delegations}
        />
      </Column>
    </ResponsiveRow>
  );
};

export default Staking;
