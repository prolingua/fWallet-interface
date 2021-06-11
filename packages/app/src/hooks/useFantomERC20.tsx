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

  return {
    sendTokens: async (
      contractAddress: string,
      toAddress: string,
      amount: string
    ) => await sendTokens(contractAddress, toAddress, amount),
  };
};

export default useFantomERC20;
