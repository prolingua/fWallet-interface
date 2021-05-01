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
export const WalletContext = React.createContext(null);

export const WalletProvider: React.FC = ({ children }) => {
  const walletReducer = (state: any, action: any) => {
    switch (action.type) {
      case "setContext":
        const newState = {
          provider: action.provider,
          account: action.account,
          chainId: action.chainId,
          contracts: action.contracts,
          signer: action.signer,
        };
        // @ts-ignore
        window.fWallet = newState;
        return newState;
      case "resetContext":
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

  const [state, dispatch] = useReducer(walletReducer, initial);

  return (
    <WalletContext.Provider value={[state, dispatch]}>
      {children}
    </WalletContext.Provider>
  );
};
