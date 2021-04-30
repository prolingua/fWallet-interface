import React from "react";

import useWalletProvider from "../../hooks/useWalletProvider";
import useSettings from "../../hooks/useSettings";

import { Header } from "../../components";
import WalletButton from "../../components/WalletButton/WalletButton";
import CurrencyDropdown from "../../components/CurrencySelector";

const TopBar: React.FC<any> = () => {
  const { wallet } = useWalletProvider();
  const { settings, dispatchSettings } = useSettings();

  return (
    <Header>
      {!wallet.account && <WalletButton />}
      <div style={{ marginRight: "2rem" }}>
        {wallet.account ? wallet.account : "No WALLET connected"}
      </div>
      <CurrencyDropdown
        current={settings.currency}
        dispatch={dispatchSettings}
      />
    </Header>
  );
};

export default TopBar;
