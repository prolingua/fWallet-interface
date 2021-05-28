import {
  ACCOUNT_BY_ADDRESS,
  DELEGATIONS_BY_ADDRESS,
  ERC20_ASSETS,
  ERC20_TOKEN_LIST_AND_BALANCE,
  FMINT_ACCOUNT_BY_ADDRESS,
  GET_GAS_PRICE,
  GET_TOKEN_PRICE,
} from "../graphql/subgraph";
import { useQuery } from "@apollo/react-hooks";
import { useEffect } from "react";
import useFantomApiData from "./useFantomApiData";
import useWalletProvider from "./useWalletProvider";

export enum FantomApiMethods {
  getAccount = "getAccount",
  getTokenPrice = "getTokenPrice",
  getGasPrice = "getGasPrice",
  getFMintForAccount = "getFMintForAccount",
  getDelegationsForAccount = "getDelegationsForAccount",
  getTokenListForAccount = "getTokenListForAccount",
  getAssetsListForAccount = "getAssetsListForAccount",
}
const methods: { [key in FantomApiMethods]: any } = {
  [FantomApiMethods.getAccount]: ACCOUNT_BY_ADDRESS,
  [FantomApiMethods.getTokenPrice]: GET_TOKEN_PRICE,
  [FantomApiMethods.getGasPrice]: GET_GAS_PRICE,
  [FantomApiMethods.getDelegationsForAccount]: DELEGATIONS_BY_ADDRESS,
  [FantomApiMethods.getFMintForAccount]: FMINT_ACCOUNT_BY_ADDRESS,
  [FantomApiMethods.getTokenListForAccount]: ERC20_TOKEN_LIST_AND_BALANCE,
  [FantomApiMethods.getAssetsListForAccount]: ERC20_ASSETS,
};

const useFantomApi = (
  request: FantomApiMethods,
  variables?: any,
  address?: string
) => {
  const { walletContext } = useWalletProvider();
  const { dispatchApiData } = useFantomApiData();
  const { loading, error, data } = useQuery(
    methods[request],
    variables ? { variables } : null
  );

  useEffect(() => {
    if (!walletContext.activeWallet.address) {
      return;
    }

    if (request && data) {
      dispatchApiData({
        type: "success",
        address: address,
        method: request,
        data,
      });
    }
    if (request && error) {
      dispatchApiData({
        type: "error",
        address: address,
        method: request,
        error,
      });
    }
    if (request && loading) {
      dispatchApiData({
        type: "loading",
        address: address,
        method: request,
      });
    }
  }, [loading, error, data, request, walletContext.activeWallet.address]);
};

export default useFantomApi;
