import React from "react";

import useWalletProvider from "../hooks/useWalletProvider";
import Onboarding from "../containers/Onboarding";
import { useWalletEvents } from "../hooks/useConnectWallet";

function withConnectedWallet(WrappedComponent: React.FC) {
  return function WithConnectedWalletComponent({ ...props }) {
    const { walletContext } = useWalletProvider();
    useWalletEvents();

    if (!walletContext.activeWallet.address) {
      return <Onboarding />;
    }

    return <WrappedComponent {...props} />;
  };
}

export default withConnectedWallet;
