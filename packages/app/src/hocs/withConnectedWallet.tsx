import React from "react";

import useWalletProvider from "../hooks/useWalletProvider";
import Onboarding from "../containers/Onboarding";

function withConnectedWallet(WrappedComponent: React.FC) {
  return function WithConnectedWalletComponent({ ...props }) {
    const { walletContext } = useWalletProvider();

    console.log(walletContext.activeWallet);

    if (!walletContext.activeWallet.address) {
      return <Onboarding />;
    }

    return <WrappedComponent {...props} />;
  };
}

export default withConnectedWallet;
