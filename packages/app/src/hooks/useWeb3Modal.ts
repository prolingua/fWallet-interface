import { useCallback, useState } from "react";
import { Web3Provider } from "@ethersproject/providers";
import Web3Modal from "web3modal";
import { Contract } from "@ethersproject/contracts";
// @ts-ignore
import { abis, addresses } from "@f-wallet/contracts";
import useWalletProvider from "./useWalletProvider";
import useAccounts from "./useAccount";

// const INFURA_ID = "7a9c4ff3188d481f9143904079638424";
// const NETWORK_NAME = "fantom";
// TODO clean up provider flow
function useWeb3Modal(config = {}) {
  const { activeWallet, dispatchActiveWallet } = useWalletProvider();
  const { account, dispatchAccount } = useAccounts();
  // const [autoLoaded, setAutoLoaded] = useState(false);
  // const {
  // autoLoad = true,
  // infuraId = INFURA_ID,
  // NETWORK = NETWORK_NAME,
  // }: any = config;

  const web3Modal = new Web3Modal({
    // network: NETWORK,
    cacheProvider: false,
    providerOptions: {},
    theme: "dark",
  });

  const loadContext = async (
    web3Provider: Web3Provider,
    existingAccount: boolean = false
  ) => {
    if (!web3Provider) {
      return;
    }

    const { chainId } = await web3Provider.getNetwork();
    const accounts = await web3Provider.listAccounts();
    const contracts = new Map([
      // [
      //   "PPDEX",
      //   new Contract(
      //     addresses[chainId].tokens["PPDEX"],
      //     abis.ppdex,
      //     web3Provider.getSigner()
      //   ),
      // ],
    ]);

    const walletProvider = {
      contracts,
      chainId,
      account: accounts[0],
      provider: web3Provider,
      signer: web3Provider.getSigner(),
    };

    if (!existingAccount) {
      await dispatchAccount({
        type: "addWallet",
        wallet: { address: accounts[0], type: "metamask" },
      });
    }

    return dispatchActiveWallet({
      type: "setActiveWallet",
      ...walletProvider,
    });
  };

  const resetApp = async () => {
    activeWallet.provider &&
      activeWallet.provider.close &&
      (await activeWallet.provider.close());

    await web3Modal.clearCachedProvider();
    await dispatchActiveWallet({
      type: "reset",
    });
    window.location.reload();
  };

  const subscribeProvider = async (provider: any) => {
    if (!provider.on) {
      return;
    }
    provider.on("chainChanged", async (chainId: string) => {
      console.info("[PROVIDER] chain changed to ", chainId);

      // const web3Provider = new Web3Provider(provider, "any");
      // loadContext(web3Provider, parseInt(chainId)).then(() =>
      //   console.info("Contracts LOADED")
      // );
    });

    provider.on("accountsChanged", async (accountChanged: string) => {
      console.info(
        "[PROVIDER] account changed to ",
        accountChanged,
        " : ",
        provider.selectedAddress
      );

      const existingWallet = account.wallets.find(
        (wallet: any) =>
          wallet.address.toLowerCase() === accountChanged[0].toLowerCase()
      );
      if (existingWallet) {
        const web3Provider = new Web3Provider(provider, "any");
        loadContext(web3Provider, true).then(() => {
          console.info("Contracts LOADED");
        });
      } else {
        // TODO: move to user modal
        console.log(
          "Please select correct account in metamask or add current one?"
        );
      }
    });
  };

  // Open wallet selection modal.
  const loadWeb3Modal = useCallback(async () => {
    const connectProvider = await web3Modal.connect();

    // TODO: move to user modal
    if (
      activeWallet.address &&
      connectProvider.selectedAddress.toLowerCase() ===
        activeWallet.address.toLowerCase()
    ) {
      console.log("Wallet already selected");
      return;
    }

    await subscribeProvider(connectProvider);
    const web3Provider = new Web3Provider(connectProvider, "any");
    // @ts-ignore
    window.fWallet = web3Provider;
    loadContext(web3Provider).then(() => console.log("Contracts LOADED"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [web3Modal]);

  const logoutOfWeb3Modal = useCallback(
    async function () {
      await resetApp();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [web3Modal]
  );

  // TODO -> In current state introduces problems when using multiple wallets and lots of network switching
  // If autoLoad is enabled and the the wallet had been loaded before, load it automatically now.
  // useEffect(() => {
  //   if (autoLoad && !autoLoaded && web3Modal.cachedProvider) {
  //     loadWeb3Modal();
  //     setAutoLoaded(true);
  //   }
  // }, [autoLoad, autoLoaded, loadWeb3Modal, setAutoLoaded, web3Modal.cachedProvider]);

  return [loadWeb3Modal, logoutOfWeb3Modal];
}

export default useWeb3Modal;
