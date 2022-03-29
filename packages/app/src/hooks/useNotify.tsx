import React, { useCallback, useContext, useEffect } from "react";
import { Context } from "../context/NotifyProvider";
import useTransaction from "./useTransaction";
import Column from "../components/Column";
import { LinkExt, Typo1, Typo2 } from "../components";
import Modal from "../components/Modal";
import { formatAddress } from "../utils/wallet";
import config from "../config/config";
import useWalletProvider from "./useWalletProvider";
import { bridgeNetworks, supportedChainsForBridge } from "../utils/bridge";

const NotifyModal: React.FC<any> = ({ onDismiss, hash }) => {
  const { transaction } = useTransaction();
  const { walletContext } = useWalletProvider();
  const transactionStatus = transaction[hash]?.status;

  useEffect(() => {
    if (transaction[hash] && transactionStatus !== "pending") {
      setTimeout(() => onDismiss(), 1000);
    }
  }, [transactionStatus]);

  const getExplorerTxUrl = () => {
    const chainId = walletContext.activeWallet.chainId;

    if (supportedChainsForBridge.includes(parseInt(chainId))) {
      return `${bridgeNetworks[chainId].explorerUrl}${bridgeNetworks[chainId].explorerTransactionPath}`;
    }

    return `${config.explorerUrl}${config.explorerTransactionPath}`;
  };

  return (
    <Modal style={{ minWidth: "10rem" }}>
      {hash && transactionStatus && (
        <Column>
          <Typo1>Transaction submitted</Typo1>
          <LinkExt
            href={`${getExplorerTxUrl()}/${transaction.hash}`}
            onClick={(e) => e.stopPropagation()}
          >
            {formatAddress(hash)}
          </LinkExt>
          <Typo2>
            {transactionStatus}
            {transactionStatus === "pending" ? "..." : "!"}
          </Typo2>
        </Column>
      )}
    </Modal>
  );
};

const useNotify = () => {
  const { onDismiss, onPresent } = useContext(Context);
  const { transaction } = useTransaction();

  useEffect(() => {
    if (transaction.currentTransactions.length) {
      onPresent(
        <NotifyModal
          hash={
            transaction.currentTransactions[
              transaction.currentTransactions.length - 1
            ]
          }
          onDismiss={onDismiss}
        />
      );
    }
  }, [transaction]);
};

export default useNotify;
