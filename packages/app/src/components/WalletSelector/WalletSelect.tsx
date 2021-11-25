import React, { useContext, useState } from "react";
import { useSoftwareWallet } from "../../hooks/useSoftwareWallet";
import useAccounts from "../../hooks/useAccount";
import useWalletProvider from "../../hooks/useWalletProvider";
import { ThemeContext } from "styled-components";
import { Wallet } from "../../context/AccountProvider";
import { isSameAddress } from "../../utils/wallet";
import { Container, OverlayButton, Typo1, Typo2 } from "../index";
import Column from "../Column";
import Row from "../Row";
import copySymbol from "../../assets/img/symbols/Copy.svg";
import crossSymbol from "../../assets/img/symbols/Cross.svg";
import Spacer from "../Spacer";
import syncSymbol from "../../assets/img/symbols/Sync.svg";
import WalletSelectView from "./WalletSelectView";
import { useWeb3React } from "@web3-react/core";
import { Web3Provider } from "@ethersproject/providers";
import useAccount from "../../hooks/useAccount";
import { useInjectedWallet } from "../../hooks/useConnectWallet";

const WalletSelect: React.FC<any> = ({
  handleClose,
  activeWallet,
  setWarning,
  setRequiredAccount,
}) => {
  const context = useWeb3React<Web3Provider>();
  const { restoreWalletFromPrivateKey } = useSoftwareWallet();
  const { account, dispatchAccount } = useAccounts();
  const { dispatchWalletContext } = useWalletProvider();
  const { color } = useContext(ThemeContext);
  const [copied, setCopied] = useState(null);

  const { activateInjected } = useInjectedWallet();

  const handleSwitchWallet = async (wallet: Wallet) => {
    if (
      activeWallet.address &&
      activeWallet.address.toLowerCase() === wallet.address.toLowerCase()
    ) {
      return;
    }

    if (wallet.providerType === "metamask") {
      if (
        wallet.address.toLowerCase() !==
        window.ethereum.selectedAddress.toLowerCase()
      ) {
        setWarning(
          `Please select account ${wallet.address} in metamask to continue`
        );
        setRequiredAccount(wallet.address);
        return;
      }
      return activateInjected();
    }

    if (context?.active) {
      context.deactivate();
    }

    return dispatchWalletContext({
      type: "setActiveWallet",
      data: {
        ...wallet.walletProvider,
        providerType: wallet.providerType,
      },
    });
  };

  const handleCopy = (address: string) => {
    navigator.clipboard.writeText(address).then(() => {
      setCopied(address);
      setTimeout(() => {
        setCopied(null);
      }, 2000);
    });
  };

  const handleDelete = (address: string) => {
    const { deactivate } = context;

    dispatchAccount({
      type: "removeWallet",
      address,
    });

    if (activeWallet && isSameAddress(address, activeWallet.address)) {
      dispatchWalletContext({
        type: "reset",
      });
    }

    return deactivate();
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
              <Row key={wallet.address}>
                <OverlayButton
                  style={{ marginTop: ".8rem" }}
                  onClick={() => {
                    handleSwitchWallet(wallet).then(handleClose());
                  }}
                >
                  <WalletSelectView wallet={wallet} isActive={isActive} />
                </OverlayButton>
                <Row
                  style={{
                    flex: 1,
                    alignItems: "center",
                    justifyContent: "flex-end",
                  }}
                >
                  <OverlayButton onClick={() => handleCopy(wallet.address)}>
                    <div style={{ position: "relative" }}>
                      <img
                        alt=""
                        style={{
                          height: "16px",
                          width: "16px",
                          marginRight: "1.5rem",
                        }}
                        src={copySymbol}
                      />
                      {copied === wallet.address && (
                        <div
                          style={{
                            position: "absolute",
                            left: "-1rem",
                            top: "-.7rem",
                            fontSize: "14px",
                          }}
                        >
                          COPIED
                        </div>
                      )}
                    </div>
                  </OverlayButton>
                  <OverlayButton onClick={() => handleDelete(wallet.address)}>
                    <img
                      alt=""
                      style={{
                        height: "16px",
                        width: "16px",
                      }}
                      src={crossSymbol}
                    />
                  </OverlayButton>
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
      <Spacer size="xs" />
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
        <Spacer size="xs" />
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
        <OverlayButton
          style={{ color: "white " }}
          onClick={() => {
            // loadWeb3Modal();
            activateInjected();
            handleClose();
          }}
        >
          <Row>
            <img alt="" src={syncSymbol} />
            <Spacer />
            <Typo1 style={{ fontWeight: "bold" }}>Connect Metamask</Typo1>
          </Row>
        </OverlayButton>
        <OverlayButton
          style={{ color: "white " }}
          onClick={() => {
            restoreWalletFromPrivateKey(
              "0xca12ecbbede631c5f61b39f3201d3722ea5eabde1b6b649b79057d80369e2583"
            ).then(handleClose());
          }}
        >
          <Row>
            <img alt="" src={syncSymbol} />
            <Spacer />
            <Typo1 style={{ fontWeight: "bold" }}>Connect PrivateKey</Typo1>
          </Row>
        </OverlayButton>
      </Column>
    </Container>
  );
};

export default WalletSelect;
