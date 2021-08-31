import React, { useContext, useEffect, useState } from "react";
import { ThemeContext } from "styled-components";
import useFantomContract, {
  SFC_TX_METHODS,
} from "../../../hooks/useFantomContract";
import useTransaction from "../../../hooks/useTransaction";
import {
  calculateDelegationApr,
  getValidators,
  maxLockDays,
  maxLockSeconds,
} from "../../../utils/delegation";
import {
  formatHexToInt,
  hexToUnit,
  toFormattedBalance,
  unitToWei,
} from "../../../utils/conversion";
import {
  Button,
  ContentBox,
  Heading1,
  Heading2,
  Heading3,
  OverlayButton,
  Typo2,
  Typo3,
} from "../../../components";
import Spacer from "../../../components/Spacer";
import Column from "../../../components/Column";
import Row from "../../../components/Row";
import checkmarkShapeImg from "../../../assets/img/shapes/chechmarkShape.png";
import SliderWithMarks from "../../../components/Slider";
import StatPair from "../../../components/StatPair";
import { BigNumber } from "@ethersproject/bignumber";

const LockupStep: React.FC<any> = ({
  delegationsData,
  completedDelegation,
  accountDelegation,
  setActiveStep,
  setCompletedLockup,
}) => {
  const { color } = useContext(ThemeContext);
  const { txSFCContractMethod } = useFantomContract();
  const { transaction } = useTransaction();
  const [txHash, setTxHash] = useState(null);
  const [useLockup, setUseLockup] = useState(null);
  const [lockupDays, setLockupDays] = useState(14);
  const [apr, setApr] = useState(calculateDelegationApr() * 100);

  const delegation = getValidators(delegationsData).find(
    (delegation) => delegation.id === completedDelegation.selectedDelegation.id
  );
  const maxLockup = maxLockDays(delegation);
  const [lockupApr, setLockUpApr] = useState(
    calculateDelegationApr(maxLockup) * 100
  );

  const formattedDelegatedAmount = toFormattedBalance(
    accountDelegation
      ? hexToUnit(accountDelegation.delegation.amountDelegated) +
          parseInt(completedDelegation.delegatedAmount)
      : completedDelegation.delegatedAmount
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
        parseInt(completedDelegation.selectedDelegation.id),
        lockupDays * 24 * 60 * 60 > maxLockSeconds(delegation)
          ? maxLockSeconds(delegation)
          : lockupDays * 24 * 60 * 60,
        accountDelegation
          ? BigNumber.from(accountDelegation.delegation.amountDelegated)
              .add(
                BigNumber.from(unitToWei(completedDelegation.delegatedAmount))
              )
              .toString()
          : unitToWei(completedDelegation.delegatedAmount),
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
          apr: useLockup ? lockupApr : apr,
        });
        setActiveStep("Confirmation");
      }, 250);
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
            setApr(calculateDelegationApr() * 100);
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
              <Heading1>~{calculateDelegationApr() * 100}% APR</Heading1>
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
                  <Heading1 style={{ minWidth: "12rem" }}>
                    ~{lockupApr.toFixed(2)}% APR
                  </Heading1>
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
                      disabled={
                        !useLockup || isLockupPending || isLockupCompleted
                      }
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
                title="Total delegated"
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
          <Button
            disabled={isLockupCompleted || isLockupPending}
            onClick={handleLockup}
            variant="primary"
          >
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

export default LockupStep;
