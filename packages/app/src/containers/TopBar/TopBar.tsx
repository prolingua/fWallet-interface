import React, { useEffect, useState } from "react";

import useWalletProvider from "../../hooks/useWalletProvider";
import useSettings from "../../hooks/useSettings";

import { Button, Container, Header, WrapA } from "../../components";
import CurrencySelector from "../../components/CurrencySelector";
import Column from "../../components/Column";
import DropDownButton from "../../components/DropDownButton";
import vShape from "../../assets/img/shapes/vShape.png";
import useAccounts from "../../hooks/useAccounts";
import { ActiveAccount } from "../../context/AccountsProvider";
import Spacer from "../../components/Spacer";
import useWeb3Modal from "../../hooks/useWeb3Modal";
import { useKeyStoreWallet } from "../../hooks/useKeyStoreWallet";

const WalletSelect: React.FC<any> = ({ handleClose, activeWallet }) => {
  const [loadWeb3Modal] = useWeb3Modal();
  const { restoreWalletFromPrivateKey } = useKeyStoreWallet();
  const { accounts } = useAccounts();
  const { wallet, dispatchWp } = useWalletProvider();

  const handleSwitchAccount = async (activeAccount: ActiveAccount) => {
    if (activeAccount.account === wallet.account) {
      return;
    }

    if (activeAccount.type === "metamask") {
      if (
        activeAccount.account.toLowerCase() !==
        window.ethereum.selectedAddress.toLowerCase()
      ) {
        // TODO: move to user modal
        console.log("Please select correct account in metamask");
        return;
      }
      return loadWeb3Modal();
    }

    return dispatchWp({
      type: "setContext",
      ...activeAccount.walletProvider,
    });
  };

  return (
    <Container padding="0">
      <Column style={{ padding: "1rem" }}>
        {accounts.activeAccounts.length ? (
          accounts.activeAccounts.map((activeAccount: ActiveAccount) => {
            const isActive =
              activeWallet.account &&
              activeAccount.account.toLowerCase() ===
                activeWallet.account.toLowerCase();
            return (
              <WrapA
                key={activeAccount.account}
                onClick={() => {
                  handleSwitchAccount(activeAccount).then(handleClose());
                }}
              >
                <Column style={{ color: isActive && "green" }}>
                  <div>{activeAccount.account}</div>
                  <div>{activeAccount.type}</div>
                </Column>
              </WrapA>
            );
          })
        ) : (
          <Column>No wallets found</Column>
        )}
      </Column>
      <Spacer size="sm" />
      <Column style={{ borderTop: "1px solid grey", padding: "1rem" }}>
        <WrapA
          onClick={() => {
            loadWeb3Modal();
            handleClose();
          }}
        >
          Connect Metamask
        </WrapA>
      </Column>
      <Column style={{ borderTop: "1px solid grey", padding: "1rem" }}>
        <WrapA
          onClick={() => {
            restoreWalletFromPrivateKey(
              "0xca12ecbbede631c5f61b39f3201d3722ea5eabde1b6b649b79057d80369e2583"
            ).then(handleClose());
          }}
        >
          Connect Privatekey
        </WrapA>
      </Column>
    </Container>
  );
};

const WalletSelector: React.FC<any> = ({ activeWallet }) => {
  const [closeDropDown, setCloseDropDown] = useState(false);
  const handleClose = () => {
    setCloseDropDown(true);
  };

  useEffect(() => {
    if (closeDropDown) {
      setCloseDropDown(false);
    }
  }, [closeDropDown]);

  return (
    <DropDownButton
      triggerClose={closeDropDown}
      DropDown={() => WalletSelect({ handleClose, activeWallet })}
    >
      <Button
        variant="secondary"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: "bold",
        }}
      >
        <div></div>
        <div>
          {activeWallet.account ? activeWallet.account : "Connect to wallet"}
        </div>
        <img src={vShape} style={{ paddingLeft: ".5rem" }} />
      </Button>
    </DropDownButton>
  );
};

const TopBar: React.FC<any> = () => {
  const { wallet } = useWalletProvider();
  const { settings, dispatchSettings } = useSettings();

  return (
    <Header>
      <CurrencySelector
        current={settings.currency}
        dispatch={dispatchSettings}
      />
      <WalletSelector activeWallet={wallet} />
    </Header>
  );
};

export default TopBar;
