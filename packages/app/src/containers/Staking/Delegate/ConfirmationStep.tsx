import React, { useContext } from "react";
import { toFormattedBalance } from "../../../utils/conversion";
import { ThemeContext } from "styled-components";
import Column from "../../../components/Column";
import Spacer from "../../../components/Spacer";
import { Button, Heading2, Typo1 } from "../../../components";
import Row from "../../../components/Row";

const ConfirmationStep: React.FC<any> = ({
  completedDelegation,
  completedLockup,
  onDismiss,
}) => {
  const formattedAmountStaked = toFormattedBalance(
    completedDelegation.delegatedAmount
  );
  const { color } = useContext(ThemeContext);
  return (
    <>
      <Column style={{ alignItems: "center", width: "60%" }}>
        <Spacer size="xl" />
        <Spacer size="xl" />
        <Heading2>Congratulations!</Heading2>
        <Spacer />
        <Typo1 style={{ color: color.greys.grey() }}>
          You staked {completedDelegation.delegatedAmount} FTM with{" "}
          {completedDelegation.selectedDelegation.stakerInfo?.name || "Unnamed"}
        </Typo1>
        <Spacer size="xl" />
        <Column style={{ alignSelf: "flex-start", width: "100%" }}>
          <Row style={{ justifyContent: "space-between" }}>
            <Typo1 style={{ color: color.greys.grey(), fontWeight: "bold" }}>
              Delegation amount
            </Typo1>
            <Typo1 style={{ fontWeight: "bold" }}>{`${
              formattedAmountStaked[0]
            }${
              formattedAmountStaked[1] === ".00" ? "" : formattedAmountStaked[1]
            } FTM`}</Typo1>
          </Row>
          <Spacer />
          <Row style={{ justifyContent: "space-between" }}>
            <Typo1 style={{ color: color.greys.grey(), fontWeight: "bold" }}>
              Lockup period
            </Typo1>
            <Typo1 style={{ fontWeight: "bold" }}>
              {completedLockup?.daysLocked
                ? `${completedLockup.daysLocked} days`
                : "-"}
            </Typo1>
          </Row>
          <Spacer />
          <Row style={{ justifyContent: "space-between" }}>
            <Typo1 style={{ color: color.greys.grey(), fontWeight: "bold" }}>
              Current estimated APR
            </Typo1>
            <Typo1 style={{ fontWeight: "bold" }}>
              {completedLockup.apr.toFixed(2)}%
            </Typo1>
          </Row>
          <Spacer />
          <Row style={{ justifyContent: "space-between" }}>
            <Typo1 style={{ color: color.greys.grey(), fontWeight: "bold" }}>
              Validator node
            </Typo1>
            <Typo1 style={{ fontWeight: "bold" }}>
              {" "}
              {completedDelegation.selectedDelegation.stakerInfo?.name ||
                "Unnamed"}
            </Typo1>
          </Row>
        </Column>
      </Column>
      <Spacer size="xl" />
      <Spacer size="xl" />
      <Spacer size="xl" />
      <Spacer size="xl" />
      <Button
        style={{ width: "100%" }}
        onClick={() => onDismiss()}
        variant="primary"
      >
        {"Done"}
      </Button>
    </>
  );
};

export default ConfirmationStep;
