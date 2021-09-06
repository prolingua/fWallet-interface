import React, { useContext, useEffect, useState } from "react";
// @ts-ignore
import { addresses } from "@f-wallet/contracts";
import { ThemeContext } from "styled-components";
import {
  calculateDelegationApr,
  canLockDelegation,
  getAccountDelegations,
  getAccountDelegationSummary,
  getValidators,
  getValidatorsWithLockup,
  maxLockDays,
  maxLockSeconds,
  Validator,
} from "../../utils/delegation";
import {
  formatHexToBN,
  hexToUnit,
  toFormattedBalance,
  unitToWei,
  weiToUnit,
} from "../../utils/conversion";
import useFantomContract, {
  SFC_TX_METHODS,
  STAKE_TOKENIZER_TX_METHODS,
} from "../../hooks/useFantomContract";
import StatPair from "../../components/StatPair";
import useTransaction from "../../hooks/useTransaction";
import Row from "../../components/Row";
import { DelegationNameInfo } from "../../components/DelegationBalance/DelegationBalance";
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
import Modal from "../../components/Modal";
import ModalTitle from "../../components/ModalTitle";
import ModalContent from "../../components/ModalContent";
import Spacer from "../../components/Spacer";
import useModal from "../../hooks/useModal";
import Column from "../../components/Column";
import SliderWithMarks from "../../components/Slider";
import vShapeImg from "../../assets/img/shapes/vShapeBack.svg";
import ConfirmationStep from "./Delegate/ConfirmationStep";

const LockupSelect: React.FC<any> = ({
  validator,
  accountDelegation,
  setCompletedDelegation,
  setCompletedLockup,
  setStep,
}) => {
  const { color } = useContext(ThemeContext);
  const { txSFCContractMethod } = useFantomContract();
  const { transaction } = useTransaction();
  const [txHash, setTxHash] = useState(null);
  const [lockupDays, setLockupDays] = useState(14);
  const [lockupApr, setLockUpApr] = useState(
    calculateDelegationApr(lockupDays) * 100
  );
  const maxLockup = maxLockDays(validator);

  const delegatedAmount = hexToUnit(
    accountDelegation.delegation.amountDelegated
  );
  const formattedDelegatedAmount = toFormattedBalance(delegatedAmount);
  const formattedYearlyReward = toFormattedBalance(
    delegatedAmount * (lockupApr / 100)
  );
  const formattedMonthlyReward = toFormattedBalance(
    (delegatedAmount * (lockupApr / 100)) / 12
  );
  const formattedWeeklyReward = toFormattedBalance(
    (delegatedAmount * (lockupApr / 100)) / 52
  );

  const tx = transaction[txHash];
  const isLockupPending = tx && tx.status === "pending";
  const isLockupCompleted = tx && tx.status === "completed";
  const handleLockup = async () => {
    try {
      const hash = await txSFCContractMethod(SFC_TX_METHODS.RELOCK_STAKE, [
        parseInt(validator.id),
        lockupDays * 24 * 60 * 60 > maxLockSeconds(validator)
          ? maxLockSeconds(validator)
          : lockupDays * 24 * 60 * 60,
        formatHexToBN(accountDelegation.delegation.amountDelegated).toString(),
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
        setCompletedDelegation({
          delegatedAmount: delegatedAmount,
          selectedDelegation: validator,
        });
        setCompletedLockup({
          daysLocked: lockupDays,
          apr: lockupApr,
        });
        setStep("Confirmation");
      }, 250);
    }
    return () => clearTimeout(timeout);
  }, [isLockupCompleted]);

  return (
    <Column>
      <Row>
        <Column
          style={{
            justifyContent: "center",
            width: "40rem",
            margin: "2rem 0",
          }}
        >
          <Heading2>Fluid rewards</Heading2>
          <Spacer size="xs" />
          <Typo2 style={{ color: color.greys.grey() }}>
            You can lock your delegation for a period of time and earn more
            rewards. You can undelegate prematurely, but you get to keep only
            half of the base rewards.
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
          <Heading3>~{lockupApr.toFixed(2)}% APR</Heading3>
          <Spacer size="sm" />
        </Row>
      </Row>
      {maxLockup > 14 && (
        <>
          <Typo2 style={{ fontWeight: "bold" }}>Choose lock up period:</Typo2>

          <Spacer size="xl" />
          <div style={{ marginLeft: "1rem", width: "92%" }}>
            <SliderWithMarks
              disabled={isLockupPending || isLockupCompleted}
              value={lockupDays}
              setValue={(value: number) => {
                setLockupDays(value);
                setLockUpApr(calculateDelegationApr(value) * 100);
              }}
              min={14}
              max={maxLockup}
              markPoints={[14, maxLockup]}
              markPointsAbsolute
              markLabels={["14 days", `${maxLockup} days`]}
              tooltip
              tooltipPlacement="top"
              tooltipSuffix="days"
            />
          </div>
          <Spacer size="xl" />
        </>
      )}
      <Spacer size="xl" />
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
              *This is an estimation. Rewards vary depending on the total staked
              amount.
            </Typo3>
          </Row>
        </Column>
      </ContentBox>
      <Spacer size="xl" />
      <Button
        disabled={isLockupCompleted || isLockupPending}
        onClick={handleLockup}
        variant="primary"
      >
        {isLockupCompleted
          ? "Lockup success"
          : isLockupPending
          ? "Locking..."
          : "Lockup now"}
      </Button>
    </Column>
  );
};

