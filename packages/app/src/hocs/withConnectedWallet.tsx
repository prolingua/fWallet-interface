import React from "react";

// import useWalletProvider from "../hooks/useWalletProvider";
import Onboarding from "../containers/Onboarding";
import { useWalletEvents } from "../hooks/useConnectWallet";
import useAccount from "../hooks/useAccount";

function withConnectedWallet(WrappedComponent: React.FC) {
  return function WithConnectedWalletComponent({ ...props }) {
    // const { walletContext } = useWalletProvider();
    const { account } = useAccount();
    useWalletEvents();

    // if (!walletContext.activeWallet.address) {
    if (!account.wallets.length) {
      return <Onboarding />;
    }

    return <WrappedComponent {...props} />;
  };
}

export default withConnectedWallet;
