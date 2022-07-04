import { useState } from "react";
import useTransaction from "./useTransaction";

const useSendBatchTransactions = (transactions: any[][]) => {
  const [txHashes, setTxHashes] = useState({} as any);
  const { transaction } = useTransaction();
  const txs =
    transaction &&
    [...Object.values(txHashes)].map((tx: any) => transaction[tx]);

  const pendingTxs = txs.filter((tx) => tx.status === "pending");
  const successfulTxs = txs.filter((tx) => tx.status === "completed");
  const failedTxs = txs.filter((tx) => tx.status === "failed");

  const reset = () => {
    setTxHashes({});
  };

  const sendBatch = async () => {
    const hashes = {} as any;
    try {
      transactions.map(async (transaction) => {
        hashes[transaction[0]] = await transaction[1]();
      });
      setTxHashes(hashes);
    } catch (error) {
      console.error(error);
    }
  };

  return {
    sendBatch,
    hashes: txHashes,
    txs,
    pendingTxs,
    successfulTxs,
    failedTxs,
    reset,
  };
};

export default useSendBatchTransactions;
