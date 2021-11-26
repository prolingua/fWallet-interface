import { Wallet } from "@ethersproject/wallet";
import { JsonRpcProvider, Web3Provider } from "@ethersproject/providers";
import config from "../config/config";
import useWalletProvider from "./useWalletProvider";
import useAccounts from "./useAccount";
import { loadContracts } from "../utils/wallet";
import { useWeb3React } from "@web3-react/core";
import { wordlists } from "@ethersproject/wordlists";
import { entropyToMnemonic } from "@ethersproject/hdnode";
import { randomBytes } from "@ethersproject/random";
import { LedgerSigner } from "../utils/ledger";

export const useHardwareWallet = () => {
  const { dispatchWalletContext, walletContext } = useWalletProvider();
  const { dispatchAccount } = useAccounts();
  // const context = useWeb3React<Web3Provider>();

  const addWalletToContext = async (wallet: any) => {
    console.log({ wallet });
    const address = await wallet.getAddress();
    console.log({ address });
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

  const connectLedger = () => {
    const ledgerSigner = new LedgerSigner(walletContext.activeWallet.provider);
    console.log(ledgerSigner);
    // ledgerSigner.getAddress().then((address) => {
    //   console.log("ADDRESS", address);
    // });

    return addWalletToContext(ledgerSigner);
  };

  return {
    connectLedger,
  };
};
