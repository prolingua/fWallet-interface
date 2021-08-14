import React, { useContext, useEffect, useState } from "react";
import { getAccountBalance } from "../../utils/account";
import {
  formatHexToInt,
  hexToUnit,
  toFormattedBalance,
  unitToWei,
  weiToMaxUnit,
  weiToUnit,
} from "../../utils/conversion";
import StatPair from "../../components/StatPair";
import {
  canLockDelegation,
  getAccountDelegations,
  getValidators,
  maxLockDays,
  maxLockSeconds,
} from "../../utils/delegation";
import Row from "../../components/Row";
import { DelegationNameInfo } from "../../components/DelegationBalance/DelegationBalance";
import {
  Button,
  ContentBox,
  Heading1,
  Heading2,
  Heading3,
  OverlayButton,
  Typo2,
  Typo3,
} from "../../components";
import styled, { ThemeContext } from "styled-components";
import useFantomContract, {
  SFC_TX_METHODS,
} from "../../hooks/useFantomContract";
import Modal from "../../components/Modal";
import Spacer from "../../components/Spacer";
import ModalContent from "../../components/ModalContent";
import Scrollbar from "../../components/Scrollbar";
import useModal from "../../hooks/useModal";
import Column from "../../components/Column";
import InputCurrencyBox from "../../components/InputCurrency/InputCurrencyBox";
import useTransaction from "../../hooks/useTransaction";
import SliderWithMarks from "../../components/Slider";
import { BigNumber } from "@ethersproject/bignumber";
import checkmarkShapeImg from "../../assets/img/shapes/chechmarkShape.png";

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

const DelegationSelectRow: React.FC<any> = ({
  delegation,
  accountDelegation,
}) => {
  const isEligibleForLockup = accountDelegation
    ? canLockDelegation(accountDelegation, delegation)
    : true;
  const maxDelegationLockUp = isEligibleForLockup ? maxLockDays(delegation) : 0;
  const formattedFreeSpace = toFormattedBalance(
    hexToUnit(delegation.delegatedLimit)
  );
  const noOfDelegations = formatHexToInt(delegation.delegations.totalCount);
  const maxApr = "11.32%";
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
      <Typo2 style={{ width: "8rem", fontWeight: "bold" }}>
        {maxDelegationLockUp <= 0 ? "-" : `${maxDelegationLockUp} days`}
      </Typo2>
      <Typo2 style={{ width: "8rem", fontWeight: "bold" }}>{maxApr}</Typo2>
      <Typo2 style={{ width: "8rem", fontWeight: "bold" }}>
        {noOfDelegations}
      </Typo2>
      <Typo2 style={{ width: "10rem", fontWeight: "bold" }}>
        {formattedFreeSpace[0]}
      </Typo2>
    </Row>
  );
};

const Stepper: React.FC<any> = ({ activeStep, steps }) => {
  const { color } = useContext(ThemeContext);
  return (
    <Row style={{ alignItems: "center", paddingTop: "2px" }}>
      {steps.map((step: string, index: number) => {
        return (
          <Row>
            <Row
              style={{
                alignItems: "center",
                justifyContent: "center",
                boxSizing: "border-box",
                height: "1.5rem",
                width: "1.5rem",
                fontWeight: "bold",
                color: activeStep === step ? "white" : color.greys.grey(),
                backgroundColor:
                  activeStep === step
                    ? color.primary.fantomBlue()
                    : "transparent",
                border:
                  !(activeStep === step) &&
                  `1px solid ${color.greys.darkGrey()}`,
                borderRadius: "8px",
              }}
            >
              {index + 1}
            </Row>
            <Spacer size="sm" />
            <Row
              style={{
                alignItems: "center",
                justifyContent: "center",
                fontWeight: "bold",
                color: activeStep === step ? "white" : color.greys.darkGrey(),
              }}
            >
              {step}
            </Row>
            <Spacer size="sm" />
            {index + 1 < steps.length && (
              <>
                <Row style={{ alignItems: "center" }}>
                  <div
                    style={{
                      height: "1px",
                      width: "3rem",
                      borderBottom: `1px solid ${color.greys.darkGrey()}`,
                    }}
                  />
                </Row>
                <Spacer />
              </>
            )}
          </Row>
        );
      })}
    </Row>
  );
};

