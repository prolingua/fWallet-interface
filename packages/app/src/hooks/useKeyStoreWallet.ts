import { Wallet } from "@ethersproject/wallet";
import { JsonRpcProvider } from "@ethersproject/providers";
import config from "../config/config.test";
import useWalletProvider from "./useWalletProvider";
import useAccounts from "./useAccount";

export const useKeyStoreWallet = () => {
  const { dispatchActiveWallet } = useWalletProvider();
  const { dispatchAccount } = useAccounts();

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

      await dispatchAccount({
        type: "addWallet",
        wallet: {
          address: wallet.address,
          type: "keyStore",
          walletProvider,
        },
      });

      await dispatchActiveWallet({
        type: "setActiveWallet",
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
