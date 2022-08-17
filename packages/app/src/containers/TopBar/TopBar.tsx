import React, { useEffect, useState } from "react";

import useSettings from "../../hooks/useSettings";
import { Header } from "../../components";
import CurrencySelector from "../../components/CurrencySelector";
import Spacer from "../../components/Spacer";
import WalletSelector from "../../components/WalletSelector";
import useNotify from "../../hooks/useNotify";
import useCoingeckoApi, {
  COINGECKO_BASEURL,
  COINGECKO_METHODS,
} from "../../hooks/useCoingeckoApi";
import useFantomApi, { FantomApiMethods } from "../../hooks/useFantomApi";
import useApiData from "../../hooks/useApiData";
import useFantomApiData from "../../hooks/useFantomApiData";
import useTokenPrice from "../../hooks/useTokenPrice";
import { Item, Row } from "../../components/Grid/Grid";

const AccountSnapshot: React.FC<any> = () => {
  const { getCoinsList, getPrice } = useCoingeckoApi();
  const { apiData: fantomApiData } = useFantomApiData();
  const { apiData } = useApiData();
  const ftmTokenList =
    fantomApiData[FantomApiMethods.getTokenList]?.data?.erc20TokenList;
  const cgCoinMapping =
    apiData[COINGECKO_BASEURL + COINGECKO_METHODS.GET_COINS_LIST]?.response
      ?.data;
  const [cgCoinIdList, setCgCoinIdList] = useState([]);
  const { dispatchTokenPrices } = useTokenPrice();

  useFantomApi(FantomApiMethods.getTokenList, null);
  useEffect(() => {
    getCoinsList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (cgCoinMapping && ftmTokenList) {
      const ids = ftmTokenList
        .map((token: any) => {
          const coin = cgCoinMapping.find(
            (coin: any) =>
              token.symbol.toLowerCase() === coin.symbol.toLowerCase()
          );
          return coin?.id;
        })
        .filter((result: any) => result);

      setCgCoinIdList(ids);
    }
  }, [cgCoinMapping, ftmTokenList]);

  useEffect(() => {
    if (cgCoinIdList.length && cgCoinMapping) {
      const getPricePromises = [
        getPrice(cgCoinIdList, "usd"),
        getPrice(cgCoinIdList, "eur"),
        getPrice(cgCoinIdList, "cny"),
        getPrice(cgCoinIdList, "gbp"),
        getPrice(cgCoinIdList, "jpy"),
        getPrice(cgCoinIdList, "krw"),
        getPrice(cgCoinIdList, "aud"),
        getPrice(cgCoinIdList, "cad"),
        getPrice(cgCoinIdList, "chf"),
        getPrice(cgCoinIdList, "aed"),
      ];
      const allPricedTokens = cgCoinMapping.filter((coin: any) =>
        cgCoinIdList.includes(coin.id)
      );
      Promise.all(getPricePromises).then(
        ([usd, eur, cny, gbp, jpy, krw, aud, cad, chf, aed]) => {
          const tokenPrices = {} as any;
          allPricedTokens.forEach((token: any) => {
            tokenPrices[token.symbol] = {
              symbol: token.symbol,
              cgCode: token.id,
              price: {
                eur: eur?.data[token.id]?.eur,
                usd: usd?.data[token.id]?.usd,
                cny: cny?.data[token.id]?.cny,
                gbp: gbp?.data[token.id]?.gbp,
                jpy: jpy?.data[token.id]?.jpy,
                krw: krw?.data[token.id]?.krw,
                aud: aud?.data[token.id]?.aud,
                cad: cad?.data[token.id]?.cad,
                chf: chf?.data[token.id]?.chf,
                aed: aed?.data[token.id]?.aed,
              },
            };
          });

          dispatchTokenPrices({ type: "setTokenPrices", tokens: tokenPrices });
        }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cgCoinIdList]);

  return <></>;
};

const TopBar: React.FC<any> = () => {
  const { settings, dispatchSettings } = useSettings();
  useNotify();

  // const { t, i18n } = useTranslation("common");
  return (
    <Header>
      <Row>
        <AccountSnapshot />
        {/*<Row style={{ alignItems: "center" }}>*/}
        {/*  {t("welcome.title", { framework: "FWallet" })}*/}
        {/*</Row>*/}
        {/*<Spacer />*/}
        {/*<LanguageSelector*/}
        {/*  width="180px"*/}
        {/*  current={settings.language}*/}
        {/*  dispatch={dispatchSettings}*/}
        {/*  i18n={i18n}*/}
        {/*/>*/}
      </Row>
      <Row>
        <Item collapseLTE="xs">
          <>
            <CurrencySelector
              width="140px"
              current={settings.currency}
              dispatch={dispatchSettings}
            />
            <Spacer size="xs" />
          </>
        </Item>
        <WalletSelector width="200px" />
      </Row>
    </Header>
  );
};

export default TopBar;