const DelegateStep: React.FC<any> = ({
  delegationsData,
  accountBalanceData,
  accountDelegationsData,
  setCompletedDelegation,
  setActiveStep,
  setSteps,
}) => {
  const { color } = useContext(ThemeContext);
  const [delegateAmount, setDelegateAmount] = useState("");
  const [selectedDelegation, setSelectedDelegation] = useState(null);
  const [
    selectedDelegationEligibleForLockup,
    setSelectedDelegationEligibleForLockup,
  ] = useState(true);
  const { txSFCContractMethod } = useFantomContract();
  const balanceInWei = getAccountBalance(accountBalanceData);
  const balance = weiToMaxUnit(
    balanceInWei.sub(BigNumber.from(unitToWei("1"))).toString()
  );
  const delegations = getValidators(delegationsData);
  const accountDelegations = getAccountDelegations(accountDelegationsData);
  const handleSetDelegateAmount = (value: string) => {
    if (parseFloat(value) > balance) {
      return setDelegateAmount(balance.toString());
    }
    return setDelegateAmount(value);
  };

  const handleSliderSetDelegateAmount = (value: number) => {
    return setDelegateAmount(parseFloat(value.toFixed(2)).toString());
  };

  const [txHash, setTxHash] = useState(null);
  const { transaction } = useTransaction();
  const tx = transaction[txHash];
  const isDelegatePending = tx && tx.status === "pending";
  const isDelegateCompleted = tx && tx.status === "completed";
  const handleDelegate = async () => {
    try {
      const hash = await txSFCContractMethod(SFC_TX_METHODS.DELEGATE, [
        selectedDelegation,
        unitToWei(parseFloat(delegateAmount).toString()),
      ]);
      setTxHash(hash);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    let timeout: any;
    if (isDelegateCompleted) {
      timeout = setTimeout(() => {
        setCompletedDelegation({
          selectedDelegation: selectedDelegation,
          delegatedAmount: delegateAmount,
        });
        setActiveStep("Lockup");
      }, 500);
    }
    return () => clearTimeout(timeout);
  }, [isDelegateCompleted]);

  useEffect(() => {
    if (selectedDelegation) {
      const accountDelegation = accountDelegations.find(
        (accountDelegation: any) =>
          accountDelegation.delegation.toStakerId === selectedDelegation
      );
      const delegation = delegations.find(
        (delegation) => delegation.id === selectedDelegation
      );

      const canLock =
        canLockDelegation(accountDelegation, delegation) &&
        maxLockDays(delegation);

      setSteps(
        canLock
          ? ["Delegate", "Lockup", "Confirmation"]
          : ["Delegate", "Confirmation"]
      );
      setSelectedDelegationEligibleForLockup(!!canLock);
    }
  }, [selectedDelegation]);

  return (
    <>
      <Heading3 style={{ color: color.greys.grey() }}>
        How much would you like to delegate?
      </Heading3>
      <Spacer />
      <InputCurrencyBox
        disabled={isDelegateCompleted || isDelegatePending}
        value={delegateAmount}
        setValue={handleSetDelegateAmount}
        max={balance}
      />
      <Spacer size="sm" />
      <div style={{ width: "98%" }}>
        <SliderWithMarks
          disabled={isDelegateCompleted || isDelegatePending}
          value={parseFloat(delegateAmount)}
          setValue={handleSliderSetDelegateAmount}
          max={parseFloat(balance.toString())}
          steps={0.1}
        />
        <Spacer size="xl" />
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
          <Typo2 style={{ width: "8rem", color: color.greys.grey() }}>
            Max lock
          </Typo2>
          <Typo2 style={{ width: "8rem", color: color.greys.grey() }}>
            Max apr
          </Typo2>
          <Typo2 style={{ width: "8rem", color: color.greys.grey() }}>
            Delegations
          </Typo2>
          <Typo2 style={{ width: "10rem", color: color.greys.grey() }}>
            Free space
          </Typo2>
        </Row>
        <Spacer size="sm" />

        <Scrollbar style={{ width: "100%", height: "40vh" }}>
          {delegations.map((delegation, index) => {
            const accountDelegation = accountDelegations.find(
              (accountDelegation: any) =>
                accountDelegation.delegation.toStakerId === delegation.id
            );
            const isLastRow = delegations.length === index + 1;
            const isActive = delegation.id === selectedDelegation;
            const isValid =
              parseInt(delegateAmount) > 0 &&
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
                  cursor:
                    !isValid || isDelegatePending || isDelegateCompleted
                      ? "default"
                      : "pointer",
                  opacity:
                    (!isValid || isDelegatePending || isDelegateCompleted) &&
                    "0.4",
                }}
                onClick={() =>
                  isValid &&
                  !isDelegatePending &&
                  !isDelegateCompleted &&
                  setSelectedDelegation(delegation.id)
                }
                disabled={!isValid || isDelegatePending || isDelegateCompleted}
              >
                <DelegationSelectRow
                  delegation={delegation}
                  accountDelegation={accountDelegation}
                />
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
          isDelegatePending
        }
        variant="primary"
        onClick={handleDelegate}
      >
        {isDelegateCompleted
          ? "Success"
          : isDelegatePending
          ? "Staking..."
          : selectedDelegationEligibleForLockup
          ? "Stake and continue to lockup"
          : "Stake and continue"}
      </Button>
    </>
  );
};

