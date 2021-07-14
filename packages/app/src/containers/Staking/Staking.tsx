import React, { useContext, useEffect, useState } from "react";
import Row, { ResponsiveRow } from "../../components/Row/Row";
import styled, { ThemeContext } from "styled-components";
import Column from "../../components/Column";
import {
  Button,
  ContentBox,
  Heading1,
  Heading3,
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
  daysLockedLeft,
  Delegation,
  getAccountDelegations,
  getAccountDelegationSummary,
  getDelegations,
  nodeUptime,
} from "../../utils/delegations";
import {
  formatHexToBN,
  formatHexToInt,
  hexToUnit,
  toFormattedBalance,
  unitToWei,
  weiToMaxUnit,
  weiToUnit,
} from "../../utils/conversion";
import { getAccountBalance } from "../../utils/account";
import DelegationBalance from "../../components/DelegationBalance";
import useModal from "../../hooks/useModal";
import Modal from "../../components/Modal";
import ModalTitle from "../../components/ModalTitle";
import ModalContent from "../../components/ModalContent";
import useFantomContract, {
  SFC_TX_METHODS,
  STAKE_TOKENIZER_TX_METHODS,
} from "../../hooks/useFantomContract";
import { FANTOM_NATIVE, formatDate } from "../../utils/common";
import InputCurrency from "../../components/InputCurrency";
import Slider from "rc-slider";
import "rc-slider/assets/index.css";
import { DelegationNameInfo } from "../../components/DelegationBalance/DelegationBalance";
import Scrollbar from "../../components/Scrollbar";
import useFantomERC20 from "../../hooks/useFantomERC20";
// @ts-ignore
import { addresses } from "@f-wallet/contracts";
import { BigNumber } from "@ethersproject/bignumber";
import config from "../../config/config.test";
import { parse } from "url";

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

const InputCurrencyBox: React.FC<any> = ({ value, max, setValue }) => {
  const { color } = useContext(ThemeContext);
  const [error, setError] = useState(null);
  const handleSetMax = () => {
    setError(null);
    setValue(max);
  };

  return (
    <Row
      style={{
        width: "100%",
        backgroundColor: "#202F49",
        borderRadius: "8px",
        height: "64px",
        alignItems: "center",
      }}
    >
      <Spacer />
      <InputCurrency
        value={value}
        max={max}
        handleValue={setValue}
        handleError={setError}
        token={FANTOM_NATIVE}
      />
      <Row style={{ alignItems: "center" }}>
        <Button
          fontSize="14px"
          color={color.greys.grey()}
          padding="8px"
          style={{ flex: 1 }}
          variant="tertiary"
          onClick={handleSetMax}
        >
          MAX
        </Button>
        <Spacer />
      </Row>
    </Row>
  );
};

const DelegationSelectRow: React.FC<any> = ({ delegation }) => {
  const formattedTotalStake = toFormattedBalance(
    hexToUnit(delegation.totalStake)
  );
  const formattedLimit = toFormattedBalance(
    hexToUnit(delegation.delegatedLimit)
  );
  const uptime = nodeUptime(delegation);

  return (
    <Row
      style={{
        margin: "0 .5rem",
        padding: ".5rem 0",
        alignItems: "center",
      }}
    >
      <div
        style={{
          textAlign: "left",
          width: "10rem",
        }}
      >
        <DelegationNameInfo
          imageSize="32px"
          delegationInfo={delegation.stakerInfo}
        />
      </div>
      <Typo2 style={{ width: "5rem", fontWeight: "bold" }}>
        {parseInt(delegation.id)}
      </Typo2>
      <Typo2 style={{ width: "10rem", fontWeight: "bold" }}>
        {formattedTotalStake[0]}
      </Typo2>
      <Typo2 style={{ width: "10rem", fontWeight: "bold" }}>
        {formattedLimit[0]}
      </Typo2>
      <Typo2 style={{ width: "5rem", fontWeight: "bold" }}>
        {" "}
        {parseFloat(uptime.toFixed(2)).toString()}%
      </Typo2>
    </Row>
  );
};

