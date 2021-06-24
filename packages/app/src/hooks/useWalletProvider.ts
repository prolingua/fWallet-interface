import { useContext } from "react";
import { ActiveWalletContext } from "../context/ActiveWalletProvider";

const useWalletProvider = () => {
  const [walletContext, dispatchWalletContext] = useContext(
    ActiveWalletContext
  );

  return { walletContext, dispatchWalletContext };
};

export default useWalletProvider;
