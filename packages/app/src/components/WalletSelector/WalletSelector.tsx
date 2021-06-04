import React, { useEffect, useState } from "react";
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
import config from "../../config/config.test";

const WalletSelector: React.FC<any> = ({ walletContext, width }) => {
  const { account, dispatchAccount } = useAccount();
  const { dispatchWalletContext } = useWalletProvider();
  const [closeDropDown, setCloseDropDown] = useState(false);
  const [warning, setWarning] = useState(null);
  const [requiredAccount, setRequiredAccount] = useState(null);
  const [onPresentWrongAccountModal, onDismissWrongAccountModal] = useModal(
    <InfoModal message={warning} />
  );
  const [onPresentWrongChainSelected, onDismissWrongChainSelected] = useModal(
    <InfoModal
      message={`Metamask: wrong network selected. Please change your network to Fantom Testnet`}
    />
  );

  const switchToNewWeb3Provider = () => {
    return dispatchWalletContext({
      type: "setActiveWallet",
      data: {
        ...walletContext.web3ProviderState.walletProvider,
        providerType: "metamask",
      },
    });
  };

  const [onPresentUnknownAccountModal] = useModal(
    <InfoModal
      message={`Unknown metamask account selected, do you want to add ${walletContext.web3ProviderState.accountSelected}`}
      handleButton={() => {
        switchToNewWeb3Provider();
        dispatchAccount({
          type: "addWallet",
          wallet: {
            address: walletContext.web3ProviderState.accountSelected,
            providerType: "metamask",
          },
        });
      }}
    />
  );

  useEffect(() => {
    const { activeWallet, web3ProviderState } = walletContext;
    if (!web3ProviderState.accountSelected) {
      return;
    }

    // Switch to new provider if the required account is the currently active metamask account
    if (
      activeWallet.providerType !== "metamask" &&
      isSameAddress(requiredAccount, web3ProviderState.accountSelected)
    ) {
      return switchToNewWeb3Provider();
    }

    // Handle provider account change only if current provider is of type metamask
    if (
      !isSameAddress(activeWallet.address, web3ProviderState.accountSelected) &&
      activeWallet.providerType === "metamask"
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
  }, [walletContext, requiredAccount]);

  const handleClose = () => {
    setCloseDropDown(true);
  };

  // Force closing of the dropdown
  useEffect(() => {
    if (closeDropDown) {
      setCloseDropDown(false);
    }
  }, [closeDropDown]);

  // TODO move chain check to other place (own hook preferably)
  // Present warning modal if wrong metamask account or network is selected
  useEffect(() => {
    if (
      walletContext.activeWallet.providerType === "metamask" &&
      walletContext.web3ProviderState.chainSelected &&
      walletContext.web3ProviderState.chainSelected !== parseInt(config.chainId)
    ) {
      return onPresentWrongChainSelected();
    }
    if (
      walletContext.web3ProviderState.chainSelected === parseInt(config.chainId)
    ) {
      onDismissWrongChainSelected();
    }
    if (warning) {
      onPresentWrongAccountModal();
      setWarning(null);
    }
  }, [warning, requiredAccount, walletContext.web3ProviderState]);

  // Close warning modal if requirements are met
  useEffect(() => {
    if (isSameAddress(requiredAccount, walletContext.activeWallet.address)) {
      onDismissWrongAccountModal();
    }
  }, [requiredAccount, walletContext.activeWallet.address]);

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
              }}
            />
          </Row>
        </Row>
      </Button>
    </DropDownButton>
  );
};

export default WalletSelector;
