import { useEffect, useReducer } from "react";
import { useApolloClient } from "@apollo/client";
import useApiData from "./useApiData";
import { COINGECKO_BASEURL, COINGECKO_METHODS } from "./useCoingeckoApi";
import useTokenPrice from "./useTokenPrice";
import useAccount from "./useAccount";
import { fantomApiMethods } from "./useFantomApi";
import { hexToUnit } from "../utils/conversion";

const useAccountSnapshot = () => {
  const { account } = useAccount();
  const client = useApolloClient();
  const { tokenPrices } = useTokenPrice();
  const { apiData } = useApiData();

  const cgCoinMapping =
    apiData[COINGECKO_BASEURL + COINGECKO_METHODS.GET_COINS_LIST]?.response
      ?.data;

  const updateSnapshot = (state: any, action: any) => {
    if (action.type === "update") {
      return {
        ...state,
        [action.address]: action.snapshot,
      };
    }
    return state;
  };
  const [accountSnapshots, dispatch] = useReducer(updateSnapshot, {} as any);

  // Populate wallet-snapshot
  useEffect(() => {
    if (cgCoinMapping) {
      account.wallets.forEach((wallet: any) => {
        // Get AccountAssets and calculate value
        client
          .query({
            query: fantomApiMethods.getAssetsListForAccount(),
            variables: { owner: wallet.address },
          })
          .then((result) => {
            if (result?.data?.erc20Assets.length) {
              const assets = result?.data?.erc20Assets;
              const totalValue = assets.reduce(
                (accumulator: any, current: any) => {
                  const symbol = current.symbol.toLowerCase();

                  // Skip if no balance
                  if (current.balanceOf === "0x0") {
                    return accumulator;
                  }
                  // Skip if no available price info
                  if (!tokenPrices[symbol]) {
                    return accumulator;
                  }

                  const amountInUnit = hexToUnit(
                    current.balanceOf,
                    current.decimals
                  );
                  const eurValue = amountInUnit * tokenPrices[symbol].price.eur;
                  const usdValue = amountInUnit * tokenPrices[symbol].price.usd;
                  const cnyValue = amountInUnit * tokenPrices[symbol].price.cny;
                  const gbpValue = amountInUnit * tokenPrices[symbol].price.gbp;
                  const jpyValue = amountInUnit * tokenPrices[symbol].price.jpy;
                  const krwValue = amountInUnit * tokenPrices[symbol].price.krw;

                  return [
                    accumulator[0] + usdValue,
                    accumulator[1] + eurValue,
                    accumulator[2] + cnyValue,
                    accumulator[3] + gbpValue,
                    accumulator[4] + jpyValue,
                    accumulator[5] + krwValue,
                  ];
                },
                [0, 0, 0, 0, 0, 0]
              );

              dispatch({
                type: "update",
                address: wallet.address,
                snapshot: {
                  walletAssetValue: {
                    usd: totalValue[0],
                    eur: totalValue[1],
                    cny: totalValue[2],
                    gbp: totalValue[3],
                    jpy: totalValue[4],
                    krw: totalValue[5],
                  },
                },
              });
            }
          });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cgCoinMapping, tokenPrices]);

  return { accountSnapshots };
};

export default useAccountSnapshot;
