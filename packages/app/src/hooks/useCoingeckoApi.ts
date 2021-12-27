import useRestApi from "./useRestApi";

export const COINGECKO_BASEURL = "https://api.coingecko.com/api/v3";

export enum COINGECKO_METHODS {
  GET_PRICE = "/simple/price",
}

const useOpenOceanApi = () => {
  const { get } = useRestApi(COINGECKO_BASEURL);

  const getPrice = (currency: "usd" | "eur", tokens: string[]) => {
    return get({
      path: COINGECKO_METHODS.GET_PRICE,
      queryParams: [
        ["vs_currencies", currency],
        ["ids", tokens.join(",")],
      ],
    });
  };

  return {
    getPrice,
  };
};

export default useOpenOceanApi;
