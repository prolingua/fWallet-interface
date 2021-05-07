import React, { useContext, useEffect, useState } from "react";
import stc from "string-to-color";

import useWalletProvider from "../../hooks/useWalletProvider";
import useSettings from "../../hooks/useSettings";

import {
  Button,
  Container,
  Header,
  Typo1,
  Typo2,
  WrapA,
} from "../../components";
import CurrencySelector from "../../components/CurrencySelector";
import Column from "../../components/Column";
import DropDownButton from "../../components/DropDownButton";
import vShape from "../../assets/img/shapes/vShape.png";
import useAccounts from "../../hooks/useAccount";
import { Wallet } from "../../context/AccountProvider";
import Spacer from "../../components/Spacer";
import useWeb3Modal from "../../hooks/useWeb3Modal";
import { useKeyStoreWallet } from "../../hooks/useKeyStoreWallet";
import Row from "../../components/Row";
import { ThemeContext } from "styled-components";
import { formatAddress } from "../../utils/wallet";
import editSymbol from "../../assets/img/symbols/Edit.svg";
import copySymbol from "../../assets/img/symbols/Copy.svg";
import crossSymbol from "../../assets/img/symbols/Cross.svg";
import syncSymbol from "../../assets/img/symbols/Sync.svg";
import InfoModal from "../../components/InfoModal";
import useModal from "../../hooks/useModal";

const WalletSelectView: React.FC<any> = ({ wallet, isActive }) => {
  return (
    <Row>
      <div
        style={{
          alignSelf: "center",
          backgroundColor: stc(wallet.address),
          borderRadius: "50%",
          height: "1.8rem",
          width: "1.8rem",
          marginRight: ".6rem",
        }}
      />
      <Column style={{ alignItems: "baseline" }}>
        <div style={{ fontSize: "18px", fontWeight: "bold" }}>
          {formatAddress(wallet.address)}
        </div>
        <Typo2 style={{ color: "#B7BECB" }}>{wallet.providerType}</Typo2>
      </Column>
    </Row>
  );
};

