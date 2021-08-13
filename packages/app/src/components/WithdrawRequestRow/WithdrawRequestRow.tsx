import React, { useEffect, useState } from "react";
import useFantomContract, {
  SFC_TX_METHODS,
} from "../../hooks/useFantomContract";
import useTransaction from "../../hooks/useTransaction";
import useFantomApiData from "../../hooks/useFantomApiData";
import useWalletProvider from "../../hooks/useWalletProvider";
import {
  withdrawDaysLockedLeft,
  withdrawLockTimeLeft,
} from "../../utils/delegation";
import {
  formatHexToInt,
  hexToUnit,
  toFormattedBalance,
} from "../../utils/conversion";
import { BigNumber } from "@ethersproject/bignumber";
import { FantomApiMethods } from "../../hooks/useFantomApi";
import Row from "../Row";
import StatPair from "../StatPair";
import { Button, Typo1 } from "../index";

const WithdrawRequestRow: React.FC<any> = ({ withdrawRequest, size }) => {
  const { txSFCContractMethod } = useFantomContract();
  const { transaction } = useTransaction();
  const { apiData } = useFantomApiData();
  const { walletContext } = useWalletProvider();

  const [txHash, setTxHash] = useState(null);
  const claimRewardTx = transaction[txHash];
  const isPending = claimRewardTx && claimRewardTx.status === "pending";
  const isCompleted = claimRewardTx && claimRewardTx.status === "completed";

  const unlocksIn = withdrawLockTimeLeft(
    formatHexToInt(withdrawRequest.createdTime)
  );
  const isUnlocked =
    withdrawDaysLockedLeft(formatHexToInt(withdrawRequest.createdTime)) <= 0;
  const formattedAmountToWithdraw = toFormattedBalance(
    hexToUnit(withdrawRequest.amount)
  );

  const handleWithdrawStake = async (wr: any) => {
    try {
      const hash = await txSFCContractMethod(SFC_TX_METHODS.WITHDRAW, [
        formatHexToInt(wr.toStakerId),
        BigNumber.from(wr.withdrawRequestID).toString(),
      ]);
      setTxHash(hash);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    if (isCompleted) {
      apiData[FantomApiMethods.getDelegationsForAccount]
        .get(walletContext.activeWallet.address.toLowerCase())
        .refetch();
    }
  }, [isCompleted]);

  return (
    <Row
      key={withdrawRequest.withdrawRequestID}
      style={{
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div style={{ flex: 1 }}>
        <StatPair
          value1={formattedAmountToWithdraw[0]}
          value2={formattedAmountToWithdraw[1]}
          suffix="FTM"
          value1FontSize={size === "sm" && "18px"}
          value2FontSize={size === "sm" && "14px"}
        />
      </div>
      {isUnlocked ? (
        <Button
          disabled={!isUnlocked || isPending || isCompleted}
          style={{
            flex: 1,
            padding: size === "sm" ? ".1rem 1rem" : ".4rem 1.5rem",
            fontSize: size === "sm" && "16px",
          }}
          variant="secondary"
          onClick={() => handleWithdrawStake(withdrawRequest)}
        >
          {isPending ? "Withdrawing..." : isCompleted ? "Succes" : "Withdraw"}
        </Button>
      ) : (
        <Typo1
          style={{
            fontSize: size === "sm" ? "18px" : "24px",
            fontWeight: "bold",
          }}
        >
          {unlocksIn[0] > 0 ? `${unlocksIn[0]} days, ` : ""}
          {unlocksIn[1] > 0
            ? `${unlocksIn[1]} hours, `
            : unlocksIn[0] > 0
            ? "0 hours, "
            : ""}
          {unlocksIn[2] > 0 ? `${unlocksIn[2]} minutes` : "0 minutes"}
        </Typo1>
      )}
    </Row>
  );
};

export default WithdrawRequestRow;
