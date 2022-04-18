import React, { useContext, useEffect, useState } from "react";
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
import { useInjectedWallet } from "../../hooks/useConnectWallet";
import useFantomApi, { FantomApiMethods } from "../../hooks/useFantomApi";
import useSettings from "../../hooks/useSettings";
import useFantomNative from "../../hooks/useFantomNative";
import {
  toCurrencySymbol,
  toFormattedBalance,
  weiToUnit,
} from "../../utils/conversion";
import { BigNumber } from "@ethersproject/bignumber";
import useFantomApiData from "../../hooks/useFantomApiData";
import FormattedValue from "../FormattedBalance";
import useModal from "../../hooks/useModal";
import Modal from "../Modal";
import { AccessWallet } from "../../containers/Onboarding/Onboarding";
import { Context } from "../../context/ModalProvider";
import FadeInOut from "../AnimationFade";

const WalletSelect: React.FC<any> = ({
  handleClose,
  activeWallet,
  setWarning,
  setRequiredAccount,
}) => {
  const { onDismiss } = useContext(Context);
  const context = useWeb3React<Web3Provider>();
  const { account, dispatchAccount } = useAccounts();
  const { settings } = useSettings();
  const { getBalance } = useFantomNative();
  const { dispatchWalletContext } = useWalletProvider();
  const { apiData } = useFantomApiData();
  const { activateInjected } = useInjectedWallet();
  const { color } = useContext(ThemeContext);
  const [copied, setCopied] = useState(null);

  const [totalFtmBalance, setTotalFtmBalance] = useState(0);
  const [totalValue, setTotalValue] = useState(0);

  const tokenPrice =
    apiData[FantomApiMethods.getTokenPrice]?.data?.price?.price;
  useFantomApi(FantomApiMethods.getTokenPrice, {
    to: settings.currency.toUpperCase(),
  });

  const [onPresentOnboardingModal] = useModal(
    <Modal>
      <AccessWallet setFlow={console.log} addWallet onDismiss={onDismiss} />
    </Modal>,
    "access-wallet-modal"
  );

  useEffect(() => {
    if (account.wallets.length) {
      const balancePromises = account.wallets.map((wallet: any) =>
        getBalance(wallet.address)
      );
      Promise.all(balancePromises).then((balances) => {
        const totalFTM = (balances as BigNumber[]).reduce((accum, current) => {
          return accum + weiToUnit(current);
        }, 0);

        setTotalFtmBalance(totalFTM);
        if (tokenPrice) {
          setTotalValue(totalFTM * tokenPrice);
        }
      });
    }
  }, [account.wallets, tokenPrice]);

  const handleSwitchWallet = async (wallet: Wallet) => {
    if (
      activeWallet.address &&
      activeWallet.address.toLowerCase() === wallet.address.toLowerCase()
    ) {
      return;
    }

    if (wallet.providerType === "browser") {
      if (
        wallet.address.toLowerCase() !==
        window.ethereum.selectedAddress.toLowerCase()
      ) {
        setWarning(
          `Please select account ${wallet.address} in web3 wallet to continue`
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

    if (activeWallet && activeWallet.providerType === "hardware") {
      activeWallet.signer.closeTransport();
    }

    if (activeWallet && isSameAddress(address, activeWallet.address)) {
      dispatchWalletContext({
        type: "reset",
      });

      // Switch to other account (if exist);
      if (account.wallets.length > 1) {
        handleSwitchWallet(
          isSameAddress(account.wallets[0].address, address)
            ? account.wallets[1]
            : account.wallets[0]
        );
      }
    }

    if (activeWallet && activeWallet.providerType === "browser") {
      deactivate();
    }
  };

  const handleLogout = () => {
    const { deactivate } = context;

    if (activeWallet && activeWallet.providerType === "browser") {
      deactivate();
    }

    dispatchWalletContext({ type: "reset" });
    dispatchAccount({ type: "reset" });
  };

  return (
    <FadeInOut>
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
                              left: "-.7rem",
                              top: "-1rem",
                              fontSize: "12px",
                            }}
                          >
                            copied
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
            <FormattedValue
              fontSize="16px"
              fontWeight="bold"
              formattedValue={toFormattedBalance(totalFtmBalance)}
              tokenSymbol="FTM"
            />
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
            <FormattedValue
              fontSize="16px"
              fontWeight="bold"
              formattedValue={toFormattedBalance(totalValue)}
              currencySymbol={toCurrencySymbol(settings.currency)}
            />
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
              onPresentOnboardingModal();
            }}
          >
            <Row>
              <img alt="" src={syncSymbol} />
              <Spacer />
              <Typo1 style={{ fontWeight: "bold" }}>Add wallet</Typo1>
            </Row>
          </OverlayButton>
          {/*<OverlayButton*/}
          {/*  style={{ color: "white " }}*/}
          {/*  onClick={() => {*/}
          {/*    // loadWeb3Modal();*/}
          {/*    activateInjected();*/}
          {/*    handleClose();*/}
          {/*  }}*/}
          {/*>*/}
          {/*  <Row>*/}
          {/*    <img alt="" src={syncSymbol} />*/}
          {/*    <Spacer />*/}
          {/*    <Typo1 style={{ fontWeight: "bold" }}>Connect Metamask</Typo1>*/}
          {/*  </Row>*/}
          {/*</OverlayButton>*/}
          {/*<OverlayButton*/}
          {/*  style={{ color: "white " }}*/}
          {/*  onClick={() => {*/}
          {/*    restoreWalletFromPrivateKey(*/}
          {/*      "0xca12ecbbede631c5f61b39f3201d3722ea5eabde1b6b649b79057d80369e2583"*/}
          {/*    ).then(handleClose());*/}
          {/*  }}*/}
          {/*>*/}
          {/*  <Row>*/}
          {/*    <img alt="" src={syncSymbol} />*/}
          {/*    <Spacer />*/}
          {/*    <Typo1 style={{ fontWeight: "bold" }}>Connect PrivateKey</Typo1>*/}
          {/*  </Row>*/}
          {/*</OverlayButton>*/}
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
              handleLogout();
            }}
          >
            <Row>
              <img alt="" src={crossSymbol} />
              <Spacer />
              <Typo1 style={{ fontWeight: "bold" }}>Logout</Typo1>
            </Row>
          </OverlayButton>
        </Column>
      </Container>
    </FadeInOut>
  );
};

export default WalletSelect;
