import {
  GET_ACCOUNT_TRANSACTION_HISTORY,
  DELEGATIONS_BY_ADDRESS,
  ERC20_ASSETS,
  ERC20_TOKEN_LIST_AND_BALANCE,
  FMINT_ACCOUNT_BY_ADDRESS,
  GET_GAS_PRICE,
  GET_TOKEN_PRICE,
  GET_ACCOUNT_BALANCE,
} from "../graphql/subgraph";
import { useQuery } from "@apollo/react-hooks";
import { useEffect } from "react";
import useFantomApiData from "./useFantomApiData";
import useWalletProvider from "./useWalletProvider";

export enum FantomApiMethods {
  getAccountBalance = "getAccountBalance",
  getAccountTransactionHistory = "getAccountTransactionHistory",
  getTokenPrice = "getTokenPrice",
  getGasPrice = "getGasPrice",
  getFMintForAccount = "getFMintForAccount",
  getDelegationsForAccount = "getDelegationsForAccount",
  getTokenListForAccount = "getTokenListForAccount",
  getAssetsListForAccount = "getAssetsListForAccount",
}
const methods: { [key in FantomApiMethods]: any } = {
  [FantomApiMethods.getAccountBalance]: GET_ACCOUNT_BALANCE,
  [FantomApiMethods.getAccountTransactionHistory]: GET_ACCOUNT_TRANSACTION_HISTORY,
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
  fromAddress?: string,
  pollInterval?: number
) => {
  const { walletContext } = useWalletProvider();
  const { dispatchApiData } = useFantomApiData();

  const createOptions = () => {
    if (!variables && !pollInterval) return null;

    //TODO polling is not working.. useQuery known bug.
    const options = {} as any;
    if (variables) options.variables = variables;
    if (pollInterval) {
      options.pollInterval = pollInterval;
      options.fetchPolicy = "network-only";
    }
    return options;
  };

  const { loading, error, data, refetch } = useQuery(
    methods[request],
    createOptions()
  );

  useEffect(() => {
    if (!walletContext.activeWallet.address) {
      return;
    }

    if (request && data) {
      dispatchApiData({
        type: "success",
        address: fromAddress,
        method: request,
        refetch,
        data,
      });
    }
    if (request && error) {
      dispatchApiData({
        type: "error",
        address: fromAddress,
        method: request,
        refetch,
        error,
      });
    }
    if (request && loading) {
      dispatchApiData({
        type: "loading",
        address: fromAddress,
        method: request,
      });
    }
  }, [loading, error, data, request, walletContext.activeWallet.address]);
};

export default useFantomApi;
