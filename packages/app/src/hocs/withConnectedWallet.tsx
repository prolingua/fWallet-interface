import React from "react";

import useWalletProvider from "../hooks/useWalletProvider";
import WalletButton from "../components/WalletButton/WalletButton";

function withConnectedWallet(WrappedComponent: React.FC) {
  return function WithConnectedWalletComponent({ ...props }) {
    const { walletContext } = useWalletProvider();

    if (!walletContext.activeWallet.address) {
      return (
        <div>
          <div>No WALLET connected</div>
          <WalletButton />
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };
}

export default withConnectedWallet;
