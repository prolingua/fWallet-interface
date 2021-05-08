import React from "react";
import { Button } from "../index";
import useWeb3Modal from "../../hooks/useWeb3Modal";
import useWalletProvider from "../../hooks/useWalletProvider";

const WalletButton: React.FC<any> = () => {
  const [, loadWeb3Modal, logoutWeb3Modal] = useWeb3Modal();
  const { walletContext } = useWalletProvider();

  return (
    <Button
      variant="primary"
      onClick={() => {
        if (!walletContext.activeWallet.address) {
          loadWeb3Modal();
        } else {
          logoutWeb3Modal();
        }
      }}
    >
      {!walletContext.activeWallet.address
        ? "Connect Wallet"
        : "Disconnect Wallet"}
    </Button>
  );
};

export default WalletButton;
