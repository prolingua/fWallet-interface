import useWalletProvider from "./useWalletProvider";
import useTransaction from "./useTransaction";
import { send } from "../utils/transactions";

const useFantomNative = () => {
  const { walletContext } = useWalletProvider();
  const { dispatchTx } = useTransaction();

  const sendNativeTransaction = async (toAddress: string, amount: string) => {
    if (!walletContext.activeWallet.signer) {
      console.error("[sendTransation] signer not found");
      return;
    }
    if (parseFloat(amount) <= 0) {
      console.error("[sendTransation] amount <= 0");
      return;
    }

    return send(
      walletContext.activeWallet.provider,
      () =>
        walletContext.activeWallet.signer.sendTransaction({
          to: toAddress,
          value: amount,
        }),
      dispatchTx
    );
  };

  return {
    sendNativeTransaction: async (toAddress: string, amount: string) =>
      await sendNativeTransaction(toAddress, amount),
  };
};

export default useFantomNative;