const LockupFTMRow: React.FC<any> = ({
  validator,
  accountDelegation,
  setStep,
  setSelectedValidator,
}) => {
  const { color } = useContext(ThemeContext);
  const availableFTMToLockup = hexToUnit(
    accountDelegation.delegation.amountDelegated
  );
  const maxLockup = maxLockDays(validator);
  const maxApr = calculateDelegationApr(maxLockup <= 0 ? 0 : maxLockup) * 100;

  return (
    <Row style={{ textAlign: "left", height: "3rem", padding: ".5rem 0" }}>
      <Row style={{ width: "16rem", alignItems: "center" }}>
        <DelegationNameInfo
          delegationInfo={validator.delegationInfo}
          imageSize="32px"
        />
      </Row>
      <Row style={{ width: "12rem", alignItems: "center" }}>
        <Typo1 style={{ fontWeight: "bold" }}>{availableFTMToLockup} FTM</Typo1>
      </Row>
      <Row style={{ width: "8rem", alignItems: "center" }}>
        <Typo1 style={{ fontWeight: "bold" }}>{maxLockup} days</Typo1>
      </Row>
      <Row style={{ width: "8rem", alignItems: "center" }}>
        <Typo1 style={{ fontWeight: "bold" }}>{maxApr.toFixed(2)}%</Typo1>
      </Row>

      <Row
        style={{
          marginLeft: "auto",
          alignItems: "center",
          justifyContent: "flex-end",
        }}
      >
        <OverlayButton
          onClick={() => {
            setSelectedValidator(validator);
            setStep("Lockup");
          }}
        >
          <Typo1
            style={{
              fontWeight: "bold",
              color: color.primary.cyan(),
            }}
          >
            Lockup now
          </Typo1>
        </OverlayButton>
      </Row>
    </Row>
  );
};

