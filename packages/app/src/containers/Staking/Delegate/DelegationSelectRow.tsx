import React from "react";
import {
  calculateDelegationApr,
  canLockDelegation,
  maxLockDays,
} from "../../../utils/delegation";
import {
  formatHexToInt,
  hexToUnit,
  toFormattedBalance,
} from "../../../utils/conversion";
import Row from "../../../components/Row";
import { DelegationNameInfo } from "../../../components/DelegationBalance/DelegationBalance";
import { Typo2 } from "../../../components";
import Spacer from "../../../components/Spacer";

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
  const maxApr =
    calculateDelegationApr(maxDelegationLockUp <= 0 ? 0 : maxDelegationLockUp) *
    100;
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
      <Typo2
        style={{
          width: "5rem",
          fontWeight: "bold",
          display: "flex",
          justifyContent: "end",
        }}
      >
        {parseInt(delegation.id)}
        <Spacer size="xs" />
      </Typo2>
      <Typo2
        style={{
          width: "8rem",
          fontWeight: "bold",
          display: "flex",
          justifyContent: "end",
        }}
      >
        {maxDelegationLockUp <= 0 ? "-" : `${maxDelegationLockUp} days`}
        <Spacer size="xs" />
      </Typo2>
      <Typo2
        style={{
          width: "7rem",
          fontWeight: "bold",
          display: "flex",
          justifyContent: "end",
        }}
      >
        {maxApr.toFixed(2)}%
        <Spacer size="xs" />
      </Typo2>
      <Typo2
        style={{
          width: "9rem",
          fontWeight: "bold",
          display: "flex",
          justifyContent: "end",
        }}
      >
        {noOfDelegations}
        <Spacer size="xs" />
      </Typo2>
      <Typo2
        style={{
          display: "flex",
          justifyContent: "end",
          width: "10rem",
          fontWeight: "bold",
        }}
      >
        {formattedFreeSpace[0]}
        <Spacer size="xs" />
      </Typo2>
    </Row>
  );
};

export default DelegationSelectRow;
