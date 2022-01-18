import useModal from "./useModal";
import InfoModal from "../components/InfoModal";
import React, { useEffect } from "react";
import useWalletProvider from "./useWalletProvider";

const useLedgerWatcher = () => {
  const { walletContext, dispatchWalletContext } = useWalletProvider();
  const [onPresentLedgerErrorMessage] = useModal(
    <InfoModal
      message={
        walletContext.hardwareWalletState.isLocked
          ? "Ledger is locked. Unlock ledger first."
          : walletContext.hardwareWalletState.isWrongApp
          ? "Ledger wrong app selected. Connect ledger to FTM APP."
          : "Ledger: Unknown error"
      }
      executeOnClose={() =>
        dispatchWalletContext({ type: "setHWInitialState" })
      }
    />
  );

  useEffect(() => {
    if (
      walletContext.hardwareWalletState.isLocked ||
      walletContext.hardwareWalletState.isWrongApp
    ) {
      onPresentLedgerErrorMessage();
    }
  }, [
    walletContext.hardwareWalletState.isLocked,
    walletContext.hardwareWalletState.isWrongApp,
  ]);
};

export default useLedgerWatcher;
