import { Wallet } from "@ethersproject/wallet";
import { JsonRpcProvider, Web3Provider } from "@ethersproject/providers";
import config from "../config/config";
import useWalletProvider from "./useWalletProvider";
import useAccounts from "./useAccount";
import { loadContracts } from "../utils/wallet";
import { useWeb3React } from "@web3-react/core";

export const useSoftwareWallet = () => {
  const { dispatchWalletContext } = useWalletProvider();
  const { dispatchAccount } = useAccounts();
  const context = useWeb3React<Web3Provider>();

  const addWalletToContext = async (wallet: Wallet, provider?: any) => {
    const walletProvider: any = {
      contracts: loadContracts(wallet, parseInt(config.chainId)),
      chainId: parseInt(config.chainId),
      address: wallet.address,
      provider: provider || wallet.provider,
      signer: wallet,
    };

    await dispatchAccount({
      type: "addWallet",
      wallet: {
        address: wallet.address,
        providerType: "software",
        walletProvider,
      },
    });

    await dispatchWalletContext({
      type: "setActiveWallet",
      data: {
        ...walletProvider,
        providerType: "software",
      },
    });
  };

  const handleCreateNewWallet = () => {
    const wallet = Wallet.createRandom();
  };

  const handleRestoreWalletFromPrivateKey = async (pkey: string) => {
    const provider = new JsonRpcProvider(config.rpc);
    const wallet = new Wallet(pkey, provider);

    if (context?.active) {
      context.deactivate();
    }

    return addWalletToContext(wallet);
  };

  const handleRestoreWalletFromMnemonic = async (mnemonic: string) => {
    const provider = new JsonRpcProvider(config.rpc);
    const wallet = Wallet.fromMnemonic(mnemonic);

    if (context?.active) {
      context.deactivate();
    }

    return addWalletToContext(wallet, provider);
  };

  const handleRestoreWalletFromEncryptedJson = async (
    json: string,
    password: string
  ) => {
    const provider = new JsonRpcProvider(config.rpc);
    const wallet = await Wallet.fromEncryptedJson(json, password);

    if (context?.active) {
      context.deactivate();
    }

    return addWalletToContext(wallet, provider);
  };

  return {
    createNewWallet: () => handleCreateNewWallet(),
    restoreWalletFromPrivateKey: (pkey: string) =>
      handleRestoreWalletFromPrivateKey(pkey),
    restoreWalletFromMnemonic: (mnemonic: string) =>
      handleRestoreWalletFromMnemonic(mnemonic),
    restoreWalletFromKeystoreFile: (json: string, password: string) =>
      handleRestoreWalletFromEncryptedJson(json, password),
  };
};