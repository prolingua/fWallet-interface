import { useContext } from "react";
import { ActiveWalletContext } from "../context/ActiveWalletProvider";

const useWalletProvider = () => {
  const [walletContext, dispatchWalletContext] = useContext(
    ActiveWalletContext
  );

  const sendTransaction = () => {
    walletContext.activeWallet.signer.sendTransaction();
  };

  return { walletContext, dispatchWalletContext };
};

export default useWalletProvider;
