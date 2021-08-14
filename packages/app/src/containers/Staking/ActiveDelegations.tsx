import {
  AccountDelegation,
  Validator,
  delegationDaysLockedLeft,
  generateWithdrawalRequestId,
  getAccountDelegations,
  getValidators,
  canLockDelegation,
  maxLockDays,
  withdrawDaysLockedLeft,
  withdrawLockTimeLeft,
} from "../../utils/delegation";
import React, { useContext, useEffect, useState } from "react";
import styled, { ThemeContext } from "styled-components";
import useFantomContract, {
  SFC_TX_METHODS,
} from "../../hooks/useFantomContract";
import useTransaction from "../../hooks/useTransaction";
import {
  formatHexToInt,
  hexToUnit,
  toFormattedBalance,
  unitToWei,
} from "../../utils/conversion";
import Modal from "../../components/Modal";
import ModalTitle from "../../components/ModalTitle";
import Column from "../../components/Column";
import Row from "../../components/Row";
import {
  Button,
  ContentBox,
  Heading1,
  Heading2,
  Heading3,
  OverlayButton,
  Typo1,
  Typo2,
  Typo3,
} from "../../components";
import Spacer from "../../components/Spacer";
import useModal from "../../hooks/useModal";
import StatPair from "../../components/StatPair";
import { formatDate } from "../../utils/common";
import DelegationBalance, {
  DelegationNameInfo,
} from "../../components/DelegationBalance/DelegationBalance";
import SliderWithMarks from "../../components/Slider";
import CircularRatioBar from "../../components/CircularRatioBar";
import WithdrawRequests from "./WithdrawRequests";
import { BigNumber } from "@ethersproject/bignumber";
import useFantomApi, { FantomApiMethods } from "../../hooks/useFantomApi";
import useFantomApiData from "../../hooks/useFantomApiData";
import useWalletProvider from "../../hooks/useWalletProvider";
import WithdrawRequestRow from "../../components/WithdrawRequestRow";

export interface ActiveDelegation {
  delegation: AccountDelegation;
  delegationInfo: Validator;
}

