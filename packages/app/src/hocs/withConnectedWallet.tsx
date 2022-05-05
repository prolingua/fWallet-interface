import React from "react";

import Onboarding from "../containers/Onboarding";
import { useWalletEvents } from "../hooks/useConnectWallet";
import useAccount from "../hooks/useAccount";

function withConnectedWallet(WrappedComponent: React.FC) {
  return function WithConnectedWalletComponent({ ...props }) {
    const { account } = useAccount();
    useWalletEvents();

    if (!account.wallets.length) {
      return <Onboarding />;
    }

    return <WrappedComponent {...props} />;
  };
}

export default withConnectedWallet;
