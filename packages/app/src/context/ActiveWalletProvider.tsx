import React, { useReducer } from "react";
import { JsonRpcProvider } from "@ethersproject/providers";
import config from "../config/config.test";
// "https://bsc-dataseed1.binance.org:443"
const initial = {
  account: null,
  chainId: null,
  contracts: new Map([]),
  provider: new JsonRpcProvider(config.rpc),
  signer: null,
} as any;
export const ActiveWalletContext = React.createContext(null);

export const ActiveWalletProvider: React.FC = ({ children }) => {
  const activeWalletReducer = (state: any, action: any) => {
    switch (action.type) {
      case "setActiveWallet":
        const newState = {
          provider: action.provider,
          address: action.account,
          chainId: action.chainId,
          contracts: action.contracts,
          signer: action.signer,
        };
        // @ts-ignore
        window.fWallet = newState;
        return newState;
      case "reset":
        const initialState = {
          ...initial,
        };
        // @ts-ignore
        window.fWallet = initialState;
        return initialState;
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
