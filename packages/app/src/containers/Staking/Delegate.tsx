import React, { useState } from "react";
import { getAccountBalance } from "../../utils/account";
import { toFormattedBalance, weiToUnit } from "../../utils/conversion";
import StatPair from "../../components/StatPair";
import { Button, ContentBox, Heading1, Typo2 } from "../../components";
import Modal from "../../components/Modal";
import Spacer from "../../components/Spacer";
import useModal from "../../hooks/useModal";
import Column from "../../components/Column";
import Stepper from "../../components/Stepper";
import DelegateStep from "./Delegate/DelegateStep";
import LockupStep from "./Delegate/LockupStep";
import ConfirmationStep from "./Delegate/ConfirmationStep";
import { getAccountDelegations } from "../../utils/delegation";

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
          accountDelegation={
            accountDelegationsData &&
            completedDelegation &&
            getAccountDelegations(accountDelegationsData).find(
              (accountDelegation: any) =>
                accountDelegation.delegation.toStakerId ===
                completedDelegation.selectedDelegation.id
            )
          }
          completedDelegation={completedDelegation}
          setActiveStep={setActiveStep}
          setCompletedLockup={setCompletedLockup}
        />
      )}
      {activeStep === "Confirmation" && (
        <ConfirmationStep
          completedDelegation={completedDelegation}
          completedLockup={completedLockup}
          onDismiss={onDismiss}
        />
      )}
    </Modal>
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
