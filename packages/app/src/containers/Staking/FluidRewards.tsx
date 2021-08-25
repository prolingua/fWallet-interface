import React, { useContext, useEffect, useState } from "react";
// @ts-ignore
import { addresses } from "@f-wallet/contracts";
import { ThemeContext } from "styled-components";
import {
  canLockDelegation,
  getAccountDelegations,
  getAccountDelegationSummary,
  getValidators,
  getValidatorsWithLockup,
  maxLockDays,
  maxLockSeconds,
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
  OverlayButton,
  Typo1,
  Typo2,
  Typo3,
} from "../../components";
import Modal from "../../components/Modal";
import ModalTitle from "../../components/ModalTitle";
import ModalContent from "../../components/ModalContent";
import Spacer from "../../components/Spacer";
import useFantomERC20 from "../../hooks/useFantomERC20";
import { BigNumber } from "@ethersproject/bignumber";
import config from "../../config/config.test";
import useModal from "../../hooks/useModal";
import Column from "../../components/Column";
import ModalClose from "../../components/ModalClose";
import SliderWithMarks from "../../components/Slider";

const LockupSelect: React.FC<any> = ({ validator, accountDelegation }) => {
  const { color } = useContext(ThemeContext);
  const { txSFCContractMethod } = useFantomContract();
  const { transaction } = useTransaction();
  const [txHash, setTxHash] = useState(null);
  const [lockupDays, setLockupDays] = useState(14);
  const [lockupApr, setLockUpApr] = useState(9.31);
  const maxLockup = maxLockDays(validator);

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
        unitToWei(accountDelegation.delegation.delegatedAmount),
      ]);
      setTxHash(hash);
    } catch (err) {
      console.error(err);
    }
  };

  return (
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
          <Heading1>~{lockupApr}% APR</Heading1>
          <Spacer size="xl" />
        </Row>
      </Row>
      {maxLockup > 14 && (
        <>
          <Typo2 style={{ fontWeight: "bold" }}>Choose lock up period:</Typo2>

          <Spacer size="xxl" />
          <div style={{ marginLeft: "1rem", width: "92%" }}>
            <SliderWithMarks
              disabled={isLockupPending || isLockupCompleted}
              value={lockupDays}
              setValue={(value: number) => setLockupDays(value)}
              min={14}
              max={maxLockup}
              markPoints={[14, maxLockup]}
              markPointsAbsolute
              markLabels={["2 weeks", `${maxLockup} days`]}
              tooltip
              tooltipPlacement="top"
              tooltipSuffix="days"
            />
          </div>
          <Spacer size="xxl" />
        </>
      )}
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
  const maxApr = "11.12";

  // const { txSFCContractMethod } = useFantomContract();
  // const { transaction } = useTransaction();
  // const [txHash, setTxHash] = useState(null);
  // const tx = transaction[txHash];
  // const isLockupPending = tx && tx.status === "pending";
  // const isLockupCompleted = tx && tx.status === "completed";
  // const handleLockup = async () => {
  //   try {
  //     const hash = await txSFCContractMethod(SFC_TX_METHODS.RELOCK_STAKE, [
  //       parseInt(completedDelegation.selectedDelegation.id),
  //       lockupDays * 24 * 60 * 60 > maxLockSeconds(delegation)
  //         ? maxLockSeconds(delegation)
  //         : lockupDays * 24 * 60 * 60,
  //       unitToWei(completedDelegation.delegatedAmount),
  //     ]);
  //     setTxHash(hash);
  //   } catch (err) {
  //     console.error(err);
  //   }
  // };

  return (
    <Row style={{ textAlign: "left", height: "3rem", padding: ".5rem 0" }}>
      <Row style={{ width: "18rem", alignItems: "center" }}>
        <DelegationNameInfo
          delegationInfo={validator.delegationInfo}
          imageSize="32px"
        />
      </Row>
      <Row style={{ width: "15rem", alignItems: "center" }}>
        <Typo1 style={{ fontWeight: "bold" }}>{availableFTMToLockup} FTM</Typo1>
      </Row>
      <Row style={{ width: "12rem", alignItems: "center" }}>
        <Typo1 style={{ fontWeight: "bold" }}>{maxLockup} days</Typo1>
      </Row>
      <Row style={{ width: "12rem", alignItems: "center" }}>
        <Typo1 style={{ fontWeight: "bold" }}>{maxApr}%</Typo1>
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

const LockupFTMModal: React.FC<any> = ({
  onDismiss,
  accountDelegations,
  validatorsWithLockup,
}) => {
  const { color } = useContext(ThemeContext);
  const [step, setStep] = useState("Select");
  const [selectedValidator, setSelectedValidator] = useState(null);
  console.log(step);
  return (
    <Modal padding={step === "Lockup" && "0"} onDismiss={onDismiss}>
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
                  width: "18rem",
                  color: color.greys.grey(),
                }}
              >
                Validator
              </Typo3>
              <Typo3 style={{ width: "15rem", color: color.greys.grey() }}>
                Available FTM to lockup
              </Typo3>
              <Typo3 style={{ width: "12rem", color: color.greys.grey() }}>
                Max lockup
              </Typo3>
              <Typo3 style={{ width: "12rem", color: color.greys.grey() }}>
                Max apr
              </Typo3>
              <div style={{ width: "8rem" }} />
            </Row>
            <Spacer size="sm" />
            {validatorsWithLockup.map((validator: any, index: number) => {
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
                        accountDelegation.delegation.toStakerId === validator.id
                    )}
                    setStep={setStep}
                    setSelectedValidator={setSelectedValidator}
                  />
                </div>
              );
            })}
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
            BACK
          </OverlayButton>
          <Row style={{ alignItems: "center", justifyContent: "center" }}>
            <Column>
              <Typo1>Choose a lockup period</Typo1>
              <Typo2>Description goes here</Typo2>
            </Column>
          </Row>
          <Spacer />
          <LockupSelect
            validator={selectedValidator}
            accountDelegation={accountDelegations.find(
              (accountDelegation: any) =>
                accountDelegation.delegation.toStakerId === selectedValidator.id
            )}
          />
        </Column>
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
          <Button onClick={() => onPresentLockupFTMModal()} variant="primary">
            Lockup FTM
          </Button>
        </Column>
      </Column>
    </ContentBox>
  );
};

export default FluidRewards;
