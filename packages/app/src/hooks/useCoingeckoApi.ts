import useRestApi from "./useRestApi";

export const COINGECKO_BASEURL = "https://api.coingecko.com/api/v3";

export enum COINGECKO_METHODS {
  GET_PRICE = "/simple/price",
  GET_MARKET_CHART = "/coins",
  GET_COINS_LIST = "/coins/list",
}

const useCoingeckoApi = () => {
  const { get } = useRestApi(COINGECKO_BASEURL);

  const getPrice = (
    tokens: string[],
    currency:
      | "usd"
      | "eur"
      | "cny"
      | "gbp"
      | "jpy"
      | "krw"
      | "aud"
      | "cad"
      | "chf"
      | "aed" = "usd",
    slug?: string
  ) => {
    return get({
      path: COINGECKO_METHODS.GET_PRICE,
      queryParams: [
        ["vs_currencies", currency],
        ["ids", tokens.join(",")],
      ],
    });
  };

  const getMarketHistory = (
    code: string,
    days = 3,
    currency: "usd" | "eur" = "usd"
  ) => {
    return get({
      path: COINGECKO_METHODS.GET_MARKET_CHART,
      params: [code, "market_chart"],
      queryParams: [
        ["vs_currency", currency],
        ["days", days],
      ],
    });
  };

  const getCoinsList = () => {
    return get({
      path: COINGECKO_METHODS.GET_COINS_LIST,
    });
  };

  const getCoinInfo = (code: string) => {
    return get({
      path: COINGECKO_METHODS.GET_MARKET_CHART,
      params: [code],
      queryParams: [
        ["localization", false],
        ["tickers", false],
        ["market_data", false],
        ["community_data", false],
        ["developer_data", false],
        ["sparkline", false],
      ],
    });
  };

  return {
    getPrice,
    getMarketHistory,
    getCoinsList,
    getCoinInfo,
  };
};

export default useCoingeckoApi;