export const LockupFTMModal: React.FC<any> = ({
  onDismiss,
  accountDelegations,
  validatorsWithLockup,
}) => {
  const { color } = useContext(ThemeContext);
  const [step, setStep] = useState("Select");
  const [selectedValidator, setSelectedValidator] = useState(null);
  const [completedDelegation, setCompletedDelegation] = useState(null);
  const [completedLockup, setCompletedLockup] = useState(null);

  const validatorsEligibleToLock = validatorsWithLockup.filter(
    (validator: Validator) => {
      const stakedDelegation = accountDelegations.find(
        (accountDelegation: any) =>
          accountDelegation.delegation.toStakerId === validator.id
      );

      return (
        canLockDelegation(stakedDelegation, validator) &&
        stakedDelegation.delegation.amountDelegated !== "0x0"
      );
    }
  );

  return (
    <Modal style={{ width: "52rem" }} onDismiss={onDismiss}>
      {step === "Select" && (
        <>
          <ModalTitle text="Fluid rewards" />
          <Row style={{ marginTop: "-1rem", justifyContent: "center" }}>
            <Typo2
              style={{
                textAlign: "center",
                color: color.greys.grey(),
                maxWidth: "80%",
              }}
            >
              You can lock your delegation for a period of time and earn more
              rewards. You can undelegate prematurely, but you get to keep only
              half of the base rewards.
            </Typo2>
          </Row>
          <Spacer size="xl" />
          <ModalContent>
            <Row style={{ textAlign: "left" }}>
              <Typo3
                style={{
                  width: "16rem",
                  color: color.greys.grey(),
                }}
              >
                Validator
              </Typo3>
              <Typo3 style={{ width: "12rem", color: color.greys.grey() }}>
                Available FTM to lockup
              </Typo3>
              <Typo3 style={{ width: "8rem", color: color.greys.grey() }}>
                Max lockup
              </Typo3>
              <Typo3 style={{ width: "8rem", color: color.greys.grey() }}>
                Max apr
              </Typo3>
              <div style={{ width: "8rem" }} />
            </Row>
            <Spacer size="sm" />
            {accountDelegations?.length && validatorsEligibleToLock?.length ? (
              validatorsEligibleToLock.map((validator: any, index: number) => {
                const isLastRow = validatorsWithLockup.length === index + 1;
                return (
                  <div
                    key={`lockup-ftm-row-${validator.id}`}
                    style={{
                      borderBottom: !isLastRow && "2px solid #202F49",
                    }}
                  >
                    <LockupFTMRow
                      validator={validator}
                      accountDelegation={accountDelegations.find(
                        (accountDelegation: any) =>
                          accountDelegation.delegation.toStakerId ===
                          validator.id
                      )}
                      setStep={setStep}
                      setSelectedValidator={setSelectedValidator}
                    />
                  </div>
                );
              })
            ) : (
              <Heading2 style={{ padding: "3rem 0" }}>
                No active delegations eligible for lockup
              </Heading2>
            )}

            <Spacer size="sm" />
          </ModalContent>
        </>
      )}
      {step === "Lockup" && (
        <Column style={{ position: "relative", width: "100%" }}>
          <OverlayButton
            style={{ position: "absolute", top: ".3rem" }}
            onClick={() => setStep("Select")}
          >
            <img style={{ height: "18px" }} src={vShapeImg} />
          </OverlayButton>
          <Row style={{ alignItems: "center", justifyContent: "center" }}>
            <Column style={{ alignItems: "center" }}>
              <Typo1 style={{ fontWeight: "bold", color: color.greys.grey() }}>
                Choose a lockup period
              </Typo1>
              <Spacer size="xs" />
              <Typo3 style={{ color: color.greys.grey() }}>
                Description goes here
              </Typo3>
            </Column>
          </Row>
          <Spacer />
          <LockupSelect
            validator={selectedValidator}
            accountDelegation={accountDelegations.find(
              (accountDelegation: any) =>
                accountDelegation.delegation.toStakerId === selectedValidator.id
            )}
            setCompletedDelegation={setCompletedDelegation}
            setCompletedLockup={setCompletedLockup}
            setStep={setStep}
          />
        </Column>
      )}
      {step === "Confirmation" && (
        <ConfirmationStep
          completedDelegation={completedDelegation}
          completedLockup={completedLockup}
          onDismiss={onDismiss}
        />
      )}
    </Modal>
  );
};

const FluidRewardsContent: React.FC<any> = ({ availableToLockup }) => {
  const formattedAvailableToLockup = toFormattedBalance(availableToLockup);

  return (
    <StatPair
      title="Available to lockup"
      value1={formattedAvailableToLockup[0]}
      value2={formattedAvailableToLockup[1]}
      suffix="FTM"
      spacer="xs"
      titleColor="#19E1FF"
    />
  );
};

const FluidRewards: React.FC<any> = ({
  loading,
  accountDelegations,
  delegations,
}) => {
  const validatorsWithLockup =
    delegations && getValidatorsWithLockup(delegations);
  const availableToLockup =
    accountDelegations &&
    validatorsWithLockup &&
    validatorsWithLockup.reduce((accumulator, current) => {
      const stakedDelegation = getAccountDelegations(accountDelegations).find(
        (accountDelegation: any) =>
          accountDelegation.delegation.toStakerId === current.id
      );
      if (stakedDelegation && canLockDelegation(stakedDelegation, current)) {
        return (
          accumulator + hexToUnit(stakedDelegation.delegation.amountDelegated)
        );
      }
      return accumulator;
    }, 0);

  const [onPresentLockupFTMModal] = useModal(
    <LockupFTMModal
      validatorsWithLockup={validatorsWithLockup}
      accountDelegations={
        accountDelegations && getAccountDelegations(accountDelegations)
      }
    />,
    "lockup-ftm-modal"
  );
  return (
    <ContentBox style={{ flex: 1 }}>
      <Column>
        <Heading1>Fluid Rewards</Heading1>
        <Spacer />
        <Typo2 style={{ color: "#B7BECB" }}>
          Lockup your staked FTM to earn more rewards.
        </Typo2>
        <Spacer />
        <Column style={{ marginTop: "auto", width: "100%" }}>
          {loading ? (
            <div>Loading...</div>
          ) : (
            <FluidRewardsContent availableToLockup={availableToLockup} />
          )}
          <Spacer size="sm" />
          <Button
            disabled={availableToLockup <= 0}
            onClick={() => onPresentLockupFTMModal()}
            variant="primary"
          >
            Lockup FTM
          </Button>
        </Column>
      </Column>
    </ContentBox>
  );
};

export default FluidRewards;
