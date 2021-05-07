import React, { useEffect, useState } from "react";

import useWalletProvider from "../../hooks/useWalletProvider";
import useSettings from "../../hooks/useSettings";

import { Button, Container, Header, WrapA } from "../../components";
import CurrencySelector from "../../components/CurrencySelector";
import Column from "../../components/Column";
import DropDownButton from "../../components/DropDownButton";
import vShape from "../../assets/img/shapes/vShape.png";
import useAccounts from "../../hooks/useAccount";
import { Wallet } from "../../context/AccountProvider";
import Spacer from "../../components/Spacer";
import useWeb3Modal from "../../hooks/useWeb3Modal";
import { useKeyStoreWallet } from "../../hooks/useKeyStoreWallet";

const WalletSelect: React.FC<any> = ({ handleClose, activeWallet }) => {
  const [loadWeb3Modal] = useWeb3Modal();
  const { restoreWalletFromPrivateKey } = useKeyStoreWallet();
  const { account } = useAccounts();
  const { dispatchActiveWallet } = useWalletProvider();

  const handleSwitchWallet = async (wallet: Wallet) => {
    if (activeWallet.address.toLowerCase() === wallet.address.toLowerCase()) {
      return;
    }

    if (wallet.type === "metamask") {
      if (
        wallet.address.toLowerCase() !==
        window.ethereum.selectedAddress.toLowerCase()
      ) {
        // TODO: move to user modal
        console.log("Please select correct account in metamask");
        return;
      }
      return loadWeb3Modal();
    }

    return dispatchActiveWallet({
      type: "setActiveWallet",
      ...wallet.walletProvider,
    });
  };

  return (
    <Container padding="0">
      <Column style={{ padding: "1rem" }}>
        {account.wallets.length ? (
          account.wallets.map((wallet: Wallet) => {
            const isActive =
              activeWallet.address &&
              wallet.address.toLowerCase() ===
                activeWallet.address.toLowerCase();
            return (
              <WrapA
                key={wallet.address}
                onClick={() => {
                  handleSwitchWallet(wallet).then(handleClose());
                }}
              >
                <Column style={{ color: isActive && "green" }}>
                  <div>{wallet.address}</div>
                  <div>{wallet.type}</div>
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
          {activeWallet.address ? activeWallet.address : "Connect to wallet"}
        </div>
        <img src={vShape} style={{ paddingLeft: ".5rem" }} />
      </Button>
    </DropDownButton>
  );
};

const TopBar: React.FC<any> = () => {
  const { activeWallet } = useWalletProvider();
  const { settings, dispatchSettings } = useSettings();

  return (
    <Header>
      <CurrencySelector
        current={settings.currency}
        dispatch={dispatchSettings}
      />
      <WalletSelector activeWallet={activeWallet} />
    </Header>
  );
};

export default TopBar;
