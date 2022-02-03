import useModal from "./useModal";
import InfoModal from "../components/InfoModal";
import React, { useContext, useEffect } from "react";
import useWalletProvider from "./useWalletProvider";
import { Context } from "../context/ModalProvider";

const useLedgerWatcher = () => {
  const { modalKey } = useContext(Context);
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
    />,
    "ledger-error-modal"
  );

  const [
    onPresentApproveOnLedgerMessage,
    onDismissApproveOnLedgerMessage,
  ] = useModal(
    <InfoModal message="Confirm on Ledger device" withCloseButton={false} />,
    "ledger-confirm-modal",
    true
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

  useEffect(() => {
    if (walletContext.hardwareWalletState.isApproving) {
      return onPresentApproveOnLedgerMessage();
    }
    if (modalKey === "ledger-confirm-modal") {
      return onDismissApproveOnLedgerMessage();
    }
  }, [walletContext.hardwareWalletState.isApproving]);
};

export default useLedgerWatcher;
