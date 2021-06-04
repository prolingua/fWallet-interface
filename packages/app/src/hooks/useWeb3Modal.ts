import { useCallback } from "react";
import { Web3Provider } from "@ethersproject/providers";
import Web3Modal from "web3modal";
import useWalletProvider from "./useWalletProvider";
import useAccounts from "./useAccount";
import {
  createWalletContext,
  createWeb3Provider,
  isSameAddress,
} from "../utils/wallet";

// TODO clean up provider flow
function useWeb3Modal(config = {}) {
  const { walletContext, dispatchWalletContext } = useWalletProvider();
  const { dispatchAccount } = useAccounts();
  // const [autoLoaded, setAutoLoaded] = useState(false);
  // const {
  // autoLoad = true,
  // }: any = config;

  const web3Modal = new Web3Modal({
    cacheProvider: false,
    providerOptions: {},
    theme: "dark",
  });

  const loadAndDispatchContext = async (
    web3Provider: Web3Provider,
    existingAccount: boolean = false
  ) => {
    if (!web3Provider) {
      return;
    }

    const walletProvider = await createWalletContext(web3Provider);

    if (!existingAccount) {
      await dispatchAccount({
        type: "addWallet",
        wallet: { address: walletProvider.address, providerType: "metamask" },
      });
    }

    return dispatchWalletContext({
      type: "setActiveWallet",
      data: {
        ...walletProvider,
        providerType: "metamask",
      },
    });
  };

  const resetApp = async () => {
    walletContext.activeWallet.provider &&
      walletContext.activeWallet.provider.close &&
      (await walletContext.activeWallet.provider.close());

    await web3Modal.clearCachedProvider();
    await dispatchWalletContext({
      type: "reset",
    });
    window.location.reload();
  };

  const subscribeProvider = async (provider: any) => {
    if (!provider.on) {
      return;
    }

    provider.removeAllListeners();

    provider.on("chainChanged", async (chainId: string) => {
      console.info("[PROVIDER] chain changed to ", chainId);
      const web3Provider = createWeb3Provider(provider);
      const walletProvider = await createWalletContext(web3Provider);
      dispatchWalletContext({
        type: "web3ProviderChainChanged",
        data: {
          walletProvider: walletProvider,
        },
      });
    });

    provider.on("accountsChanged", async (accountChanged: string) => {
      console.info("[PROVIDER] account changed to ", accountChanged);

      const web3Provider = createWeb3Provider(provider);
      const walletProvider = await createWalletContext(web3Provider);
      dispatchWalletContext({
        type: "web3ProviderAccountChanged",
        data: {
          accountSelected: accountChanged[0],
          walletProvider: walletProvider,
        },
      });
    });
  };

  // Open wallet selection modal.
  const loadWeb3Modal = useCallback(async () => {
    const connectProvider = await web3Modal.connect();

    // TODO: move to user modal
    if (
      walletContext.activeWallet.address &&
      isSameAddress(
        walletContext.activeWallet.address,
        connectProvider.selectedAddress
      )
    ) {
      console.info("Wallet already connected");
      return;
    }

    await subscribeProvider(connectProvider);
    const web3Provider = createWeb3Provider(connectProvider);

    loadAndDispatchContext(web3Provider).then(() =>
      console.log("Contracts LOADED")
    );
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