const DelegateModal: React.FC<any> = ({
  onDismiss,
  delegationsData,
  accountBalanceData,
}) => {
  const { color } = useContext(ThemeContext);
  const [delegateAmount, setDelegateAmount] = useState("");
  const [selectedDelegation, setSelectedDelegation] = useState(null);
  const { txSFCContractMethod, isPending } = useFantomContract();
  const balanceInWei = getAccountBalance(accountBalanceData);
  const balance = weiToMaxUnit(balanceInWei.toString());
  const delegations = getDelegations(delegationsData);

  const handleSetDelegateAmount = (value: string) => {
    if (parseFloat(value) > balance) {
      return setDelegateAmount(balance.toString());
    }
    return setDelegateAmount(value);
  };

  const handleDelegate = async () => {
    try {
      await txSFCContractMethod(SFC_TX_METHODS.DELEGATE, [
        selectedDelegation,
        unitToWei(parseFloat(delegateAmount).toString()),
      ]);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Modal onDismiss={onDismiss}>
      <ModalTitle text="Delegation" />
      <Heading3 style={{ color: color.greys.grey() }}>
        How much would you like to delegate?
      </Heading3>
      <Spacer />
      <InputCurrencyBox
        value={delegateAmount}
        setValue={handleSetDelegateAmount}
        max={balance}
      />
      <Spacer size="sm" />
      <div style={{ width: "98%" }}>
        <Slider
          onChange={(value) => setDelegateAmount(value.toString())}
          value={parseFloat(delegateAmount)}
          min={0}
          max={parseInt(balance.toString())}
          trackStyle={{ backgroundColor: "#1969FF", height: 5 }}
          handleStyle={{
            borderColor: "#1969FF",
            height: 18,
            width: 18,
            marginLeft: 0,
            marginTop: -7,
            backgroundColor: "#1969FF",
          }}
          railStyle={{ backgroundColor: "#0A162E", height: 5 }}
        />
        <Spacer size="xs" />
        <Row style={{ justifyContent: "space-between" }}>
          <div>0</div>
          <div>{parseInt(balance.toString())}</div>
        </Row>
      </div>
      <Heading3 style={{ color: color.greys.grey() }}>
        Select a validator node
      </Heading3>
      <Spacer />
      <ModalContent style={{ padding: "20px 0 0 0" }}>
        <Row style={{ margin: "0 1.5rem" }}>
          <Typo2
            style={{
              textAlign: "left",
              width: "10rem",
              color: color.greys.grey(),
            }}
          >
            Name
          </Typo2>
          <Typo2 style={{ width: "5rem", color: color.greys.grey() }}>ID</Typo2>
          <Typo2 style={{ width: "10rem", color: color.greys.grey() }}>
            Total delegated
          </Typo2>
          <Typo2 style={{ width: "10rem", color: color.greys.grey() }}>
            Free space
          </Typo2>
          <Typo2 style={{ width: "5rem", color: color.greys.grey() }}>
            Uptime
          </Typo2>
        </Row>
        <Spacer size="sm" />

        <Scrollbar style={{ width: "100%", height: "40vh" }}>
          {delegations.map((delegation, index) => {
            const isLastRow = delegations.length === index + 1;
            const isActive = delegation.id === selectedDelegation;
            const isValid =
              hexToUnit(delegation.delegatedLimit) >= parseInt(delegateAmount);
            return (
              <StyledDelegationSelectRow
                key={`delegation-select-row-${delegation.id}-${index}`}
                style={{
                  borderBottom: !isLastRow && "2px solid #202F49",
                  margin: "0 1rem",
                  backgroundColor:
                    isActive && isValid && color.primary.semiWhite(0.3),
                  borderRadius: "8px",
                  cursor: isValid ? "pointer" : "default",
                  opacity: !isValid && "0.4",
                }}
                onClick={() => isValid && setSelectedDelegation(delegation.id)}
                disabled={!isValid}
              >
                <DelegationSelectRow delegation={delegation} />
              </StyledDelegationSelectRow>
            );
          })}
        </Scrollbar>
        <Spacer size="sm" />
      </ModalContent>
      <Spacer />
      <Button
        padding="17px"
        width="100%"
        disabled={
          !delegateAmount ||
          delegateAmount === "0" ||
          !selectedDelegation ||
          isPending === SFC_TX_METHODS.DELEGATE
        }
        variant="primary"
        onClick={handleDelegate}
      >
        {isPending === SFC_TX_METHODS.DELEGATE ? "Delegating..." : "Delegate"}
      </Button>
    </Modal>
  );
};

const StyledDelegationSelectRow = styled.div<{ disabled: boolean }>`
  :hover {
    background-color: ${(props) =>
      !props.disabled && props.theme.color.primary.semiWhite(0.1)};
  }
`;

const Delegate: React.FC<any> = ({ loading, accountBalance, delegations }) => {
  const [onPresentDelegateModal] = useModal(
    <DelegateModal
      delegationsData={delegations?.data}
      accountBalanceData={accountBalance?.data}
    />,
    "delegate-modal"
  );
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
          <Button variant="primary" onClick={() => onPresentDelegateModal()}>
            Stake now
          </Button>
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
      await txSFCContractMethod(SFC_TX_METHODS.CLAIM_REWARDS, [
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
        <DelegationNameInfo
          delegationInfo={activeDelegation.delegationInfo}
          imageSize="32px"
        />
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

const MintSFTMRow: React.FC<any> = ({ activeDelegation }) => {
  const { color } = useContext(ThemeContext);
  const { txStakeTokenizerContractMethod } = useFantomContract();
  const [isMinting, setIsMinting] = useState(false);
  const [minted, setMinted] = useState(false);
  const lockedFTM = activeDelegation.delegation.isDelegationLocked
    ? hexToUnit(activeDelegation.delegation.amount)
    : 0;
  const formattedLockedFTM = toFormattedBalance(lockedFTM);
  const mintableSFTM = activeDelegation.delegation.isDelegationLocked
    ? weiToUnit(
        formatHexToBN(activeDelegation.delegation.amount).sub(
          formatHexToBN(activeDelegation.delegation.outstandingSFTM)
        )
      )
    : 0;
  const formattedMintableSFTM = toFormattedBalance(mintableSFTM);

  const handleMintSFTM = async () => {
    setIsMinting(true);
    try {
      await txStakeTokenizerContractMethod(
        STAKE_TOKENIZER_TX_METHODS.mintSFTM,
        [activeDelegation.delegation.toStakerId]
      );
      setIsMinting(false);
      setMinted(true);
    } catch (error) {
      setIsMinting(false);
      console.error(error);
    }
  };

  return (
    <Row style={{ textAlign: "left", height: "3rem", padding: ".5rem 0" }}>
      <Row style={{ width: "18rem", alignItems: "center" }}>
        <DelegationNameInfo
          delegationInfo={activeDelegation.delegationInfo}
          imageSize="32px"
        />
      </Row>
      <Row style={{ width: "12rem", alignItems: "center" }}>
        <Typo1 style={{ fontWeight: "bold" }}>
          {`${formattedLockedFTM[0]}${formattedLockedFTM[1]}`} FTM
        </Typo1>
      </Row>
      <Row style={{ width: "10rem", alignItems: "center" }}>
        <Typo1 style={{ fontWeight: "bold" }}>
          {minted
            ? "0.00"
            : `${formattedMintableSFTM[0]}${formattedMintableSFTM[1]}`}{" "}
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
          disabled={minted || isMinting || mintableSFTM < 0.01}
          onClick={() => handleMintSFTM()}
        >
          <Typo1
            style={{
              fontWeight: "bold",
              color:
                minted || mintableSFTM < 0.01
                  ? color.primary.cyan(0.5)
                  : color.primary.cyan(),
            }}
          >
            {minted ? "Minted" : isMinting ? "Minting..." : "Mint sFTM"}
          </Typo1>
        </OverlayButton>
      </Row>
    </Row>
  );
};

const MintSFTMModal: React.FC<any> = ({
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
        delegationInfo: delegations.find((delegation: any) => {
          return delegation.id === accountDelegation.delegation.toStakerId;
        }),
      }));

  return (
    <Modal onDismiss={onDismiss}>
      <ModalTitle text="Mint sFTM" />
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
            Locked FTM
          </Typo3>
          <Typo3 style={{ width: "10rem", color: color.greys.grey() }}>
            Mintable sFTM
          </Typo3>
          <div style={{ width: "5rem" }} />
        </Row>
        <Spacer size="sm" />
        {activeDelegations.map((activeDelegation, index) => {
          const isLastRow = activeDelegation.length === index + 1;
          return (
            <div
              key={`mint-sftm-row-${activeDelegation.delegation.toStakerId}`}
              style={{
                borderBottom: !isLastRow && "2px solid #202F49",
              }}
            >
              <MintSFTMRow activeDelegation={activeDelegation} />
            </div>
          );
        })}
        <Spacer size="sm" />
      </ModalContent>
    </Modal>
  );
};

const RepaySFTMRow: React.FC<any> = ({
  activeDelegation,
  hasAllowance,
  isApproving,
  approveSpending,
}) => {
  const { color } = useContext(ThemeContext);
  const { txStakeTokenizerContractMethod } = useFantomContract();

  const [isRepaying, setIsRepaying] = useState(false);
  const [repaid, setRepaid] = useState(false);

  const mintedSFTMinWei = formatHexToBN(
    activeDelegation.delegation.outstandingSFTM
  );
  const mintedSFTM = weiToUnit(mintedSFTMinWei);
  const formattedMintedSFTM = toFormattedBalance(mintedSFTM);

  const handleRepaySFTM = async () => {
    setIsRepaying(true);
    // allowance && approve ?
    try {
      await txStakeTokenizerContractMethod(
        STAKE_TOKENIZER_TX_METHODS.redeemSFTM,
        [activeDelegation.delegation.toStakerId, mintedSFTMinWei]
      );
      setIsRepaying(false);
      setRepaid(true);
    } catch (error) {
      setIsRepaying(false);
      console.error(error);
    }
  };

  return (
    <Row style={{ textAlign: "left", height: "3rem", padding: ".5rem 0" }}>
      <Row style={{ width: "18rem", alignItems: "center" }}>
        <DelegationNameInfo
          delegationInfo={activeDelegation.delegationInfo}
          imageSize="32px"
        />
      </Row>
      <Row style={{ width: "10rem", alignItems: "center" }}>
        <Typo1 style={{ fontWeight: "bold" }}>
          {repaid
            ? "0.00"
            : `${formattedMintedSFTM[0]}${formattedMintedSFTM[1]}`}{" "}
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
        {hasAllowance ? (
          <OverlayButton
            disabled={repaid || isRepaying || mintedSFTM < 0.01}
            onClick={() => handleRepaySFTM()}
          >
            <Typo1
              style={{
                fontWeight: "bold",
                color:
                  repaid || mintedSFTM < 0.01
                    ? color.primary.cyan(0.5)
                    : color.primary.cyan(),
              }}
            >
              {repaid ? "Repaid" : isRepaying ? "Repaying..." : "Repay sFTM"}
            </Typo1>
          </OverlayButton>
        ) : (
          <OverlayButton
            disabled={isApproving}
            onClick={() => approveSpending()}
          >
            <Typo1
              style={{
                fontWeight: "bold",
                color: isApproving
                  ? color.primary.cyan(0.5)
                  : color.primary.cyan(),
              }}
            >
              {isApproving ? "Approving..." : "Approve"}
            </Typo1>
          </OverlayButton>
        )}
      </Row>
    </Row>
  );
};

const RepaySFTMModal: React.FC<any> = ({
  onDismiss,
  accountDelegationsData,
  delegationsData,
}) => {
  const { color } = useContext(ThemeContext);
  const { getAllowance, approve } = useFantomERC20();
  const [allowance, setAllowance] = useState(BigNumber.from(0));
  const [isApproving, setIsApproving] = useState(false);
  const accountDelegations = getAccountDelegations(accountDelegationsData);
  const delegations = getDelegations(delegationsData);
  const activeDelegations = !(delegations && accountDelegations)
    ? []
    : accountDelegations.map((accountDelegation: any) => ({
        ...accountDelegation,
        delegationInfo: delegations.find((delegation: any) => {
          return delegation.id === accountDelegation.delegation.toStakerId;
        }),
      }));
  const totalDelegated = getAccountDelegationSummary(accountDelegationsData);
  const mintedSFTM = weiToUnit(totalDelegated.totalMintedSFTM);

  const handleApprove = async () => {
    setIsApproving(true);
    await approve(
      addresses[parseInt(config.chainId)].tokens.SFTM,
      addresses[parseInt(config.chainId)]["stakeTokenizer"]
    );
    setIsApproving(false);
  };

  useEffect(() => {
    getAllowance(
      addresses[parseInt(config.chainId)].tokens.SFTM,
      addresses[parseInt(config.chainId)]["stakeTokenizer"]
    ).then((result) => {
      setAllowance(result);
    });
  }, [accountDelegationsData, isApproving]);

  return (
    <Modal onDismiss={onDismiss}>
      <ModalTitle text="Repay sFTM" />
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
            Minted sFTM
          </Typo3>
          <div style={{ width: "5rem" }} />
        </Row>
        <Spacer size="sm" />
        {activeDelegations.map((activeDelegation, index) => {
          const isLastRow = activeDelegation.length === index + 1;
          return (
            <div
              key={`mint-sftm-row-${activeDelegation.delegation.toStakerId}`}
              style={{
                borderBottom: !isLastRow && "2px solid #202F49",
              }}
            >
              <RepaySFTMRow
                activeDelegation={activeDelegation}
                approveSpending={handleApprove}
                isApproving={isApproving}
                hasAllowance={allowance.gt(
                  BigNumber.from(unitToWei(mintedSFTM.toString()))
                )}
              />
            </div>
          );
        })}
        <Spacer size="sm" />
      </ModalContent>
    </Modal>
  );
};

const LiquidStaking: React.FC<any> = ({
  loading,
  accountDelegations,
  delegations,
}) => {
  const [onPresentMintSFTMModal] = useModal(
    <MintSFTMModal
      accountDelegationsData={accountDelegations?.data}
      delegationsData={delegations?.data}
    />,
    "mint-sFTM-modal"
  );
  const [onPresentRepaySFTMModal] = useModal(
    <RepaySFTMModal
      accountDelegationsData={accountDelegations?.data}
      delegationsData={delegations?.data}
    />,
    "mint-sFTM-modal"
  );
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
          <Button onClick={() => onPresentMintSFTMModal()} variant="primary">
            Mint sFTM
          </Button>
          <Spacer size="sm" />
          <Button
            onClick={() => onPresentRepaySFTMModal()}
            style={{ backgroundColor: "#202F49" }}
            variant="primary"
          >
            Repay sFTM
          </Button>
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
  useEffect(() => {
    return () => setActiveStakerId(null);
  }, []);
  const selectedDelegation = activeDelegations.find(
    (activeDelegation: any) =>
      activeDelegation.delegation.toStakerId === stakerId
  );
  const delegatedAmount = hexToUnit(
    selectedDelegation.delegation.amountDelegated
  );
  const rewardsClaimed = hexToUnit(selectedDelegation.delegation.claimedReward);
  const pendingRewards = hexToUnit(
    selectedDelegation.delegation.pendingRewards.amount
  );
  const daysLocked = daysLockedLeft(selectedDelegation.delegation);
  const delegationDate = new Date(
    formatHexToInt(selectedDelegation.delegation.createdTime) * 1000
  );
  const unlockDate = new Date(
    formatHexToInt(selectedDelegation.delegation.lockedUntil) * 1000
  );
  const formattedDelegatedAmount = toFormattedBalance(delegatedAmount);
  const formattedPendingRewards = toFormattedBalance(pendingRewards);
  const formattedRewardsClaimed = toFormattedBalance(rewardsClaimed);

  const uptime = nodeUptime(selectedDelegation.delegationInfo);
  const selfStaked = hexToUnit(selectedDelegation.delegationInfo.stake);
  const totalStaked = hexToUnit(selectedDelegation.delegationInfo.totalStake);
  const delegations = formatHexToInt(
    selectedDelegation.delegationInfo.delegations.totalCount
  );
  const freeSpace = hexToUnit(selectedDelegation.delegationInfo.delegatedLimit);
  const freeSpacePercentage =
    100 -
    freeSpace /
      hexToUnit(selectedDelegation.delegationInfo.totalDelegatedLimit);
  const formattedSelfStaked = toFormattedBalance(selfStaked);
  const formattedTotalStaked = toFormattedBalance(totalStaked);
  const formattedFreeSpace = toFormattedBalance(freeSpace);

  return (
    <Modal onDismiss={onDismiss}>
      <ModalTitle text="Delegation details" />
      <ContentBox
        style={{
          width: "92%",
          border: "1px solid #707B8F",
          borderRadius: "8px",
        }}
      >
        <Column>
          <Row
            style={{ alignItems: "center", justifyContent: "space-between" }}
          >
            <StatPair
              title="Delegation amount"
              value1={formattedDelegatedAmount[0]}
              value2={formattedDelegatedAmount[1]}
              suffix="FTM"
            />
            <Spacer size="xxl" />
            <StatPair
              title="Pending rewards"
              value1={formattedPendingRewards[0]}
              value2={formattedPendingRewards[1]}
              suffix="FTM"
            />
            <Spacer size="xxl" />
            <StatPair
              title="Rewards claimed"
              value1={formattedRewardsClaimed[0]}
              value2={formattedRewardsClaimed[1]}
              suffix="FTM"
              width="12rem"
            />
          </Row>
          <Spacer />
          <Row
            style={{ alignItems: "center", justifyContent: "space-between" }}
          >
            <StatPair
              title="Unlocks in"
              value1={daysLocked > 0 ? `${daysLocked} days` : "-"}
              value2={daysLocked > 0 && `(${formatDate(unlockDate)})`}
            />
            <Spacer size="xxl" />
            <StatPair
              title="Delegation date"
              value2={formatDate(delegationDate)}
              width="12rem"
            />
          </Row>
        </Column>
      </ContentBox>
      <Spacer />
      <ContentBox
        style={{
          width: "92%",
          border: "1px solid #707B8F",
          borderRadius: "8px",
          backgroundColor: "#09172E",
        }}
      >
        <Column style={{ width: "100%" }}>
          <DelegationNameInfo
            delegationInfo={selectedDelegation.delegationInfo}
          />
          <Spacer />
          <Row
            style={{
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <StatPair
              title="Node ID"
              value1={parseInt(selectedDelegation.delegation.toStakerId)}
              width="12rem"
            />
            <StatPair title="Uptime" value1={`${uptime}%`} width="12rem" />
            <StatPair title="Delegators" value1={delegations} width="12rem" />
          </Row>
          <Spacer />
          <Row
            style={{ alignItems: "center", justifyContent: "space-between" }}
          >
            <StatPair
              title="Total staked"
              value1={formattedTotalStaked[0]}
              width="12rem"
            />
            <StatPair
              title="Self staked"
              value1={formattedSelfStaked[0]}
              width="12rem"
            />
            <StatPair
              title="Free space"
              value1={formattedFreeSpace[0]}
              value2={`(${freeSpacePercentage.toFixed(0)}%)`}
              width="12rem"
            />
          </Row>
        </Column>
      </ContentBox>
      <Spacer size="xl" />
      <Row style={{ width: "100%" }}>
        <Button style={{ flex: 1, backgroundColor: "red" }} variant="primary">
          Undelegate
        </Button>
        <Spacer />
        <Button style={{ flex: 1 }} variant="primary">
          Claim rewards
        </Button>
      </Row>
      <Spacer />
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
  const delegations = getDelegations(delegationsData);
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
      {activeDelegations.map((delegation: ActiveDelegation) => {
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
      })}
    </div>
  );
};
const StyledActiveDelegationRow = styled.div`
  padding: 1rem 2rem;
  margin: 0 -2rem;
  cursor: pointer;
  :hover {
    background-color: ${(props) => props.theme.color.primary.semiWhite(0.1)};
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
  const delegateIsDoneLoading =
    activeAddress && accountBalance?.data && delegations?.data;
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
            delegations={delegations}
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
            loading={!activeDelegationsIsDoneLoading}
            accountDelegations={accountDelegations}
            delegations={delegations}
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
