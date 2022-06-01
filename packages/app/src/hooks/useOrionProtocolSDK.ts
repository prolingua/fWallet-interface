import { simpleFetch, OrionUnit } from "@orionprotocol/sdk";

export const ORION_PROTOCOL = "https://open-api.openocean.finance/v1/cross";

export enum ORION_PROTOCOL_METHODS {
  GET_TOKENLIST = "/tokenList",
  GET_QUOTE = "/quote",
  GET_SWAP_QUOTE = "/swap_quote",
}

export type OOToken = {
  symbol: string;
  name: string;
  address: string;
  decimals: number;
  icon: string;
};

const useOrionProtocolSDK = () => {
  const orionUnit = new OrionUnit("250", "production");
  // const { orionBlockchain, orionAggregator, provider, chainId } = orionUnit;
  const getQuote = (inToken: any, outToken: any, amount: string) => {
    return simpleFetch(orionUnit.orionAggregator.getSwapInfo)(
      "exactSpend",
      inToken.symbol,
      outToken.symbol,
      amount,
      ["ORION_POOL"]
    );
    // .then((result) => console.log({ result }));
    // return new Promise((resolve) => ({
    //   id: "b41bf886-5bd7-4e3b-855c-3cbe831bde6c",
    //   assetIn: "FTM",
    //   amountIn: 40.0,
    //   assetOut: "USDC",
    //   amountOut: 16.0,
    //   price: 0.4029165,
    //   marketAmountOut: 16.0,
    //   marketAmountIn: null,
    //   marketPrice: 0.4029165,
    //   minAmountIn: 30.0,
    //   minAmountOut: 12.0,
    //   availableAmountIn: 40.0,
    //   availableAmountOut: null,
    //   path: ["FTM", "USDT", "USDC"],
    //   isThroughPoolOptimal: false,
    //   orderInfo: {
    //     assetPair: "FTM-USDC",
    //     side: "SELL",
    //     amount: 40.0,
    //     safePrice: 0.4013,
    //   },
    //   executionInfo:
    //     "BINANCE: FTM -> USDT -> USDC (length = 2): 40.0 FTM -> 16.0 USDC, market amount out = 16.0 USDC, price = 0.4029165 USDC/FTM (order SELL 40.0 @ 0.4029 (safe price 0.4013) on FTM-USDC), available amount in = 40.0 FTM, steps: {[1]: 40.0 FTM -> 16.136 USDT, price = 0.4034 USDT/FTM, passed amount in = 40.0 FTM, amount out = cost of SELL on FTM-USDT order by min price = 0.4034 USDT/FTM (sell by amount), avgWeighedPrice = 0.4034 USDT/FTM, cost by avgWeighedPrice = 16.136 USDT, executed sell amount = 40.0 FTM, [2]: 16.136 USDT -> 16.0 USDC, price = 0.99880143 USDC/USDT, passed amount in = 16.136 USDT, amount out = amount of BUY on USDC-USDT order by max price = 1.0012 USDT/USDC (buy by cost), avgWeighedPrice = 1.0012 USDT/USDC, amount by avgWeighedPrice = 16.0 USDC, executed buy cost = 16.136 USDT}",
    // }));
  };

  //example return {"id":"b41bf886-5bd7-4e3b-855c-3cbe831bde6c","assetIn":"FTM","amountIn":40.0,"assetOut":"USDC","amountOut":16.0,"price":0.4029165,"marketAmountOut":16.0,"marketAmountIn":null,"marketPrice":0.4029165,"minAmountIn":30.0,"minAmountOut":12.0,"availableAmountIn":40.0,"availableAmountOut":null,"path":["FTM","USDT","USDC"],"isThroughPoolOptimal":false,"orderInfo":{"assetPair":"FTM-USDC","side":"SELL","amount":40.0,"safePrice":0.4013},"executionInfo":"BINANCE: FTM -> USDT -> USDC (length = 2): 40.0 FTM -> 16.0 USDC, market amount out = 16.0 USDC, price = 0.4029165 USDC/FTM (order SELL 40.0 @ 0.4029 (safe price 0.4013) on FTM-USDC), available amount in = 40.0 FTM, steps: {[1]: 40.0 FTM -> 16.136 USDT, price = 0.4034 USDT/FTM, passed amount in = 40.0 FTM, amount out = cost of SELL on FTM-USDT order by min price = 0.4034 USDT/FTM (sell by amount), avgWeighedPrice = 0.4034 USDT/FTM, cost by avgWeighedPrice = 16.136 USDT, executed sell amount = 40.0 FTM, [2]: 16.136 USDT -> 16.0 USDC, price = 0.99880143 USDC/USDT, passed amount in = 16.136 USDT, amount out = amount of BUY on USDC-USDT order by max price = 1.0012 USDT/USDC (buy by cost), avgWeighedPrice = 1.0012 USDT/USDC, amount by avgWeighedPrice = 16.0 USDC, executed buy cost = 16.136 USDT}"}

  // const getSwapQuote = (
  //   inToken: OOToken,
  //   outToken: OOToken,
  //   amount: string,
  //   slippage: number,
  //   account: string
  // ) => {
  //   return get({
  //     path: OPENOCEAN_METHODS.GET_SWAP_QUOTE,
  //     queryParams: [
  //       ["inTokenSymbol", inToken.symbol],
  //       ["inTokenAddress", inToken.address],
  //       ["in_token_decimals", inToken.decimals],
  //       ["outTokenSymbol", outToken.symbol],
  //       ["outTokenAddress", outToken.address],
  //       ["out_token_decimals", outToken.decimals],
  //       ["amount", amount],
  //       ["gasPrice", 100],
  //       ["slippage", slippage],
  //       ["exChange", "openoceanv2"],
  //       ["chainId", 250],
  //       ["account", account],
  //       ["withRoute", "routes"],
  //       ["referrer", "0x1551c797c53d459c39baeafe79fe7a3a6592022c"],
  //     ],
  //   });
  // };

  return {
    orionUnit,
    getQuote,
  };
};

export default useOrionProtocolSDK;
