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
import { mediaExact, OverlayButton, Typo2 } from "../../../components";
import Spacer from "../../../components/Spacer";
import { Item } from "../../../components/Grid/Grid";
import styled from "styled-components";

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
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      {" "}
      <Item collapseLTE="sm">
        <ResponsiveTableRowItem
          width={10}
          style={{
            textAlign: "left",
          }}
        >
          <DelegationNameInfo
            imageSize={32}
            delegationInfo={delegation.stakerInfo}
          />
        </ResponsiveTableRowItem>
      </Item>
      <ResponsiveTableRowItem
        width={3}
        style={{
          fontWeight: "bold",
          display: "flex",
          justifyContent: "end",
        }}
      >
        <Typo2>{parseInt(delegation.id)}</Typo2>
        <Spacer size="xs" />
      </ResponsiveTableRowItem>
      <ResponsiveTableRowItem
        width={8}
        style={{
          fontWeight: "bold",
          display: "flex",
          justifyContent: "end",
        }}
      >
        <Typo2>
          {maxDelegationLockUp <= 0 ? "-" : `${maxDelegationLockUp} days`}
        </Typo2>
        <Spacer size="xs" />
      </ResponsiveTableRowItem>
      <ResponsiveTableRowItem
        width={8}
        style={{
          fontWeight: "bold",
          display: "flex",
          justifyContent: "end",
        }}
      >
        <Typo2>{maxApr.toFixed(2)}%</Typo2>
        <Spacer size="xs" />
      </ResponsiveTableRowItem>
      <Item collapseLTE="sm">
        <ResponsiveTableRowItem
          width={8}
          style={{
            fontWeight: "bold",
            display: "flex",
            justifyContent: "end",
          }}
        >
          <Typo2>{noOfDelegations}</Typo2>
          <Spacer size="xs" />
        </ResponsiveTableRowItem>
      </Item>
      <ResponsiveTableRowItem
        width={10}
        style={{
          display: "flex",
          justifyContent: "end",
          fontWeight: "bold",
        }}
      >
        <Typo2>{formattedFreeSpace[0]}</Typo2>
        <Spacer size="xs" />
      </ResponsiveTableRowItem>
    </Row>
  );
};

const ResponsiveTableRowItem = styled.div<{ width: number }>`
  ${(props) => mediaExact.xs(`width: ${props.width * 0.8}rem`)};
  ${(props) => mediaExact.sm(`width: ${props.width * 0.8}rem`)};
  ${(props) => mediaExact.md(`width: ${props.width}rem`)};
  ${(props) => mediaExact.lg(`width: ${props.width}rem`)};
`;

export default DelegationSelectRow;
