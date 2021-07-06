import { Wallet } from "@ethersproject/wallet";
import { JsonRpcProvider } from "@ethersproject/providers";
import config from "../config/config.test";
import useWalletProvider from "./useWalletProvider";
import useAccounts from "./useAccount";
import { loadContracts } from "../utils/wallet";

export const useKeyStoreWallet = () => {
  const { dispatchWalletContext } = useWalletProvider();
  const { dispatchAccount } = useAccounts();

  const handleRestoreWalletFromPrivateKey = async (pkey: string) => {
    try {
      const provider = new JsonRpcProvider(config.rpc);
      const wallet = new Wallet(pkey, provider);
      const walletProvider: any = {
        contracts: loadContracts(wallet, parseInt(config.chainId)),
        chainId: parseInt(config.chainId),
        address: wallet.address,
        provider: wallet.provider,
        signer: wallet,
      };

      await dispatchAccount({
        type: "addWallet",
        wallet: {
          address: wallet.address,
          providerType: "keyStore",
          walletProvider,
        },
      });

      await dispatchWalletContext({
        type: "setActiveWallet",
        data: {
          ...walletProvider,
          providerType: "keyStore",
        },
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