const WalletSelect: React.FC<any> = ({
  handleClose,
  activeWallet,
  setWarning,
}) => {
  const [loadWeb3Modal] = useWeb3Modal();
  const { restoreWalletFromPrivateKey } = useKeyStoreWallet();
  const { account } = useAccounts();
  const { dispatchActiveWallet } = useWalletProvider();
  const { color } = useContext(ThemeContext);

  const handleSwitchWallet = async (wallet: Wallet) => {
    if (activeWallet.address.toLowerCase() === wallet.address.toLowerCase()) {
      return;
    }

    if (wallet.providerType === "metamask") {
      if (
        wallet.address.toLowerCase() !==
        window.ethereum.selectedAddress.toLowerCase()
      ) {
        console.log("GOGO!!");
        setWarning(`Please select ${wallet.address} account in metamask`);
        return;
      }
      return loadWeb3Modal();
    }

    return dispatchActiveWallet({
      type: "setActiveWallet",
      data: {
        ...wallet.walletProvider,
        providerType: wallet.providerType,
      },
    });
  };

  return (
    <Container padding="0">
      <Column style={{ padding: "1rem 2rem" }}>
        <Typo2 style={{ color: color.greys.grey(), fontWeight: "bold" }}>
          Connected
        </Typo2>
        {account.wallets.length ? (
          account.wallets.map((wallet: Wallet) => {
            const isActive =
              activeWallet.address &&
              wallet.address.toLowerCase() ===
                activeWallet.address.toLowerCase();
            return (
              <Row>
                <WrapA
                  style={{ marginTop: ".8rem" }}
                  key={wallet.address}
                  onClick={() => {
                    handleSwitchWallet(wallet).then(handleClose());
                  }}
                >
                  <WalletSelectView wallet={wallet} isActive={isActive} />
                </WrapA>
                <Row
                  style={{
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "flex-end",
                  }}
                >
                  <WrapA>
                    <img
                      style={{
                        height: "16px",
                        width: "16px",
                        marginRight: "1.5rem",
                      }}
                      src={editSymbol}
                    />
                  </WrapA>
                  <WrapA>
                    <img
                      style={{
                        height: "16px",
                        width: "16px",
                        marginRight: "1.5rem",
                      }}
                      src={copySymbol}
                    />
                  </WrapA>
                  <WrapA>
                    <img
                      style={{
                        height: "16px",
                        width: "16px",
                      }}
                      src={crossSymbol}
                    />
                  </WrapA>
                </Row>
              </Row>
            );
          })
        ) : (
          <Typo1 style={{ paddingTop: ".8rem", fontWeight: "bold" }}>
            No wallet connected
          </Typo1>
        )}
      </Column>
      <Spacer size="sm" />
      <Column
        style={{
          borderTop: "1px solid rgba(58,72,97,1)",
          padding: "1rem 2rem",
        }}
      >
        <Column>
          <Typo2
            style={{
              color: color.greys.grey(),
              fontWeight: "bold",
              paddingBottom: ".4rem",
            }}
          >
            Total FTM balance
          </Typo2>
          <Typo2 style={{ fontWeight: "bold" }}>12,000,100.72 FTM</Typo2>
        </Column>
        <Spacer size="sm" />
        <Column>
          <Typo2
            style={{
              color: color.greys.grey(),
              fontWeight: "bold",
              paddingBottom: ".4rem",
            }}
          >
            Total asset value
          </Typo2>
          <Typo2 style={{ fontWeight: "bold" }}>$94,123.61</Typo2>
        </Column>
      </Column>
      <Column
        style={{
          borderTop: "1px solid rgba(58,72,97,1)",
          padding: "1rem 2rem",
        }}
      >
        <WrapA
          onClick={() => {
            loadWeb3Modal();
            handleClose();
          }}
        >
          <Row>
            <img src={syncSymbol} />
            <Spacer />
            <Typo1 style={{ fontWeight: "bold" }}>Connect Metamask</Typo1>
          </Row>
        </WrapA>
        <WrapA
          onClick={() => {
            restoreWalletFromPrivateKey(
              "0xca12ecbbede631c5f61b39f3201d3722ea5eabde1b6b649b79057d80369e2583"
            ).then(handleClose());
          }}
        >
          <Row>
            <img src={syncSymbol} />
            <Spacer />
            <Typo1 style={{ fontWeight: "bold" }}>Connect PrivateKey</Typo1>
          </Row>
        </WrapA>
      </Column>
    </Container>
  );
};

const WalletSelector: React.FC<any> = ({ activeWallet, width }) => {
  const [closeDropDown, setCloseDropDown] = useState(false);
  const [warning, setWarning] = useState(null);
  const [onPresentInfoModal, onDismissInfoModal] = useModal(
    <InfoModal message={warning} />
  );

  const handleClose = () => {
    setCloseDropDown(true);
  };

  useEffect(() => {
    if (closeDropDown) {
      setCloseDropDown(false);
    }
  }, [closeDropDown]);

  useEffect(() => {
    console.log({ warning });
    if (warning) {
      onPresentInfoModal();
    }
    setWarning(null);
  }, [warning]);

  return (
    <DropDownButton
      width={width}
      triggerClose={closeDropDown}
      DropDown={() => WalletSelect({ handleClose, activeWallet, setWarning })}
      dropdownWidth={344}
      dropdownTop={70}
      dropdownRight={0}
    >
      <Button
        variant="secondary"
        style={{
          display: "flex",
          alignItems: "center",
          fontWeight: "bold",
          width: "100%",
          height: "56px",
        }}
      >
        <Row style={{ flex: 1, justifyContent: "space-between" }}>
          <Row>
            {activeWallet.address ? (
              <WalletSelectView wallet={activeWallet} />
            ) : (
              <div>Select wallet</div>
            )}
          </Row>
          <Row align="center" justify="center">
            <img
              src={vShape}
              style={{
                marginLeft: ".5rem",
                alignSelf: "center",
              }}
            />
          </Row>
        </Row>
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
        width="120px"
        current={settings.currency}
        dispatch={dispatchSettings}
      />
      <Spacer />
      <WalletSelector width="200px" activeWallet={activeWallet} />
    </Header>
  );
};

export default TopBar;
