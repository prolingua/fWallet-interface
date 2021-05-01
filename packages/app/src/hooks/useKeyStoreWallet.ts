import { Wallet } from "@ethersproject/wallet";
import { JsonRpcProvider } from "@ethersproject/providers";
import config from "../config/config.test";
import useWalletProvider from "./useWalletProvider";
import useAccounts from "./useAccounts";

export const useKeyStoreWallet = () => {
  const { dispatchWp } = useWalletProvider();
  const { dispatchAccounts } = useAccounts();

  const handleRestoreWalletFromPrivateKey = async (pkey: string) => {
    try {
      const provider = new JsonRpcProvider(config.rpc);
      const wallet = new Wallet(pkey, provider);
      const walletProvider: any = {
        contracts: [],
        chainId: parseInt(config.rpc),
        account: wallet.address,
        provider: wallet.provider,
        signer: wallet,
      };

      await dispatchAccounts({
        type: "addAccount",
        activeAccount: {
          account: wallet.address,
          type: "keyStore",
          walletProvider,
        },
      });

      await dispatchWp({
        type: "setContext",
        ...walletProvider,
      });
    } catch (err) {
      console.error(err);
    }
  };

  return {
    restoreWalletFromPrivateKey: (pkey: string) =>
      handleRestoreWalletFromPrivateKey(pkey),
  };
};
