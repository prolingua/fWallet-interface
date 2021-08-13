import React, { useContext, useState } from "react";
import { ThemeContext } from "styled-components";
import useFantomContract, {
  SFC_TX_METHODS,
} from "../../hooks/useFantomContract";
import useTransaction from "../../hooks/useTransaction";
import {
  getAccountDelegations,
  withdrawDaysLockedLeft,
} from "../../utils/delegation";
import { formatHexToInt, hexToUnit } from "../../utils/conversion";
import { BigNumber } from "@ethersproject/bignumber";
import Row from "../../components/Row";
import {
  Button,
  ContentBox,
  Heading1,
  Heading3,
  Typo2,
  Typo3,
} from "../../components";
import Spacer from "../../components/Spacer";
import Column from "../../components/Column";
import { formatDate } from "../../utils/common";
import WithdrawRequestRow from "../../components/WithdrawRequestRow";

const WithdrawRequestsContent: React.FC<any> = ({ accountDelegationsData }) => {
  const { color } = useContext(ThemeContext);
  const accountDelegations = getAccountDelegations(accountDelegationsData);
  // TODO fix typecasting of AccountDelegation
  const withdrawRequests = accountDelegations.reduce((accumulator, current) => {
    if ((current as any).delegation.withdrawRequests?.length) {
      (current as any).delegation.withdrawRequests.forEach((wr: any) => {
        accumulator.push({
          toStakerId: (current as any).delegation.toStakerId,
          ...wr,
        });
      });
    }
    return accumulator;
  }, []);

  return (
    <div>
      {" "}
      <Row style={{ justifyContent: "space-between" }}>
        <Typo2
          style={{
            width: "10rem",
            fontWeight: "bold",
            color: color.greys.grey(),
          }}
        >
          Amount
        </Typo2>
        <Typo2
          style={{
            flex: 2,
            fontWeight: "bold",
            color: color.greys.grey(),
            textAlign: "end",
          }}
        >
          Unlocking in
        </Typo2>
      </Row>
      <Spacer size="lg" />
      <Column style={{ gap: ".5rem" }}>
        {withdrawRequests.length ? (
          withdrawRequests
            .filter((wr: any) => wr.withdrawTime === null)
            .sort((a, b) => a.createdTime - b.createdTime)
            .map((wr) => {
              return <WithdrawRequestRow withdrawRequest={wr} size="sm" />;
            })
        ) : (
          <Heading3>No pending withdraw requests</Heading3>
        )}
      </Column>
    </div>
  );
};

const WithdrawRequests: React.FC<any> = ({
  loading,
  accountDelegations,
  delegations,
}) => {
  return (
    <ContentBox>
      <Column style={{ width: "100%" }}>
        <Heading1>Withdraw Requests</Heading1>
        <Spacer />
        {loading ? (
          <div>Loading...</div>
        ) : (
          <WithdrawRequestsContent
            accountDelegationsData={accountDelegations.data}
            delegationsData={delegations.data}
          />
        )}
        <Spacer />
      </Column>
    </ContentBox>
  );
};

export default WithdrawRequests;
