import React, { useContext, useEffect, useState } from "react";
import styled, { ThemeContext } from "styled-components";
import useFantomContract, {
  SFC_TX_METHODS,
} from "../../../hooks/useFantomContract";
import { getAccountBalance } from "../../../utils/account";
import { hexToUnit, unitToWei, weiToMaxUnit } from "../../../utils/conversion";
import { BigNumber } from "@ethersproject/bignumber";
import {
  canLockDelegation,
  getAccountDelegations,
  getValidators,
  maxLockDays,
} from "../../../utils/delegation";
import useTransaction from "../../../hooks/useTransaction";
import { Button, Heading3, Typo2 } from "../../../components";
import Spacer from "../../../components/Spacer";
import InputCurrencyBox from "../../../components/InputCurrency/InputCurrencyBox";
import SliderWithMarks from "../../../components/Slider";
import ModalContent from "../../../components/ModalContent";
import Row from "../../../components/Row";
import Scrollbar from "../../../components/Scrollbar";
import DelegationSelectRow from "./DelegationSelectRow";
import useSendTransaction from "../../../hooks/useSendTransaction";

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
  const balance = parseFloat(
    weiToMaxUnit(balanceInWei.sub(BigNumber.from(unitToWei(".2"))).toString())
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

  const {
    sendTx: handleDelegate,
    isPending: isDelegatePending,
    isCompleted: isDelegateCompleted,
  } = useSendTransaction(() =>
    txSFCContractMethod(SFC_TX_METHODS.DELEGATE, [
      selectedDelegation,
      unitToWei(parseFloat(delegateAmount).toString()),
    ])
  );

  useEffect(() => {
    let timeout: any;
    if (isDelegateCompleted) {
      timeout = setTimeout(() => {
        setCompletedDelegation({
          selectedDelegation: delegations.find(
            (delegation) => delegation.id === selectedDelegation
          ),
          delegatedAmount: delegateAmount,
        });

        setActiveStep(
          selectedDelegationEligibleForLockup ? "Lockup" : "Confirmation"
        );
      }, 250);
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
              delegation.isActive &&
              parseFloat(delegateAmount) > 0 &&
              hexToUnit(delegation.delegatedLimit) >=
                parseFloat(delegateAmount);

            const isLocked =
              accountDelegation &&
              accountDelegation.delegation.lockedAmount !== "0x0";

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
                    !isValid ||
                    isLocked ||
                    isDelegatePending ||
                    isDelegateCompleted
                      ? "default"
                      : "pointer",
                  opacity:
                    (!isValid ||
                      isLocked ||
                      isDelegatePending ||
                      isDelegateCompleted) &&
                    "0.4",
                }}
                onClick={() =>
                  isValid &&
                  !isLocked &&
                  !isDelegatePending &&
                  !isDelegateCompleted &&
                  setSelectedDelegation(delegation.id)
                }
                disabled={
                  !isValid ||
                  isLocked ||
                  isDelegatePending ||
                  isDelegateCompleted
                }
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
          isDelegatePending ||
          isDelegateCompleted
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

const StyledDelegationSelectRow = styled.div<{ disabled: boolean }>`
  :hover {
    background-color: ${(props) =>
      !props.disabled && props.theme.color.primary.semiWhite(0.1)};
  }
`;

export default DelegateStep;
