import React, { useContext, useState } from "react";
import { ThemeContext } from "styled-components";
import useFantomContract, {
  SFC_TX_METHODS,
} from "../../hooks/useFantomContract";
import useTransaction from "../../hooks/useTransaction";
import {
  getAccountDelegations,
  withdrawDaysLockedLeft,
} from "../../utils/delegations";
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

const WithdrawRequestsContent: React.FC<any> = ({ accountDelegationsData }) => {
  const { color } = useContext(ThemeContext);
  const { txSFCContractMethod } = useFantomContract();
  const { transaction } = useTransaction();
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

  const unlocksIn = (wr: any) => {
    return withdrawDaysLockedLeft(formatHexToInt(wr.createdTime));
  };

  const [txHash, setTxHash] = useState(null);
  const claimRewardTx = transaction[txHash];
  const isPending = claimRewardTx && claimRewardTx.status === "pending";
  const isCompleted = claimRewardTx && claimRewardTx.status === "completed";

  const handleWithdrawStake = async (wr: any) => {
    console.log(wr);
    console.log(
      formatHexToInt(wr.toStakerId),
      BigNumber.from(wr.withdrawRequestID).toString()
    );
    try {
      const hash = await txSFCContractMethod(SFC_TX_METHODS.WITHDRAW, [
        formatHexToInt(wr.toStakerId),
        BigNumber.from(wr.withdrawRequestID).toString(),
      ]);
      setTxHash({ ...txHash, claimRewardTx: hash });
    } catch (error) {
      console.error(error);
    }
  };

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
          Unlocks in
        </Typo2>
        <Typo2
          style={{ flex: 2, fontWeight: "bold", color: color.greys.grey() }}
        >
          Amount
        </Typo2>
        <div style={{ flex: 1 }} />
      </Row>
      <Spacer size="xl" />
      {withdrawRequests.length ? (
        withdrawRequests.map((wr) => {
          return (
            <Row
              key={wr.withdrawRequestID}
              style={{
                justifyContent: "center",
                alignItems: "center",
                paddingBottom: "1rem",
              }}
            >
              <Column style={{ width: "10rem" }}>
                <Typo2 style={{ fontWeight: "bold" }}>
                  {unlocksIn(wr) > 0 ? `${unlocksIn(wr)} days` : `Unlocked`}
                </Typo2>
                <Typo3>
                  (
                  {formatDate(
                    new Date(
                      (formatHexToInt(wr.createdTime) + 7 * 24 * 60 * 60) * 1000
                    )
                  )}
                  )
                </Typo3>
              </Column>
              <Typo2 style={{ flex: 2, fontWeight: "bold" }}>
                {hexToUnit(wr.amount)} FTM
              </Typo2>
              <Button
                disabled={unlocksIn(wr) > 0 || isPending || isCompleted}
                style={{ flex: 1, padding: ".4rem 1.5rem" }}
                variant="secondary"
                onClick={() => handleWithdrawStake(wr)}
              >
                {isPending
                  ? "Withdrawing..."
                  : isCompleted
                  ? "Succes"
                  : "Withdraw"}
              </Button>
            </Row>
          );
        })
      ) : (
        <Heading3>No pending withdraw requests</Heading3>
      )}
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
