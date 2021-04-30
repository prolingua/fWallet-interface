import React, { useEffect, useState } from "react";

import useWalletProvider from "../../hooks/useWalletProvider";
import useSettings from "../../hooks/useSettings";

import { Button, Container, Header, WrapA } from "../../components";
import WalletButton from "../../components/WalletButton/WalletButton";
import CurrencySelector from "../../components/CurrencySelector";
import Column from "../../components/Column";
import DropDownButton from "../../components/DropDownButton";
import vShape from "../../assets/img/shapes/vShape.png";
import useAccounts from "../../hooks/useAccounts";
import { ActiveAccount } from "../../context/AccountsProvider";
import Spacer from "../../components/Spacer";
import useWeb3Modal from "../../hooks/useWeb3Modal";

const WalletSelect: React.FC<any> = ({ handleClose, activeWallet }) => {
  const [, loadWeb3Modal] = useWeb3Modal();
  const { accounts } = useAccounts();
  console.log(accounts);
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
                  handleClose();
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
          Connect Account
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
