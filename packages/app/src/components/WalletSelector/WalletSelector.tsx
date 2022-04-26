import React, { useContext, useEffect, useState } from "react";
import useAccount from "../../hooks/useAccount";
import useWalletProvider from "../../hooks/useWalletProvider";
import useModal from "../../hooks/useModal";
import InfoModal from "../InfoModal";
import { isSameAddress } from "../../utils/wallet";
import DropDownButton from "../DropDownButton";
import { Button } from "../index";
import Row from "../Row";
import vShape from "../../assets/img/shapes/vShape.png";
import WalletSelectView from "./WalletSelectView";
import WalletSelect from "./WalletSelect";
import config from "../../config/config";
import { Context } from "../../context/ModalProvider";
import { switchToChain } from "../../web3/events";
import useLedgerWatcher from "../../hooks/useLedgerWatcher";
import { useLocation } from "react-router-dom";

const WalletSelector: React.FC<any> = ({ width }) => {
  const modalContext = useContext(Context);
  const location = useLocation();
  const { account, dispatchAccount } = useAccount();
  const { walletContext, dispatchWalletContext } = useWalletProvider();
  const [warning, setWarning] = useState(null);
  const [requiredAccount, setRequiredAccount] = useState(null);
  const [closeDropDown, setCloseDropDown] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  useLedgerWatcher();

  const handleClose = () => {
    setCloseDropDown(true);
  };

  const [onPresentWrongAccountModal, onDismissWrongAccountModal] = useModal(
    <InfoModal message={warning} withCloseButton={true} />,
    "browser-wrong-account-modal",
    true
  );
  const [onPresentWrongChainSelected, onDismissWrongChainSelected] = useModal(
    <InfoModal
      message={`[Web3] wrong network selected. Please change your network to Fantom ${
        parseInt(config.chainId) === 250 ? "Opera" : "Testnet"
      } to continue`}
      withCloseButton={false}
      handleActionButton={async () =>
        await switchToChain(
          walletContext.activeWallet.provider,
          parseInt(config.chainId)
        )
      }
      actionButtonText={`Switch to ${
        parseInt(config.chainId) === 250 ? "Fantom Opera" : "Fantom Testnet"
      }`}
      actionButtonNoDismiss={true}
    />,
    "browser-wrong-network-modal",
    true
  );

  const switchToNewWeb3Provider = () => {
    return dispatchWalletContext({
      type: "setActiveWallet",
      data: {
        ...walletContext.web3ProviderState.walletProvider,
        providerType: "browser",
      },
    });
  };

  const [onPresentUnknownAccountModal, onDismissUnknownAccountModal] = useModal(
    <InfoModal
      message={
        <div>
          Unknown web3 wallet account selected, do you want to add{" "}
          {walletContext.web3ProviderState.accountSelected}? <br />
          <br /> If not, select currently active account{" "}
          {walletContext.activeWallet.address} <br /> in web3 wallet to
          continue.
        </div>
      }
      handleButton={() => {
        switchToNewWeb3Provider();
        dispatchAccount({
          type: "addWallet",
          wallet: {
            address: walletContext.web3ProviderState.accountSelected,
            providerType: "browser",
          },
        });
      }}
      withCloseButton={false}
    />,
    "browser-unknown-account-modal",
    true
  );

  useEffect(() => {
    const { activeWallet, web3ProviderState } = walletContext;
    if (!web3ProviderState.accountSelected) {
      return;
    }

    // Switch to new provider if the required account is the currently active metamask account
    if (
      activeWallet.providerType !== "browser" &&
      isSameAddress(requiredAccount, web3ProviderState.accountSelected)
    ) {
      return switchToNewWeb3Provider();
    }

    // Handle provider account change only if current provider is of type metamask
    if (
      !isSameAddress(activeWallet.address, web3ProviderState.accountSelected) &&
      activeWallet.providerType === "browser"
    ) {
      const existingWallet = account.wallets.find((wallet: any) =>
        isSameAddress(wallet.address, web3ProviderState.accountSelected)
      );

      // Prompt user to add unknown wallet
      if (!existingWallet) {
        onPresentUnknownAccountModal();
        return;
      }

      // Switch to existing wallet
      return switchToNewWeb3Provider();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [walletContext, requiredAccount, modalContext.isOpen]);

  // Force closing of the dropdown
  useEffect(() => {
    if (closeDropDown) {
      setCloseDropDown(false);
    }
  }, [closeDropDown]);

  // TODO move chain check to other place (own hook preferably)
  // Present warning modal if wrong metamask account or network is selected
  useEffect(() => {
    // TODO: create solution useable on all pages (useMultiChain)
    if (location.pathname === "/bridge") {
      return;
    }
    if (
      walletContext.activeWallet.providerType === "browser" &&
      walletContext.web3ProviderState.chainSelected &&
      walletContext.web3ProviderState.chainSelected !== parseInt(config.chainId)
    ) {
      return onPresentWrongChainSelected();
    }
    if (
      walletContext.web3ProviderState.chainSelected ===
        parseInt(config.chainId) &&
      modalContext.modalKey === "browser-wrong-network-modal"
    ) {
      onDismissWrongChainSelected();
    }
    if (warning) {
      onPresentWrongAccountModal();
      setWarning(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    warning,
    requiredAccount,
    walletContext.web3ProviderState,
    modalContext.isOpen,
  ]);

  // Close warning modal if requirements are met
  useEffect(() => {
    if (
      isSameAddress(requiredAccount, walletContext.activeWallet.address) &&
      modalContext.modalKey === "browser-wrong-account-modal"
    ) {
      onDismissWrongAccountModal();
    }
    if (
      isSameAddress(
        walletContext.activeWallet.address,
        walletContext.web3ProviderState.accountSelected
      ) &&
      modalContext.modalKey === "browser-unknown-account-modal"
    ) {
      onDismissUnknownAccountModal();
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    requiredAccount,
    walletContext.activeWallet.address,
    walletContext.web3ProviderState.accountSelected,
    modalContext.isOpen,
  ]);

  return (
    <DropDownButton
      width={width}
      triggerClose={closeDropDown}
      DropDown={() =>
        WalletSelect({
          handleClose,
          activeWallet: walletContext.activeWallet,
          setWarning,
          setRequiredAccount,
        })
      }
      dropdownWidth={336}
      dropdownTop={70}
      dropdownRight={5}
      getState={setIsDropdownOpen}
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
            {walletContext.activeWallet.address ? (
              <WalletSelectView wallet={walletContext.activeWallet} />
            ) : (
              <div>Select wallet</div>
            )}
          </Row>
          <Row align="center" justify="center">
            <img
              alt=""
              src={vShape}
              style={{
                marginLeft: ".5rem",
                alignSelf: "center",
                transform: isDropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
              }}
            />
          </Row>
        </Row>
      </Button>
    </DropDownButton>
  );
};

export default WalletSelector;
