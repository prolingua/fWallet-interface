import React, { useContext, useEffect, useState } from "react";
import styled, { ThemeContext } from "styled-components";
import useFantomContract, {
  SFC_TX_METHODS,
} from "../../../hooks/useFantomContract";
import { getAccountBalance } from "../../../utils/account";
import {
  hexToUnit,
  toFormattedBalance,
  unitToWei,
  weiToMaxUnit,
} from "../../../utils/conversion";
import { BigNumber } from "@ethersproject/bignumber";
import {
  canLockDelegation,
  getAccountDelegations,
  getValidators,
  maxLockDays,
} from "../../../utils/delegation";
import useTransaction from "../../../hooks/useTransaction";
import { Button, Heading3, OverlayButton, Typo2 } from "../../../components";
import Spacer from "../../../components/Spacer";
import InputCurrencyBox from "../../../components/InputCurrency/InputCurrencyBox";
import SliderWithMarks from "../../../components/Slider";
import ModalContent from "../../../components/ModalContent";
import Row from "../../../components/Row";
import Scrollbar from "../../../components/Scrollbar";
import DelegationSelectRow from "./DelegationSelectRow";
import useSendTransaction from "../../../hooks/useSendTransaction";
import walletSymbol from "../../../assets/img/symbols/wallet.svg";
import FormattedValue from "../../../components/FormattedBalance";
import { compare } from "../../../utils/common";

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
  const [sort, setSort] = useState<[any, number]>([null, 1]); // 1 = asc, -1 = desc
  const delegations = getValidators(delegationsData);
  const [sortedDelegations, setSortedDelegations] = useState(delegations);
  const [
    selectedDelegationEligibleForLockup,
    setSelectedDelegationEligibleForLockup,
  ] = useState(true);
  const { txSFCContractMethod } = useFantomContract();
  const balanceInWei = getAccountBalance(accountBalanceData);
  const balance = parseFloat(
    weiToMaxUnit(balanceInWei.sub(BigNumber.from(unitToWei(".2"))).toString())
  );
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
  const handleSetMax = () => {
    handleSetDelegateAmount(balance.toString());
  };
  const handleSetSort = (sortBy: string) => {
    const defaultAsc = ["name"];
    const isCurrentSortBy = sortBy === sort[0];
    const sortDirection = isCurrentSortBy
      ? sort[1] === 1
        ? -1
        : 1
      : defaultAsc.includes(sortBy)
      ? 1
      : -1;

    setSort([sortBy, sortDirection]);
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

      const eligibleForLocking =
        canLockDelegation(accountDelegation, delegation) &&
        maxLockDays(delegation);

      setSteps(
        eligibleForLocking
          ? ["Delegate", "Lockup", "Confirmation"]
          : ["Delegate", "Confirmation"]
      );
      setSelectedDelegationEligibleForLockup(!!eligibleForLocking);
    }
  }, [selectedDelegation]);

  useEffect(() => {
    // const sortOnMap = {
    //   name: ["stakerInfo", "name"],
    // } as any;
    // console.log(sortOnMap[sort[0]]);
    // console.log(delegations[0].stakerInfo);
    const toSort = [...delegations];
    let sorted = toSort;

    if (sort[0] === "id") {
      sorted = toSort.sort((a: any, b: any) => {
        if (sort[1] === 1) {
          return compare(parseInt(a.id), parseInt(b.id));
        }
        return compare(parseInt(b.id), parseInt(a.id));
      });
    }

    if (sort[0] === "name") {
      sorted = toSort.sort((a: any, b: any) => {
        const canonicalizeForSorting = (string: string) => {
          if (!string) {
            return "~";
          }
          if (string[0] === "'") {
            return string.substr(1, string.length - 2);
          }

          return string;
        };
        const compareA = canonicalizeForSorting(a.stakerInfo?.name);
        const compareB = canonicalizeForSorting(b.stakerInfo?.name);

        if (sort[1] === 1) {
          return compare(compareA, compareB);
        }
        return compare(compareB, compareA);
      });
    }

    if (sort[0] === "lock" || sort[0] === "apr") {
      sorted = toSort.sort((a: any, b: any) => {
        const compareA = maxLockDays(a);
        const compareB = maxLockDays(b);

        if (sort[1] === 1) {
          return compare(compareA, compareB);
        }
        return compare(compareB, compareA);
      });
    }

    if (sort[0] === "delegations") {
      sorted = toSort.sort((a: any, b: any) => {
        const compareA = parseInt(a.delegations.totalCount);
        const compareB = parseInt(b.delegations.totalCount);

        if (sort[1] === 1) {
          return compare(compareA, compareB);
        }
        return compare(compareB, compareA);
      });
    }

    if (sort[0] === "free") {
      sorted = toSort.sort((a: any, b: any) => {
        const compareA = parseInt(a.delegatedLimit);
        const compareB = parseInt(b.delegatedLimit);

        if (sort[1] === 1) {
          return compare(compareA, compareB);
        }
        return compare(compareB, compareA);
      });
    }

    setSortedDelegations(sorted);
  }, [sort]);

  return (
    <>
      <Heading3 style={{ color: color.greys.grey() }}>
        How much would you like to delegate?
      </Heading3>
      <Spacer />
      <OverlayButton style={{ width: "100%" }} onClick={handleSetMax}>
        <Row style={{ width: "100%", justifyContent: "end" }}>
          <img alt="" src={walletSymbol} />
          <Spacer size="xs" />
          <FormattedValue
            formattedValue={toFormattedBalance(balance)}
            tokenSymbol={"FTM"}
            color={color.greys.grey()}
            fontSize="16px"
          />
          <Spacer size="xs" />
        </Row>
      </OverlayButton>
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
          <OverlayButton
            style={{
              width: "10rem",
              display: "flex",
              justifyContent: "center",
              gap: ".5rem",
            }}
            onClick={() => handleSetSort("name")}
          >
            <Typo2
              style={{
                textAlign: "left",
                fontWeight: sort[0] === "name" ? "bold" : "normal",
                color: color.greys.grey(),
              }}
            >
              Name
            </Typo2>
            <Typo2
              style={{ fontWeight: sort[0] === "name" ? "bold" : "normal" }}
            >
              {sort[0] === "name" ? (sort[1] === 1 ? "A" : "D") : "AD"}
            </Typo2>
          </OverlayButton>
          <OverlayButton
            style={{
              width: "5rem",
              display: "flex",
              justifyContent: "center",
              gap: ".5rem",
            }}
            onClick={() => handleSetSort("id")}
          >
            <Typo2
              style={{
                fontWeight: sort[0] === "id" ? "bold" : "normal",
                color: color.greys.grey(),
              }}
            >
              ID
            </Typo2>
            <Typo2 style={{ fontWeight: sort[0] === "id" ? "bold" : "normal" }}>
              {sort[0] === "id" ? (sort[1] === 1 ? "A" : "D") : "AD"}
            </Typo2>
          </OverlayButton>
          <OverlayButton
            style={{
              width: "8rem",
              display: "flex",
              justifyContent: "center",
              gap: ".5rem",
            }}
            onClick={() => handleSetSort("lock")}
          >
            <Typo2
              style={{
                fontWeight: sort[0] === "lock" ? "bold" : "normal",
                color: color.greys.grey(),
              }}
            >
              Max lock
            </Typo2>
            <Typo2
              style={{ fontWeight: sort[0] === "lock" ? "bold" : "normal" }}
            >
              {sort[0] === "lock" ? (sort[1] === 1 ? "A" : "D") : "AD"}
            </Typo2>
          </OverlayButton>
          <OverlayButton
            style={{
              fontWeight: sort[0] === "apr" ? "bold" : "normal",
              width: "8rem",
              display: "flex",
              justifyContent: "center",
              gap: ".5rem",
            }}
            onClick={() => handleSetSort("apr")}
          >
            <Typo2 style={{ color: color.greys.grey() }}>Max apr</Typo2>
            <Typo2
              style={{ fontWeight: sort[0] === "apr" ? "bold" : "normal" }}
            >
              {sort[0] === "apr" ? (sort[1] === 1 ? "A" : "D") : "AD"}
            </Typo2>
          </OverlayButton>
          <OverlayButton
            style={{
              fontWeight: sort[0] === "delegations" ? "bold" : "normal",
              width: "8rem",
              display: "flex",
              justifyContent: "center",
              gap: ".5rem",
            }}
            onClick={() => handleSetSort("delegations")}
          >
            <Typo2 style={{ color: color.greys.grey() }}>Delegations</Typo2>
            <Typo2
              style={{
                fontWeight: sort[0] === "delegations" ? "bold" : "normal",
              }}
            >
              {sort[0] === "delegations" ? (sort[1] === 1 ? "A" : "D") : "AD"}
            </Typo2>
          </OverlayButton>
          <OverlayButton
            style={{
              fontWeight: sort[0] === "free" ? "bold" : "normal",
              width: "10rem",
              display: "flex",
              justifyContent: "center",
              gap: ".5rem",
            }}
            onClick={() => handleSetSort("free")}
          >
            <Typo2 style={{ color: color.greys.grey() }}>Free space</Typo2>
            <Typo2
              style={{ fontWeight: sort[0] === "free" ? "bold" : "normal" }}
            >
              {sort[0] === "free" ? (sort[1] === 1 ? "A" : "D") : "AD"}
            </Typo2>
          </OverlayButton>
        </Row>
        <Spacer size="sm" />

        <Scrollbar style={{ width: "100%", height: "40vh" }}>
          {sortedDelegations.map((delegation, index) => {
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
