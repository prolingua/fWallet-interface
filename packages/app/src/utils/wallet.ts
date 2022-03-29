import { Web3Provider } from "@ethersproject/providers";
import { isAddress } from "@ethersproject/address";
import { Signer } from "@ethersproject/abstract-signer";
import { Contract } from "@ethersproject/contracts";

// @ts-ignore
import { addresses, abis } from "@f-wallet/contracts";
import config from "../config/config";

export const isValidAddress = (address: string): boolean => {
  return isAddress(address);
};

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
  const contracts = await loadContracts(signer, chainId);

  // TODO: remove
  // @ts-ignore
  window.fWallet = contracts;
  return {
    contracts,
    chainId,
    address: accounts[0],
    provider,
    signer,
  };
};

export const loadContracts = async (signer: Signer, chainId: number) => {
  if (!signer) {
    return;
  }

  if (chainId !== parseInt(config.chainId)) {
    return;
  }

  return new Map([
    ["sfc", new Contract(addresses[chainId]["sfc"], abis.sfc, signer)],
    [
      "stakeTokenizer",
      new Contract(
        addresses[chainId]["stakeTokenizer"],
        abis.stakeTokenizer,
        signer
      ),
    ],
    ["gov", new Contract(addresses[chainId]["gov"], abis.gov, signer)],
    [
      "govProposal",
      new Contract(addresses[chainId]["govProposal"], abis.govProposal, signer),
    ],
    [
      "govProposalPlaintext",
      new Contract(
        addresses[chainId]["govProposalPlaintext"],
        abis.govProposalPlaintext,
        signer
      ),
    ],
  ]);
};

export const loadERC20Contract = async (
  contractAddress: string,
  signer: Signer
) => {
  if (!signer) {
    return;
  }

  return new Contract(contractAddress, abis.erc20.abi, signer);
};

export const loadContract = async (
  contractAddress: string,
  abi: any,
  signer: Signer
) => {
  if (!signer) {
    return;
  }

  return new Contract(contractAddress, abi, signer);
};
