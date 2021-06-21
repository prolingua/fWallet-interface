import useWalletProvider from "./useWalletProvider";
import useTransaction from "./useTransaction";
import { send } from "../utils/transactions";
import { loadERC20Contract } from "../utils/wallet";

const useFantomERC20 = () => {
  const { walletContext } = useWalletProvider();
  const { dispatchTx } = useTransaction();

  const sendTokens = async (
    contractAddress: string,
    toAddress: string,
    amount: string
  ) => {
    if (!walletContext.activeWallet.signer) {
      console.error("[sendTransation] signer not found");
      return;
    }
    if (parseFloat(amount) <= 0) {
      console.error("[sendTransation] amount <= 0");
      return;
    }

    const contract = await loadERC20Contract(
      contractAddress,
      walletContext.activeWallet.signer
    );

    return send(
      walletContext.activeWallet.provider,
      () => contract.transfer(toAddress, amount),
      dispatchTx
    );
  };

  const estimateGas = async (
    contractAddress: string,
    method: string,
    args: string[]
  ) => {
    const contract = await loadERC20Contract(
      contractAddress,
      walletContext.activeWallet.signer
    );

    return contract.estimateGas[method](...args);
  };

  return {
    sendTokens: async (
      contractAddress: string,
      toAddress: string,
      amount: string
    ) => await sendTokens(contractAddress, toAddress, amount),
    estimateGas: async (
      contractAddress: string,
      method: string,
      args: string[]
    ) => {
      return estimateGas(contractAddress, method, args);
    },
  };
};

export default useFantomERC20;
