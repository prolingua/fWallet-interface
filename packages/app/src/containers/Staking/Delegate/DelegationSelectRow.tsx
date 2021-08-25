import React from "react";
import { canLockDelegation, maxLockDays } from "../../../utils/delegation";
import {
  formatHexToInt,
  hexToUnit,
  toFormattedBalance,
} from "../../../utils/conversion";
import Row from "../../../components/Row";
import { DelegationNameInfo } from "../../../components/DelegationBalance/DelegationBalance";
import { Typo2 } from "../../../components";

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

export default DelegationSelectRow;
