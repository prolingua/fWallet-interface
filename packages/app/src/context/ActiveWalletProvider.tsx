import React, { useReducer } from "react";
import { JsonRpcProvider } from "@ethersproject/providers";

import config from "../config/config.test";
import useAccount from "../hooks/useAccount";
import { isSameAddress } from "../utils/wallet";

export const ActiveWalletContext = React.createContext(null);
const initial = {
  address: null,
  chainId: null,
  contracts: new Map([]),
  provider: new JsonRpcProvider(config.rpc),
  signer: null,
  providerType: null,
} as any;

export const ActiveWalletProvider: React.FC = ({ children }) => {
  const { account } = useAccount();

  const activeWalletReducer = (state: any, action: any) => {
    switch (action.type) {
      case "setActiveWallet":
        return action.data;

      case "web3ProviderAccountChanged":
        const existingWallet = account.wallets.find((wallet: any) =>
          isSameAddress(wallet.address, action.data.address)
        );

        if (existingWallet && state.providerType === "metamask") {
          return action.data;
        }

        console.log(
          "Please select correct account in metamask or add current one?"
        );

        return state;

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
