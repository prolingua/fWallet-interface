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
import { settings } from "cluster";

const AccountSnapshot: React.FC<any> = () => {
  const { getCoinsList, getPrice } = useCoingeckoApi();
  const { settings } = useSettings();
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
    if (cgCoinIdList.length && cgCoinMapping && settings.currency) {
      const allPricedTokens = cgCoinMapping.filter((coin: any) =>
        cgCoinIdList.includes(coin.id)
      );
      getPrice(cgCoinIdList, settings.currency).then((result) => {
        const tokenPrices = {} as any;
        allPricedTokens.forEach((token: any) => {
          tokenPrices[token.symbol] = {
            symbol: token.symbol,
            cgCode: token.id,
            price: {
              [settings.currency]: result?.data[token.id][settings.currency],
            },
          };
        });

        dispatchTokenPrices({ type: "setTokenPrices", tokens: tokenPrices });
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cgCoinIdList, settings.currency]);

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
