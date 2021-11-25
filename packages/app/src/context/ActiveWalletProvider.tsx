import React, { useReducer } from "react";
import { JsonRpcProvider } from "@ethersproject/providers";

import config from "../config/config";

export const ActiveWalletContext = React.createContext(null);
const initial = {
  activeWallet: {
    address: null,
    chainId: null,
    contracts: new Map([]),
    provider: new JsonRpcProvider(config.rpc),
    signer: null,
    providerType: null,
  },
  web3ProviderState: {
    accountSelected: null,
    chainSelected: null,
    walletProvider: null,
  },
} as any;

export const ActiveWalletProvider: React.FC = ({ children }) => {
  const activeWalletReducer = (state: any, action: any) => {
    switch (action.type) {
      case "setActiveWallet":
        return {
          activeWallet: action.data,
          web3ProviderState: {
            accountSelected:
              action.data.providerType === "metamask"
                ? action.data.address
                : state.metamaskAccountSelected,
            chainSelected:
              action.data.providerType === "metamask" && action.data.chainId,
          },
        };
      case "web3ProviderAccountChanged":
        return {
          ...state,
          web3ProviderState: {
            ...action.data,
            chainSelected: action.data.walletProvider.chainId,
          },
        };
      case "web3ProviderChainChanged":
        return {
          ...state,
          web3ProviderState: {
            ...action.data,
            chainSelected: action.data.walletProvider.chainId,
          },
        };

      case "reset":
        return initial;
      default:
        return state;
    }
  };

  const [state, dispatch] = useReducer(activeWalletReducer, initial);

  return (
    <ActiveWalletContext.Provider value={[state, dispatch]}>
      {children}
    </ActiveWalletContext.Provider>
  );
};
