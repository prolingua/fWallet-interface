import React, { useContext, useEffect, useState } from "react";
import { getAccountBalance } from "../../utils/account";
import {
  hexToUnit,
  toFormattedBalance,
  unitToWei,
  weiToMaxUnit,
  weiToUnit,
} from "../../utils/conversion";
import StatPair from "../../components/StatPair";
import { getDelegations, nodeUptime } from "../../utils/delegations";
import Row from "../../components/Row";
import { DelegationNameInfo } from "../../components/DelegationBalance/DelegationBalance";
import {
  Button,
  ContentBox,
  Heading1,
  Heading3,
  Typo2,
} from "../../components";
import styled, { ThemeContext } from "styled-components";
import useFantomContract, {
  SFC_TX_METHODS,
} from "../../hooks/useFantomContract";
import Modal from "../../components/Modal";
import ModalTitle from "../../components/ModalTitle";
import Spacer from "../../components/Spacer";
import Slider from "rc-slider";
import ModalContent from "../../components/ModalContent";
import Scrollbar from "../../components/Scrollbar";
import useModal from "../../hooks/useModal";
import Column from "../../components/Column";
import InputCurrencyBox from "../../components/InputCurrency/InputCurrencyBox";
import useTransaction from "../../hooks/useTransaction";
import SliderWithMarks from "../../components/Slider";

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
  const { txSFCContractMethod } = useFantomContract();
  const balanceInWei = getAccountBalance(accountBalanceData);
  const balance = weiToMaxUnit(balanceInWei.toString());
  const delegations = getDelegations(delegationsData);

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
        onDismiss();
      }, 2000);
    }
    return () => clearTimeout(timeout);
  }, [isDelegateCompleted]);

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
        <SliderWithMarks
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
          isDelegatePending
        }
        variant="primary"
        onClick={handleDelegate}
      >
        {isDelegateCompleted
          ? "Success"
          : isDelegatePending
          ? "Delegating..."
          : "Delegate"}
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

export default Delegate;
