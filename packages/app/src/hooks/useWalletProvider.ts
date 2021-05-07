import { useContext } from "react";
import { ActiveWalletContext } from "../context/ActiveWalletProvider";

const useWalletProvider = () => {
  const [activeWallet, dispatchActiveWallet] = useContext(ActiveWalletContext);
  return { activeWallet, dispatchActiveWallet };
};

export default useWalletProvider;