const LockupStep: React.FC<any> = ({
  delegationsData,
  completedDelegation,
  setActiveStep,
  setCompletedLockup,
}) => {
  const { color } = useContext(ThemeContext);
  const { txSFCContractMethod } = useFantomContract();
  const { transaction } = useTransaction();
  const [txHash, setTxHash] = useState(null);
  const [useLockup, setUseLockup] = useState(null);
  const [lockupDays, setLockupDays] = useState(14);
  const [apr, setApr] = useState(3.41);
  const [lockupApr, setLockUpApr] = useState(9.31);

  const delegation = getValidators(delegationsData).find(
    (delegation) => delegation.id === completedDelegation.selectedDelegation
  );
  const maxLockup = maxLockDays(delegation);
  const formattedDelegatedAmount = toFormattedBalance(
    completedDelegation.delegatedAmount
  );
  const formattedYearlyReward = toFormattedBalance(
    completedDelegation.delegatedAmount * (apr / 100)
  );
  const formattedMonthlyReward = toFormattedBalance(
    (completedDelegation.delegatedAmount * (apr / 100)) / 12
  );
  const formattedWeeklyReward = toFormattedBalance(
    (completedDelegation.delegatedAmount * (apr / 100)) / 52
  );

  const tx = transaction[txHash];
  const isLockupPending = tx && tx.status === "pending";
  const isLockupCompleted = tx && tx.status === "completed";
  const handleLockup = async () => {
    try {
      const hash = await txSFCContractMethod(SFC_TX_METHODS.RELOCK_STAKE, [
        parseInt(completedDelegation.selectedDelegation),
        lockupDays * 24 * 60 * 60 > maxLockSeconds(delegation)
          ? maxLockSeconds(delegation)
          : lockupDays * 24 * 60 * 60,
        unitToWei(completedDelegation.delegatedAmount),
      ]);
      setTxHash(hash);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    let timeout: any;
    if (isLockupCompleted) {
      timeout = setTimeout(() => {
        setCompletedLockup({
          daysLocked: lockupDays,
          apr: apr,
        });
        setActiveStep("Confirmation");
      }, 500);
    }
    return () => clearTimeout(timeout);
  }, [isLockupCompleted]);

  return (
    <>
      <Heading3 style={{ color: color.greys.grey() }}>
        Would you like to lock your delegation for extra rewards?
      </Heading3>
      <Spacer />
      <Column>
        <OverlayButton
          style={{ textAlign: "unset" }}
          onClick={() => {
            setUseLockup(false);
            setApr(3.41);
          }}
        >
          <Row
            style={{
              width: "100%",
              backgroundColor: useLockup
                ? "#202F49"
                : color.primary.fantomBlue(0.2),
              borderLeft: `4px solid ${
                useLockup ? color.greys.grey() : color.primary.fantomBlue()
              }`,
            }}
          >
            <Row style={{ justifyContent: "center", alignItems: "center" }}>
              <Row
                style={{
                  justifyContent: "center",
                  alignItems: "center",
                  margin: "2rem",
                  height: "2rem",
                  width: "2rem",
                  backgroundColor: useLockup
                    ? color.primary.black()
                    : color.primary.fantomBlue(),
                  borderRadius: "50%",
                }}
              >
                {!useLockup && <img src={checkmarkShapeImg} />}
              </Row>
            </Row>
            <Column style={{ justifyContent: "center", margin: "2rem 0" }}>
              <Heading2>Stake-as-you-go</Heading2>
              <Spacer size="xs" />
              <Typo2 style={{ color: color.greys.grey() }}>
                No time lock. You can undelegate at any time with no penalty.
              </Typo2>
            </Column>
            <Spacer size="xl" />
            <Row
              style={{
                marginLeft: "auto",
                justifyContent: "flex-end",
                alignItems: "center",
              }}
            >
              <Heading1>~3.41% APR</Heading1>
              <Spacer size="xl" />
            </Row>
          </Row>
        </OverlayButton>
        <Spacer />
        <OverlayButton
          style={{ textAlign: "unset" }}
          onClick={() => {
            setUseLockup(true);
            setApr(lockupApr);
          }}
          disabled={maxLockup <= 14}
        >
          <Row
            style={{
              backgroundColor: !useLockup
                ? "#202F49"
                : color.primary.fantomBlue(0.2),
              borderLeft: `4px solid ${
                !useLockup ? color.greys.grey() : color.primary.fantomBlue()
              }`,
              opacity: maxLockup <= 14 && 0.2,
            }}
          >
            <Row
              style={{
                justifyContent: "center",
                alignItems: "center",
                margin: "2rem",
                height: "2rem",
                width: "2rem",
                backgroundColor: !useLockup
                  ? color.primary.black()
                  : color.primary.fantomBlue(),
                borderRadius: "50%",
              }}
            >
              {useLockup && <img src={checkmarkShapeImg} />}
            </Row>
            <Column>
              <Row>
                <Column
                  style={{
                    justifyContent: "center",
                    width: "30rem",
                    margin: "2rem 0",
                  }}
                >
                  <Heading2>Fluid rewards</Heading2>
                  <Spacer size="xs" />
                  <Typo2 style={{ color: color.greys.grey() }}>
                    You can lock your delegation for a period of time and earn
                    more rewards. You can undelegate prematurely, but you get to
                    keep only half of the base rewards.
                  </Typo2>
                </Column>
                <Spacer size="xl" />
                <Row
                  style={{
                    marginLeft: "auto",
                    justifyContent: "flex-end",
                    alignItems: "center",
                  }}
                >
                  <Heading1>~{lockupApr}% APR</Heading1>
                  <Spacer size="xl" />
                </Row>
              </Row>
              {maxLockup > 14 && (
                <>
                  <Typo2 style={{ fontWeight: "bold" }}>
                    Choose lock up period:
                  </Typo2>

                  <Spacer size="xxl" />
                  <div style={{ marginLeft: "1rem", width: "92%" }}>
                    <SliderWithMarks
                      disabled={!useLockup}
                      value={lockupDays}
                      setValue={(value: number) => setLockupDays(value)}
                      min={14}
                      max={maxLockup}
                      markPoints={[14, maxLockup]}
                      markPointsAbsolute
                      markLabels={["2 weeks", `${maxLockup} days`]}
                      tooltip={useLockup}
                      tooltipPlacement="top"
                      tooltipSuffix="days"
                    />
                  </div>
                  <Spacer size="xxl" />
                </>
              )}
            </Column>
          </Row>
        </OverlayButton>
        <Spacer size="xxl" />
        <ContentBox style={{ backgroundColor: color.primary.black() }}>
          <Column style={{ width: "100%" }}>
            <Row style={{ justifyContent: "space-between" }}>
              <StatPair
                title="Delegation amount"
                value1={formattedDelegatedAmount[0]}
                value2={formattedDelegatedAmount[1]}
                suffix="FTM"
              />
              <StatPair
                title="Est. weekly rewards"
                value1={formattedWeeklyReward[0]}
                value2={formattedWeeklyReward[1]}
                suffix="FTM"
                valueFlex="flex-end"
              />
              <StatPair
                title="Est. monthly rewards"
                value1={formattedMonthlyReward[0]}
                value2={formattedMonthlyReward[1]}
                suffix="FTM"
                valueFlex="flex-end"
              />
              <StatPair
                title="Est. yearly rewards"
                value1={formattedYearlyReward[0]}
                value2={formattedYearlyReward[1]}
                suffix="FTM"
                valueFlex="flex-end"
              />
            </Row>
            <Spacer />
            <Row style={{ justifyContent: "flex-end" }}>
              <Typo3
                style={{
                  fontSize: "12px",
                  color: color.greys.grey(),
                  marginBottom: "-1rem",
                }}
              >
                *This is an estimation. Rewards vary depending on the total
                staked amount.
              </Typo3>
            </Row>
          </Column>
        </ContentBox>
        <Spacer size="xxl" />
        {useLockup ? (
          <Button onClick={handleLockup} variant="primary">
            {isLockupCompleted
              ? "Lockup success"
              : isLockupPending
              ? "Locking..."
              : "Lockup and continue"}
          </Button>
        ) : (
          <Button
            onClick={() => setActiveStep("Confirmation")}
            variant="primary"
          >
            {"Continue to confirmation"}
          </Button>
        )}
      </Column>
    </>
  );
};

