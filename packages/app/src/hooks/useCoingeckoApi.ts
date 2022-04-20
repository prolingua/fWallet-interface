import useRestApi from "./useRestApi";

// export const COINGECKO_BASEURL = "https://pro-api.coingecko.com/api/v3";
export const COINGECKO_BASEURL = process.env.REACT_APP_CG_PROXY_API_URI;

// export enum COINGECKO_METHODS {
//   GET_PRICE = "/simple/price",
//   GET_MARKET_CHART = "/coins",
// }
export enum COINGECKO_METHODS {
  GET_PRICE = "/price",
  GET_MARKET_CHART = "/history",
}

const useCoingeckoApi = () => {
  const { get } = useRestApi(COINGECKO_BASEURL);

  const getPrice = (tokens: string[], currency: "usd" | "eur" = "usd") => {
    return get({
      path: COINGECKO_METHODS.GET_PRICE,
      queryParams: [
        ["vs_currencies", currency],
        ["ids", tokens.join(",")],
      ],
      headers: { "x-api-key": process.env.REACT_APP_PROXY_API_KEY },
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
      headers: { "x-api-key": process.env.REACT_APP_PROXY_API_KEY },
    });
  };

  return {
    getPrice,
    getMarketHistory,
  };
};

export default useCoingeckoApi;
