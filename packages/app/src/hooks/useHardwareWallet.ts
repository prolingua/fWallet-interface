import config from "../config/config";
import useWalletProvider from "./useWalletProvider";
import useAccounts from "./useAccount";
import { loadContracts } from "../utils/wallet";
import { LedgerSigner } from "../utils/ledger";
import { useContext } from "react";
import { Context } from "../context/ModalProvider";

export const useHardwareWallet = () => {
  const { dispatchWalletContext, walletContext } = useWalletProvider();
  const { dispatchAccount } = useAccounts();

  const addHardwareWalletToContext = async (wallet: any) => {
    const address = await wallet.getAddress();
    const walletProvider: any = {
      contracts: loadContracts(wallet, parseInt(config.chainId)),
      chainId: parseInt(config.chainId),
      address: address,
      provider: wallet.provider,
      signer: wallet,
    };

    await dispatchAccount({
      type: "addWallet",
      wallet: {
        address: address,
        providerType: "hardware",
        walletProvider,
      },
    });

    await dispatchWalletContext({
      type: "setActiveWallet",
      data: {
        ...walletProvider,
        providerType: "hardware",
      },
    });
  };

  const listAddresses = async (startIndex = 0) => {
    try {
      const tempSigner = new LedgerSigner(
        walletContext.activeWallet.provider,
        dispatchWalletContext
      );
      return tempSigner.listAddresses(startIndex);
    } catch (err) {
      console.error(err);
    }
  };

  const connectLedger = (index = 0) => {
    const ledgerSigner = new LedgerSigner(
      walletContext.activeWallet.provider,
      dispatchWalletContext,
      index
    );

    return addHardwareWalletToContext(ledgerSigner);
  };

  return {
    connectLedger,
    listAddresses,
  };
};