const UndelegateModal: React.FC<any> = ({
  onDismiss,
  stakerId,
  delegatedAmount,
}) => {
  const { color } = useContext(ThemeContext);
  const { txSFCContractMethod } = useFantomContract();
  const { transaction } = useTransaction();
  const [undelegateAmount, setUndelegateAmount] = useState(0);
  const formattedDelegatedAmount = toFormattedBalance(delegatedAmount);

  const [txHash, setTxHash] = useState(null);
  const tx = transaction[txHash];
  const isPending = tx && tx.status === "pending";
  const isCompleted = tx && tx.status === "completed";

  const handleSetMax = () => {
    setUndelegateAmount(delegatedAmount);
  };
  const handleUnstake = async () => {
    const wrId = generateWithdrawalRequestId().toString();
    const hash = await txSFCContractMethod(SFC_TX_METHODS.UNDELEGATE, [
      stakerId,
      wrId,
      unitToWei(undelegateAmount.toString()),
    ]);
    setTxHash(hash);
  };

  useEffect(() => {
    if (isCompleted) {
      setTimeout(() => {
        onDismiss();
      }, 1000);
    }
  }, [tx]);

  return (
    <Modal style={{ padding: "2rem 6rem" }} onDismiss={onDismiss}>
      <ModalTitle text="How much FTM would you like to unstake?" />
      <Column style={{ width: "100%", alignItems: "center" }}>
        <Row>
          <Typo1 style={{ color: color.greys.grey() }}>
            Staking position size:{" "}
          </Typo1>
          <Spacer size="xs" />
          <Typo1 style={{ fontWeight: "bold" }}>
            {" "}
            {`${formattedDelegatedAmount[0]}${formattedDelegatedAmount[1]}`} FTM
          </Typo1>
        </Row>
        <Spacer size="xl" />
        <Row
          style={{
            width: "100%",
            backgroundColor: color.primary.black(),
            borderRadius: "8px",
          }}
        >
          <Row
            style={{
              padding: "2rem",
              width: "100%",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Heading1 style={{ color: color.white }}>
              {parseFloat(undelegateAmount.toFixed(2)).toString()} FTM
            </Heading1>
            <Spacer />
            <Button
              fontSize="14px"
              color={color.greys.grey()}
              padding="8px"
              variant="tertiary"
              onClick={handleSetMax}
            >
              MAX
            </Button>
          </Row>
        </Row>
        <Spacer size="xl" />
        <div style={{ width: "98%" }}>
          <SliderWithMarks
            value={undelegateAmount}
            setValue={setUndelegateAmount}
            max={parseFloat(delegatedAmount.toString())}
            steps={0.1}
          />
          <Spacer size="xxl" />
          <Spacer size="xxl" />
          <Button
            disabled={isPending || isCompleted || undelegateAmount < 0.01}
            style={{ padding: "1rem", width: "100%" }}
            variant="primary"
            onClick={handleUnstake}
          >
            {isCompleted ? "Success" : isPending ? "Unstaking..." : "Unstake"}
          </Button>
          <Spacer size="sm" />
          <Typo1 style={{ textAlign: "center", color: color.greys.grey() }}>
            *as a security measure, unstaking takes 7 days.
          </Typo1>
          <Spacer size="xl" />
        </div>
      </Column>
    </Modal>
  );
};

const DelegationOverviewTab: React.FC<any> = ({ activeDelegation }) => {
  const { txSFCContractMethod } = useFantomContract();
  const { transaction } = useTransaction();
  const [txHash, setTxHash] = useState({} as any);

  const delegatedAmount = hexToUnit(
    activeDelegation.delegation.amountDelegated
  );
  const lockedAmount = hexToUnit(activeDelegation.delegation.lockedAmount);
  const pendingRewards = hexToUnit(
    activeDelegation.delegation.pendingRewards.amount
  );
  const daysLocked = delegationDaysLockedLeft(activeDelegation.delegation);
  const delegationDate = new Date(
    formatHexToInt(activeDelegation.delegation.createdTime) * 1000
  );
  const unlockDate = new Date(
    formatHexToInt(activeDelegation.delegation.lockedUntil) * 1000
  );
  const selfStaked = hexToUnit(activeDelegation.delegationInfo.stake);
  const totalStaked = hexToUnit(activeDelegation.delegationInfo.totalStake);
  const delegations = formatHexToInt(
    activeDelegation.delegationInfo.delegations.totalCount
  );
  const freeSpace = hexToUnit(activeDelegation.delegationInfo.delegatedLimit);
  const freeSpacePercentage =
    100 -
    freeSpace / hexToUnit(activeDelegation.delegationInfo.totalDelegatedLimit);

  const formattedDelegatedAmount = toFormattedBalance(delegatedAmount);
  const formattedPendingRewards = toFormattedBalance(pendingRewards);
  const formattedLockedAmount = toFormattedBalance(lockedAmount);
  const formattedSelfStaked = toFormattedBalance(selfStaked);
  const formattedTotalStaked = toFormattedBalance(totalStaked);
  const formattedFreeSpace = toFormattedBalance(freeSpace);

  const claimRewardTx = transaction[txHash["claimRewardTx"]];
  const isClaiming = claimRewardTx && claimRewardTx.status === "pending";
  const claimed = claimRewardTx && claimRewardTx.status === "completed";

  const maxDelegationLockUp = maxLockDays(activeDelegation.delegationInfo);

  const handleClaimReward = async () => {
    try {
      const hash = await txSFCContractMethod(SFC_TX_METHODS.CLAIM_REWARDS, [
        activeDelegation.delegation.toStakerId,
      ]);
      setTxHash({ ...txHash, claimRewardTx: hash });
    } catch (error) {
      console.error(error);
    }
  };

  const [onPresentUndelegateModal] = useModal(
    <UndelegateModal
      stakerId={activeDelegation.delegation.toStakerId}
      delegatedAmount={delegatedAmount}
    />,
    "undelegate-modal"
  );
  return (
    <>
      <ContentBox style={{ width: "100%", padding: 0 }}>
        <Column style={{ padding: "2rem", width: "100%" }}>
          <Row
            style={{ alignItems: "center", justifyContent: "space-between" }}
          >
            <StatPair
              title="Delegation amount"
              value1={formattedDelegatedAmount[0]}
              value2={formattedDelegatedAmount[1]}
              suffix="FTM"
              width="12rem"
            />
            <Spacer size="xxl" />
            <StatPair
              title="Delegation date"
              value2={formatDate(delegationDate)}
              width="12rem"
            />
            <Spacer size="xxl" />
            <Row>
              <StatPair
                title="Pending rewards"
                value1={formattedPendingRewards[0]}
                value2={formattedPendingRewards[1]}
                suffix="FTM"
              />
              <Spacer />
              <Button
                disabled={claimed || isClaiming || pendingRewards < 0.01}
                onClick={() => handleClaimReward()}
                style={{
                  flex: 1,
                  padding: ".5rem 1.5rem",
                  alignSelf: "center",
                }}
                variant="primary"
              >
                {claimed ? "Claimed" : isClaiming ? "Claiming..." : "Claim"}
              </Button>
            </Row>
          </Row>
          <Spacer size="xxl" />
          <Row style={{ alignItems: "center" }}>
            <StatPair
              title="Locked amount"
              value1={formattedLockedAmount[0]}
              value2={formattedLockedAmount[1]}
              suffix="FTM"
              width="12rem"
            />
            <Spacer size="xxl" />
            <StatPair
              title="Unlocks in"
              value1={daysLocked > 0 ? `${daysLocked} days` : "-"}
              value2={daysLocked > 0 && `\u00A0\u00A0${formatDate(unlockDate)}`}
            />
          </Row>
        </Column>
      </ContentBox>
      <Spacer />
      <ContentBox
        style={{ backgroundColor: "transparent", width: "100%", padding: 0 }}
      >
        <Row
          style={{
            width: "100%",
            padding: "2rem",
            justifyContent: "space-between",
          }}
        >
          <Column>
            <StatPair
              title="Lock-up"
              value1={
                maxDelegationLockUp > 0 ? `${maxDelegationLockUp} days` : "-"
              }
              value1FontSize="20px"
              width="12rem"
            />
            <Spacer />
            <StatPair
              title="Delegators"
              value1={delegations}
              value1FontSize="20px"
              width="12rem"
            />
            <Spacer />
          </Column>
          <Column>
            <div style={{ height: "5rem" }}>
              <CircularRatioBar
                ratios={[70, 80]}
                ratioColors={["#3F69D4", "#2BBEBE"]}
              >
                <DelegationNameInfo
                  delegationInfo={activeDelegation.delegationInfo}
                  imageSize="35px"
                  flexColumn
                />
              </CircularRatioBar>
            </div>
          </Column>
          <Column
            style={{ alignItems: "center", justifyContent: "space-between" }}
          >
            <StatPair
              title="Self staked"
              titleColor="#3F69D4"
              value1={formattedSelfStaked[0]}
              value1FontSize="20px"
              width="12rem"
            />
            <Spacer />
            <StatPair
              title="Total staked"
              titleColor="#2BBEBE"
              value1={formattedTotalStaked[0]}
              value1FontSize="20px"
              width="12rem"
            />
            <Spacer />
            <StatPair
              title="Free space"
              value1={formattedFreeSpace[0]}
              value1FontSize="20px"
              value2={`(${freeSpacePercentage.toFixed(0)}%)`}
              width="12rem"
            />
          </Column>
        </Row>
      </ContentBox>
      <Spacer size="xl" />
      <Row style={{ padding: "0rem 2rem" }}>
        <Button
          onClick={() => onPresentUndelegateModal()}
          style={{ flex: 1, border: "1px solid red" }}
          variant="secondary"
        >
          Undelegate
        </Button>
      </Row>
      <Spacer />
    </>
  );
};

const WithdrawRequestsTab: React.FC<any> = ({ activeDelegation }) => {
  const { color } = useContext(ThemeContext);
  const withdrawRequests = activeDelegation.delegation.withdrawRequests
    .filter((wr: any) => wr.withdrawTime === null)
    .sort((a: any, b: any) => a.createdTime - b.createdTime)
    .map((activeWr: any) => ({
      toStakerId: activeDelegation.delegation.toStakerId,
      ...activeWr,
    }));

  const totalAmountToWithdraw = withdrawRequests.reduce(
    (accumulator: number, current: any) =>
      accumulator + hexToUnit(current.amount),
    0
  );
  const formattedTotalAmountToWithdraw = toFormattedBalance(
    totalAmountToWithdraw
  );

  return (
    <ContentBox style={{ width: "100%", height: "100%", padding: 0 }}>
      <Column style={{ padding: "2rem", width: "100%" }}>
        <StatPair
          title="Total undelegations"
          value1={formattedTotalAmountToWithdraw[0]}
          value2={formattedTotalAmountToWithdraw[1]}
          suffix="FTM"
        />
        <Spacer size="xl" />
        <Row style={{ justifyContent: "space-between" }}>
          <Typo1
            style={{ flex: 2, fontWeight: "bold", color: color.greys.grey() }}
          >
            Amount
          </Typo1>
          <Typo1
            style={{
              fontWeight: "bold",
              color: color.greys.grey(),
              alignSelf: "flex-end",
            }}
          >
            Unlocking in
          </Typo1>
        </Row>
        <Spacer size="sm" />
        <Column style={{ gap: "1rem" }}>
          {withdrawRequests.length ? (
            withdrawRequests.map((wr: any) => {
              return <WithdrawRequestRow withdrawRequest={wr} />;
            })
          ) : (
            <Heading3>No pending withdraw requests</Heading3>
          )}
        </Column>
      </Column>
    </ContentBox>
  );
};

const ManageDelegationModal: React.FC<any> = ({
  onDismiss,
  stakerId,
  setActiveStakerId,
  activeDelegations,
}) => {
  const { color } = useContext(ThemeContext);
  const [activeTab, setActiveTab] = useState("Overview");

  const selectedDelegation = activeDelegations.find(
    (activeDelegation: any) =>
      activeDelegation.delegation.toStakerId === stakerId
  );

  useEffect(() => {
    return () => setActiveStakerId(null);
  }, []);

  return (
    <Modal
      onDismiss={onDismiss}
      style={{
        padding: "0",
        backgroundColor: color.primary.black(),
        minWidth: "50rem",
      }}
    >
      <Row style={{ alignSelf: "flex-start" }}>
        <Row style={{ height: "4rem" }}>
          <OverlayButton
            style={{
              backgroundColor:
                activeTab === "Overview"
                  ? color.secondary.navy()
                  : "transparent",
              padding: "0 2rem",
            }}
            onClick={() => setActiveTab("Overview")}
          >
            <Heading3>Overview</Heading3>
          </OverlayButton>
          <OverlayButton
            style={{
              backgroundColor:
                activeTab === "Pending undelegations"
                  ? color.secondary.navy()
                  : "transparent",
              padding: "0 2rem",
            }}
            onClick={() => setActiveTab("Pending undelegations")}
          >
            <Heading3>Pending undelegations</Heading3>
          </OverlayButton>
        </Row>
      </Row>
      <div style={{ height: "625px", width: "100%" }}>
        {activeTab === "Overview" ? (
          <DelegationOverviewTab activeDelegation={selectedDelegation} />
        ) : (
          <WithdrawRequestsTab activeDelegation={selectedDelegation} />
        )}
      </div>
    </Modal>
  );
};

const ActiveDelegationsContent: React.FC<any> = ({
  accountDelegationsData,
  delegationsData,
}) => {
  const { color } = useContext(ThemeContext);
  const [activeStakerId, setActiveStakerId] = useState(null);
  const accountDelegations = getAccountDelegations(accountDelegationsData);
  const delegations = getValidators(delegationsData);
  const activeDelegations = accountDelegations.map(
    (accountDelegation: any) => ({
      ...accountDelegation,
      delegationInfo: delegations.find((delegation) => {
        return delegation.id === accountDelegation.delegation.toStakerId;
      }),
    })
  );

  const [onPresentManageDelegationModal] = useModal(
    <ManageDelegationModal
      stakerId={activeStakerId}
      setActiveStakerId={setActiveStakerId}
      activeDelegations={activeDelegations}
    />,
    "manage-delegation-modal"
  );
  useEffect(() => {
    if (activeStakerId) {
      onPresentManageDelegationModal();
    }
  }, [activeStakerId]);

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
      {activeDelegations.length ? (
        activeDelegations.map((delegation: ActiveDelegation) => {
          return (
            <StyledActiveDelegationRow
              onClick={() => {
                setActiveStakerId(delegation.delegation.toStakerId);
              }}
              key={delegation.delegation.toStakerId}
            >
              <DelegationBalance activeDelegation={delegation} />
            </StyledActiveDelegationRow>
          );
        })
      ) : (
        <Heading3>No active delegations</Heading3>
      )}
    </div>
  );
};
const StyledActiveDelegationRow = styled.div`
  padding: 1rem 2rem;
  margin: 0 -2rem;
  cursor: pointer;
  :hover {
    background-color: ${(props) => props.theme.color.primary.semiWhite(0.1)};
    cursor: pointer;
  }
`;

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

export default ActiveDelegations;
