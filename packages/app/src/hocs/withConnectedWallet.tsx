import React from "react";

import useWalletProvider from "../hooks/useWalletProvider";
import Column from "../components/Column";

function withConnectedWallet(WrappedComponent: React.FC) {
  return function WithConnectedWalletComponent({ ...props }) {
    const { walletContext } = useWalletProvider();

    if (!walletContext.activeWallet.address) {
      return (
        <Column
          style={{
            alignItems: "center",
            width: "100%",
            height: "100%",
          }}
        >
          <div style={{ marginTop: "5rem", marginBottom: "1rem" }}>
            No WALLET connected
          </div>
        </Column>
      );
    }

    return <WrappedComponent {...props} />;
  };
}

export default withConnectedWallet;