const DelegateModal: React.FC<any> = ({
  onDismiss,
  delegationsData,
  accountBalanceData,
  accountDelegationsData,
}) => {
  const [activeStep, setActiveStep] = useState("Delegate");
  const [completedDelegation, setCompletedDelegation] = useState(null);
  const [completedLockup, setCompletedLockup] = useState(null);
  const [steps, setSteps] = useState(["Delegate", "Lockup", "Confirmation"]);

  return (
    <Modal style={{ minWidth: "50rem" }} onDismiss={onDismiss}>
      <Stepper activeStep={activeStep} steps={steps} />
      <Spacer size="xl" />
      {activeStep === "Delegate" && (
        <DelegateStep
          delegationsData={delegationsData}
          accountDelegationsData={accountDelegationsData}
          accountBalanceData={accountBalanceData}
          setActiveStep={setActiveStep}
          setCompletedDelegation={setCompletedDelegation}
          setSteps={setSteps}
        />
      )}
      {activeStep === "Lockup" && (
        <LockupStep
          delegationsData={delegationsData}
          completedDelegation={completedDelegation}
          setActiveStep={setActiveStep}
          setCompletedLockup={setCompletedLockup}
        />
      )}
    </Modal>
  );
};

const StyledDelegationSelectRow = styled.div<{ disabled: boolean }>`
  :hover {
    background-color: ${(props) =>
      !props.disabled && props.theme.color.primary.semiWhite(0.1)};
  }
`;

const Delegate: React.FC<any> = ({
  loading,
  accountBalance,
  delegations,
  accountDelegations,
}) => {
  const [onPresentDelegateModal] = useModal(
    <DelegateModal
      delegationsData={delegations?.data}
      accountDelegationsData={accountDelegations?.data}
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

export default Delegate;
