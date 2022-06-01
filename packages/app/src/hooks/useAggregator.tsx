import useOpenOceanApi, {
  OPENOCEAN_BASEURL,
  OPENOCEAN_METHODS,
} from "./useOpenOceanApi";
import useOrionProtocolSDK from "./useOrionProtocolSDK";
import { useEffect, useState } from "react";
import config from "../config/config";
// @ts-ignore
import { addresses } from "@f-wallet/contracts";
import useWalletProvider from "./useWalletProvider";
import useApiData from "./useApiData";
import useFantomNative from "./useFantomNative";
import { BigNumber } from "@ethersproject/bignumber";
import { unitToWei } from "../utils/conversion";

export type Aggregator = "OO" | "OP";

export interface SwapData {
  aggregator: Aggregator;
  inAmount: string; // in wei
  outAmount: string; // in wei
  estimatedGas: number;
  gasPrice: string;
  minOutAmount: string;
  minAmountIn?: string;
  path?: any;
}
const useAggregator = (aggregator: Aggregator) => {
  const { sendTx } = useFantomNative();
  const { walletContext } = useWalletProvider();
  const { apiData } = useApiData();
  const {
    getSwapQuote: getOOSwapQuote,
    getQuote: getOOQuote,
  } = useOpenOceanApi();
  const { getQuote: getOPQuote, orionUnit } = useOrionProtocolSDK();
  const [swapContractAddress, setSwapContractAddress] = useState(
    aggregator === "OO"
      ? addresses[parseInt(config.chainId)]["openOceanExchange"]
      : "0xDe2e56031bfce8c1dAe44AaE0b214CD85E6121DD"
  );

  const [allowance, setAllowance] = useState(BigNumber.from(0));
  const [slippage, setSlippage] = useState(1);
  const [inToken, setInToken] = useState(null);
  const [outToken, setOutToken] = useState(null);
  const [inTokenAmount, setInTokenAmount] = useState("1");
  const [quoteData, setQuoteData] = useState(null);
  const [swapQuoteData, setSwapQuoteData] = useState(null);
  const [swapTxFunc, setSwapTxFunc] = useState(null);

  useEffect(() => {
    setQuoteData(null);
    setSwapQuoteData(null);
    setSwapTxFunc(null);
  }, [aggregator]);

  useEffect(() => {
    if (inToken && outToken && parseFloat(inTokenAmount) > 0 && slippage > 0) {
      // Handle OO quoting
      if (aggregator === "OO") {
        // Get QuoteData // fast
        getOOQuote(inToken, outToken, inTokenAmount, slippage);
        //     .then(() =>
        //   setQuoteData({
        //     aggregator: "OO",
        //     ...apiData[OPENOCEAN_BASEURL + OPENOCEAN_METHODS.GET_QUOTE]
        //       ?.response?.data?.data,
        //   })
        // );

        getOOSwapQuote(
          inToken,
          outToken,
          inTokenAmount,
          slippage,
          walletContext.activeWallet.address
        );
        //     .then(() =>
        //   setSwapQuoteData({
        //     aggregator: "OO",
        //     ...apiData[OPENOCEAN_BASEURL + OPENOCEAN_METHODS.GET_SWAP_QUOTE]
        //       ?.response?.data?.data,
        //   })
        // );
      }
      // Handle OP quoting
      if (aggregator === "OP") {
        getOPQuote(inToken, outToken, inTokenAmount).then((result) => {
          if (result) {
            console.log(result);
            const swapData: SwapData = {
              aggregator: "OP",
              inAmount: unitToWei(
                result.amountIn.toString(),
                inToken.decimals
              ).toString(),
              outAmount: unitToWei(
                result.amountOut.toString(),
                outToken.decimals
              ).toString(),
              estimatedGas: 0,
              gasPrice: "0",
              minOutAmount: unitToWei(
                (result.amountOut * ((100 - slippage) / 100)).toString(),
                outToken.decimals
              ).toString(),
              minAmountIn: unitToWei(
                result.minAmountIn.toString(),
                inToken.decimals
              ).toString(),
              path: result.path,
            };

            setQuoteData(swapData);
            setSwapQuoteData(swapData);
          }
        });
        // do something
      }
    }
  }, [aggregator, inToken, outToken, inTokenAmount, allowance, slippage]);

  useEffect(() => {
    if (!swapQuoteData) {
      return;
    }
    if (aggregator === "OO") {
      setSwapTxFunc(() => () =>
        sendTx(
          swapQuoteData.to,
          Math.floor(swapQuoteData.estimatedGas * 1.5),
          +swapQuoteData.gasPrice * 2,
          swapQuoteData.data,
          swapQuoteData.inToken.address ===
            "0x0000000000000000000000000000000000000000"
            ? swapQuoteData.value
            : null
        )
      );
    }
    if (aggregator === "OP") {
      // console.log(inToken.symbol);
      // console.log(outToken.symbol);
      // console.log(inTokenAmount);
      // console.log(walletContext.activeWallet.provider);
      console.log({
        type: "exactSpend",
        assetIn: inToken.symbol,
        assetOut: outToken.symbol,
        feeAsset: inToken.symbol,
        amount: inTokenAmount,
        slippagePercent: slippage,
        signer: walletContext.activeWallet.signer, // or signer when UI
        options: {
          // All options are optional 🙂
          poolOnly: inToken.symbol === "FTM", // You can specify whether you want to perform the exchange only through the pool
          logger: console.log,
          // Set it to true if you want the issues associated with
          // the lack of allowance to be automatically corrected
          autoApprove: true,
        },
      });
      setSwapTxFunc(() => () =>
        orionUnit.exchange.swapMarket({
          type: "exactSpend",
          assetIn: inToken.symbol,
          assetOut: outToken.symbol,
          feeAsset: inToken.symbol,
          amount: inTokenAmount,
          slippagePercent: slippage,
          signer: walletContext.activeWallet.signer, // or signer when UI
          options: {
            // All options are optional 🙂
            poolOnly: inToken.symbol === "FTM", // You can specify whether you want to perform the exchange only through the pool
            logger: console.log,
            // Set it to true if you want the issues associated with
            // the lack of allowance to be automatically corrected
            autoApprove: true,
          },
        })
      );
    }
  }, [swapQuoteData]);

  // OO specifics
  const OOQuoteData = apiData[OPENOCEAN_BASEURL + OPENOCEAN_METHODS.GET_QUOTE];
  const OOSwapQuoteData =
    apiData[OPENOCEAN_BASEURL + OPENOCEAN_METHODS.GET_SWAP_QUOTE];

  // Handle OO API DATA
  useEffect(() => {
    const responseData =
      apiData[OPENOCEAN_BASEURL + OPENOCEAN_METHODS.GET_QUOTE]?.response?.data
        ?.data;
    if (responseData) {
      setQuoteData({
        aggregator: "OO",
        ...responseData,
      });
    }
  }, [OOQuoteData]);
  useEffect(() => {
    const responseData =
      apiData[OPENOCEAN_BASEURL + OPENOCEAN_METHODS.GET_SWAP_QUOTE]?.response
        ?.data?.data;
    if (responseData) {
      setSwapQuoteData({
        aggregator: "OO",
        ...responseData,
      });
    }
  }, [OOSwapQuoteData]);

  return {
    quoteData,
    swapQuoteData,
    swapContractAddress,
    swapTxFunc,
    inToken,
    setInToken,
    outToken,
    setOutToken,
    inTokenAmount,
    setInTokenAmount,
    allowance,
    setAllowance,
    slippage,
    setSlippage,
  };
};

export default useAggregator;
