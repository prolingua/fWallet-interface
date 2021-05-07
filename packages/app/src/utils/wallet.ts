import { Provider, Web3Provider } from "@ethersproject/providers";
import { Signer } from "@ethersproject/abstract-signer";

export const isSameAddress = (address1: string, address2: string): boolean => {
  if (!address1 || !address2) {
    return false;
  }
  return address1.toLowerCase() === address2.toLowerCase();
};

export const formatAddress = (address: string) => {
  return `${address.substr(0, 5)}..${address.substr(-3, 3)}`;
};

export const createWeb3Provider = (provider: any) => {
  return new Web3Provider(provider, "any");
};

export const createWalletContext = async (provider: Web3Provider) => {
  if (!provider) {
    console.error("provider missing");
    return;
  }
  const { chainId } = await provider.getNetwork();
  const accounts = await provider.listAccounts();
  const signer = provider.getSigner();
  const contracts = loadContracts(signer);

  return {
    contracts,
    chainId,
    address: accounts[0],
    provider,
    signer,
  };
};

export const loadContracts = async (signer: Signer) => {
  if (!signer) {
    return;
  }

  return new Map([
    // [
    //   "PPDEX",
    //   new Contract(
    //     addresses[chainId].tokens["PPDEX"],
    //     abis.ppdex,
    //     signer
    //   ),
    // ],
  ]);
};

// export const createWeb3Provider(provider)
