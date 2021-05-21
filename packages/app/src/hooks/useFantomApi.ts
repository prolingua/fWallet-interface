import {
  ACCOUNT_BY_ADDRESS,
  GET_GAS_PRICE,
  GET_TOKEN_PRICE,
} from "../graphql/subgraph";
import { useQuery } from "@apollo/react-hooks";
import { useEffect } from "react";
import useFantomApiData from "./useFantomApiData";

export enum FantomApiMethods {
  getAccount = "getAccount",
  getTokenPrice = "getTokenPrice",
  getGasPrice = "getGasPrice",
}
const methods: { [key in FantomApiMethods]: any } = {
  [FantomApiMethods.getAccount]: ACCOUNT_BY_ADDRESS,
  [FantomApiMethods.getTokenPrice]: GET_TOKEN_PRICE,
  [FantomApiMethods.getGasPrice]: GET_GAS_PRICE,
};

const useFantomApi = (request: FantomApiMethods, variables: any) => {
  const { dispatchApiData } = useFantomApiData();
  const { loading, error, data } = useQuery(methods[request], { variables });
  console.log(loading);
  useEffect(() => {
    if (request && data) {
      console.log(data);
      dispatchApiData({
        type: "success",
        method: request,
        data,
      });
    }
    if (request && error) {
      console.log(error);
      dispatchApiData({
        type: "error",
        method: request,
        error,
      });
    }
    if (request && loading) {
      console.log(loading);
      dispatchApiData({
        type: "loading",
        method: request,
      });
    }
  }, [loading, error, data, request]);
};

export default useFantomApi;
