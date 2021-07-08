import React, { useContext, useState } from "react";
import Row, { ResponsiveRow } from "../../components/Row/Row";
import { ThemeContext } from "styled-components";
import Column from "../../components/Column";
import {
  Button,
  ContentBox,
  Heading1,
  OverlayButton,
  Typo1,
  Typo2,
  Typo3,
} from "../../components";
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
import {
  hexToUnit,
  toFormattedBalance,
  weiToUnit,
} from "../../utils/conversion";
import { getAccountBalance } from "../../utils/account";
import DelegationBalance from "../../components/DelegationBalance";
import useModal from "../../hooks/useModal";
import Modal from "../../components/Modal";
import ModalTitle from "../../components/ModalTitle";
import ModalContent from "../../components/ModalContent";
import delegationFallbackImg from "../../assets/img/delegationFallbackImg.png";
import useFantomContract, {
  SFC_SEND_METHODS,
} from "../../hooks/useFantomContract";
import useTransaction from "../../hooks/useTransaction";

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

const ClaimDelegationRewardRow: React.FC<any> = ({ activeDelegation }) => {
  const { color } = useContext(ThemeContext);
  const { txSFCContractMethod } = useFantomContract();
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const pendingReward = hexToUnit(
    activeDelegation.delegation.pendingRewards.amount
  );
  const formattedPendingReward = toFormattedBalance(
    hexToUnit(activeDelegation.delegation.pendingRewards.amount)
  );
  const handleClaimReward = async () => {
    setIsClaiming(true);
    try {
      await txSFCContractMethod(SFC_SEND_METHODS.CLAIM_REWARDS, [
        activeDelegation.delegation.toStakerId,
      ]);
      setIsClaiming(false);
      setClaimed(true);
    } catch (error) {
      setIsClaiming(false);
      console.error(error);
    }
  };

  return (
    <Row style={{ textAlign: "left", height: "3rem", padding: ".5rem 0" }}>
      <Row style={{ width: "18rem", alignItems: "center" }}>
        <img
          alt=""
          style={{
            borderRadius: "50%",
            width: "2rem",
            height: "2rem",
            marginRight: ".6rem",
          }}
          src={activeDelegation.delegationInfo.logoURL || delegationFallbackImg}
        />
        <Column>
          <Typo1 style={{ fontWeight: "bold" }}>
            {activeDelegation.delegationInfo.name || "Unnamed"}
          </Typo1>
        </Column>
      </Row>
      <Row style={{ width: "12rem", alignItems: "center" }}>
        <Typo1 style={{ fontWeight: "bold" }}>
          {claimed
            ? "0.00"
            : `${formattedPendingReward[0]}${formattedPendingReward[1]}`}{" "}
          FTM
        </Typo1>
      </Row>
      <Row
        style={{
          marginLeft: "auto",
          alignItems: "center",
          justifyContent: "flex-end",
        }}
      >
        <OverlayButton
          disabled={claimed || isClaiming || pendingReward < 0.01}
          onClick={() => handleClaimReward()}
        >
          <Typo1
            style={{
              fontWeight: "bold",
              color:
                claimed || pendingReward < 0.01
                  ? color.primary.cyan(0.5)
                  : color.primary.cyan(),
            }}
          >
            {claimed ? "Claimed" : isClaiming ? "Claiming..." : "Claim now"}
          </Typo1>
        </OverlayButton>
      </Row>
    </Row>
  );
};
const ClaimRewardsModal: React.FC<any> = ({
  onDismiss,
  accountDelegationsData,
  delegationsData,
}) => {
  const { color } = useContext(ThemeContext);
  const accountDelegations = getAccountDelegations(accountDelegationsData);
  const delegations = getDelegations(delegationsData);
  const activeDelegations = !(delegations && accountDelegations)
    ? []
    : accountDelegations.map((accountDelegation: any) => ({
        ...accountDelegation,
        delegationInfo: delegations.find((delegation) => {
          return delegation.id === accountDelegation.delegation.toStakerId;
        }),
      }));

  return (
    <Modal onDismiss={onDismiss}>
      <ModalTitle text="Claim Rewards" />
      <ModalContent>
        <Row style={{ textAlign: "left" }}>
          <Typo3
            style={{
              width: "18rem",
              color: color.greys.grey(),
            }}
          >
            Validator
          </Typo3>
          <Typo3 style={{ width: "12rem", color: color.greys.grey() }}>
            Pending rewards
          </Typo3>
          <div style={{ width: "5rem" }} />
        </Row>
        <Spacer size="sm" />
        {activeDelegations.map((delegation, index) => {
          const isLastRow = delegations.length === index + 1;
          return (
            <div
              key={`claim-rewards-row-${delegation.delegation.toStakerId}`}
              style={{
                borderBottom: !isLastRow && "2px solid #202F49",
              }}
            >
              <ClaimDelegationRewardRow activeDelegation={delegation} />
            </div>
          );
        })}
      </ModalContent>
    </Modal>
  );
};

const Rewards: React.FC<any> = ({
  loading,
  accountDelegations,
  delegations,
}) => {
  const [onPresentClaimRewardsModal] = useModal(
    <ClaimRewardsModal
      accountDelegationsData={accountDelegations?.data}
      delegationsData={delegations?.data}
    />,
    "staking-claim-rewards-modal"
  );
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
          <Button
            variant="primary"
            onClick={() => onPresentClaimRewardsModal()}
          >
            Claim rewards
          </Button>
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
    activeAddress,
    2000
  );

  useFantomApi(
    FantomApiMethods.getAccountBalance,
    {
      address: activeAddress,
    },
    activeAddress,
    2000
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
            loading={!activeDelegationsIsDoneLoading}
            accountDelegations={accountDelegations}
            delegations={delegations}
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
