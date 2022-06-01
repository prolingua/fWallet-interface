import React, { useContext, useEffect, useState } from "react";
import { ThemeContext } from "styled-components";
import { BigNumber } from "@ethersproject/bignumber";
import Column from "../../components/Column";
import Spacer from "../../components/Spacer";
import { getAccountAssets, getAccountBalance } from "../../utils/account";
import {
  Button,
  ContentBox,
  Heading3,
  OverlayButton,
  Typo1,
  Typo2,
  Typo3,
} from "../../components";
import Row from "../../components/Row";
import InputError from "../../components/InputError";
import useOpenOceanApi, {
  OOToken,
  OPENOCEAN_BASEURL,
  OPENOCEAN_METHODS,
} from "../../hooks/useOpenOceanApi";
import useApiData from "../../hooks/useApiData";
import walletSymbol from "../../assets/img/symbols/wallet.svg";
import FormattedValue from "../../components/FormattedBalance";
import InputCurrency from "../../components/InputCurrency";
import TokenSelectButton from "../../components/TokenSelectModal";
import useFantomApi, { FantomApiMethods } from "../../hooks/useFantomApi";
import useFantomApiData from "../../hooks/useFantomApiData";
import useWalletProvider from "../../hooks/useWalletProvider";
import {
  toFormattedBalance,
  unitToWei,
  weiToMaxUnit,
  weiToUnit,
} from "../../utils/conversion";
import SwapImg from "../../assets/img/symbols/Swap.svg";
import useFantomNative from "../../hooks/useFantomNative";
import useFantomERC20 from "../../hooks/useFantomERC20";
import config from "../../config/config";
// @ts-ignore
import { addresses } from "@f-wallet/contracts";
import useSendTransaction from "../../hooks/useSendTransaction";
import useCoingeckoApi, {
  COINGECKO_BASEURL,
  COINGECKO_METHODS,
} from "../../hooks/useCoingeckoApi";
import Chart from "../../components/Chart";
import { formatDate } from "../../utils/common";
import FadeInOut from "../../components/AnimationFade";
import useDetectResolutionType from "../../hooks/useDetectResolutionType";
import openoceanImg from "../../assets/img/icons/openocean.svg";
import orionprotocolImg from "../../assets/img/icons/orionprotocol.svg";
import ErrorBoundary from "../../components/ErrorBoundary";

import { simpleFetch } from "@orionprotocol/sdk";
import { CategorySwitch } from "../Governance/Governance";
import useOrionProtocolSDK from "../../hooks/useOrionProtocolSDK";
import useAggregator from "../../hooks/useAggregator";
import InputInteger from "../../components/InputInteger/InputInteger";

const SwapTokenInput: React.FC<any> = ({
  inputValue,
  setInputValue,
  token,
  setToken,
  tokenList,
  title = "Amount",
  disableMaximum,
  disabledInput,
  refetchTimer,
  min,
}) => {
  const { color } = useContext(ThemeContext);
  const { getTokenBalance } = useFantomERC20();
  const { getBalance } = useFantomNative();
  const [error, setError] = useState(null);
  const [tokenBalance, setTokenBalance] = useState(BigNumber.from(0));
  const [formattedTokenBalance, setFormattedTokenBalance] = useState<any>([
    "0",
    "0",
  ]);
  const [maximum, setMaximum] = useState(null);
  const handleSetMax = () => {
    setError(null);
    setInputValue(
      weiToMaxUnit(
        tokenBalance
          .sub(
            BigNumber.from(10).pow(
              token.address === "0x0000000000000000000000000000000000000000"
                ? token.decimals
                : 1
            )
          )
          .toString(),
        token.decimals
      )
    );
  };
  const handleTokenChange = (token: any) => {
    setError(null);
    setToken(token);
  };

  useEffect(() => {
    if (token) {
      setTokenBalance(BigNumber.from(token.balanceOf));
      setFormattedTokenBalance(
        toFormattedBalance(
          weiToUnit(BigNumber.from(token.balanceOf), token.decimals)
        )
      );
      if (!disableMaximum) {
        setMaximum(weiToMaxUnit(token.balanceOf, token.decimals));
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  useEffect(() => {
    if (token) {
      if (token.address === "0x0000000000000000000000000000000000000000") {
        return getBalance().then((balance: any) => {
          setFormattedTokenBalance(toFormattedBalance(weiToUnit(balance)));
        });
      }
      return getTokenBalance(token.address).then((tokenBalance) =>
        setFormattedTokenBalance(
          toFormattedBalance(weiToUnit(tokenBalance, token.decimals))
        )
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, refetchTimer]);

  useEffect(() => {
    if (!min && error && error.includes("Minimum of")) {
      return setError(null);
    }
    if (min && inputValue >= min && error === `Minimum of ${min} required`) {
      return setError(null);
    }
    if (min && inputValue < min) {
      return setError(`Minimum of ${min} required`);
    }
  }, [inputValue, min]);

  return (
    <Column>
      <Row style={{ position: "relative", justifyContent: "space-between" }}>
        <Typo2 style={{ color: color.greys.grey() }}>{title}</Typo2>
        <Row>
          <img alt="" src={walletSymbol} />
          <Spacer size="xs" />
          <FormattedValue
            formattedValue={formattedTokenBalance}
            tokenSymbol={token.symbol}
            color={color.greys.grey()}
            fontSize="16px"
          />
        </Row>
      </Row>
      <Spacer size="xs" />
      <Row
        style={{
          backgroundColor: "#202F49",
          borderRadius: "8px",
          height: "64px",
          alignItems: "center",
        }}
      >
        <Spacer />
        <InputCurrency
          disabled={disabledInput}
          value={inputValue}
          max={maximum}
          handleValue={setInputValue}
          handleError={setError}
          token={token}
        />
        <Row style={{ flex: 1, alignItems: "center" }}>
          <Spacer />
          {!disabledInput && (
            <Button
              fontSize="14px"
              color={color.greys.grey()}
              padding="8px"
              style={{ flex: 1 }}
              variant="tertiary"
              onClick={handleSetMax}
            >
              {token.address === "0x0000000000000000000000000000000000000000"
                ? "MAX"
                : "MAX"}
            </Button>
          )}
          <Spacer />
          <TokenSelectButton
            currentToken={token}
            ftmBalance={BigNumber.from(tokenBalance)}
            assets={tokenList}
            setTokenSelected={handleTokenChange}
            includeNative={false}
          />
          <Spacer />
        </Row>
      </Row>
      <Spacer size="xs" />
      {error ? <InputError error={error} /> : <Spacer size="lg" />}
    </Column>
  );
};

const SwapTokensContent: React.FC<any> = ({
  tokenList,
  setActiveTokens,
  setSwapRoute,
  refetchTimer,
  aggregator,
}) => {
  const { color } = useContext(ThemeContext);
  const { getAllowance, approve } = useFantomERC20();
  const {
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
  } = useAggregator(aggregator);
  const { getPrice } = useCoingeckoApi();
  const { apiData } = useApiData();
  const [outTokenAmount, setOutTokenAmount] = useState("");
  const [estimatedGas, setEstimatedGas] = useState(null);
  const [priceImpact, setPriceImpact] = useState(null);
  const [minReceived, setMinReceived] = useState(null);
  const [minInAmount, setMinInAmount] = useState(0);

  const hasAllowance = () => {
    if (inToken?.decimals) {
      if (inToken.address === "0x0000000000000000000000000000000000000000") {
        if (isApproveCompleted) {
          resetApproveTx();
        }

        return true;
      }
      if (allowance.eq(0)) {
        return false;
      }
      return allowance.gte(unitToWei(inTokenAmount, inToken.decimals));
    }
    return false;
  };

  const {
    sendTx: handleApprove,
    isPending: isApprovePending,
    isCompleted: isApproveCompleted,
    reset: resetApproveTx,
  } = useSendTransaction(() =>
    approve(
      inToken.address,
      swapContractAddress,
      unitToWei(inTokenAmount, inToken.decimals).toString()
    )
  );

  const {
    sendTx: handleSwap,
    isPending: isSwapPending,
    isCompleted: isSwapCompleted,
    reset: resetSwapTx,
  } = useSendTransaction(swapTxFunc);

  const handleSwapInOut = () => {
    setInTokenAmount("1");
    setOutTokenAmount("");
    setEstimatedGas(null);
    setMinReceived(null);
    setPriceImpact(null);
    setMinInAmount(0);
    setInToken(outToken);
    setOutToken(inToken);
  };

  useEffect(() => {
    if (tokenList) {
      setInToken(tokenList.find((token: OOToken) => token.symbol === "FTM"));
      setOutToken(tokenList.find((token: OOToken) => token.symbol === "USDC"));
    }
  }, [tokenList]);

  useEffect(() => {
    if (inToken && outToken) {
      setActiveTokens([inToken, outToken]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inToken, outToken]);

  useEffect(() => {
    setOutTokenAmount("");
    setMinReceived(null);
    setPriceImpact(null);
    setMinInAmount(0);
    if (inTokenAmount === "") {
      setEstimatedGas(null);
    }
  }, [inTokenAmount, aggregator]);

  useEffect(() => {
    if (inToken) {
      setInTokenAmount("1");
      setOutTokenAmount("");
    }
  }, [inToken]);

  useEffect(() => {
    let timeout: any;
    if (isSwapCompleted) {
      timeout = setTimeout(() => {
        setInTokenAmount("1");
        setOutTokenAmount("");
        resetSwapTx();
      }, 2000);
    }
    return () => clearTimeout(timeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSwapCompleted]);

  const tokenPriceData =
    apiData[COINGECKO_BASEURL + COINGECKO_METHODS.GET_PRICE + "-swap"]?.response
      ?.data;

  useEffect(() => {
    if (inToken && outToken && parseFloat(inTokenAmount) > 0) {
      if (inToken.address === "0x0000000000000000000000000000000000000000") {
        return;
      }
      getAllowance(inToken.address, swapContractAddress).then((result) => {
        setAllowance(result);
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inToken, outToken, inTokenAmount, isApproveCompleted, refetchTimer]);

  // Fetch price data from CoinGecko
  useEffect(() => {
    if (inToken && outToken && swapQuoteData && parseFloat(inTokenAmount) > 0) {
      getPrice([inToken.code, outToken.code], "usd", "swap");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inToken, outToken]);

  useEffect(() => {
    if (swapQuoteData && outToken?.decimals && parseFloat(inTokenAmount) > 0) {
      // Only update if the data fetched is still representative
      if (
        parseFloat(inTokenAmount).toFixed(4) ===
        parseFloat(
          weiToUnit(
            BigNumber.from(swapQuoteData.inAmount),
            inToken.decimals
          ).toString()
        ).toFixed(4)
      ) {
        if (
          swapQuoteData.minOutAmount > 0 &&
          swapQuoteData.aggregator === aggregator
        ) {
          setMinReceived(
            weiToUnit(
              BigNumber.from(swapQuoteData.minOutAmount),
              outToken.decimals
            ).toString()
          );
          setEstimatedGas(
            weiToUnit(
              BigNumber.from(swapQuoteData.estimatedGas).mul(
                BigNumber.from(swapQuoteData.gasPrice)
              )
            ).toString()
          );
        }
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [swapQuoteData]);

  useEffect(() => {
    if (quoteData && outToken?.decimals && parseFloat(inTokenAmount) > 0) {
      if (
        aggregator === "OO" &&
        parseFloat(inTokenAmount).toFixed(4) ===
          parseFloat(quoteData.inAmount).toFixed(4)
      ) {
        setOutTokenAmount(quoteData.outAmount);
        setSwapRoute(quoteData.path);
      }
      if (aggregator === "OP" && quoteData.aggregator === aggregator) {
        if (parseFloat(quoteData?.outAmount) > 0) {
          setOutTokenAmount(
            weiToUnit(
              BigNumber.from(quoteData.outAmount),
              outToken.decimals
            ).toString()
          );
        }

        setMinInAmount(
          weiToUnit(BigNumber.from(quoteData.minAmountIn), inToken.decimals)
        );
        setSwapRoute(quoteData.path);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [quoteData]);

  useEffect(() => {
    if (
      swapQuoteData &&
      tokenPriceData &&
      parseFloat(inTokenAmount) > 0 &&
      parseFloat(outTokenAmount) > 0
    ) {
      const inTokenAmount = weiToUnit(
        BigNumber.from(swapQuoteData.inAmount),
        inToken.decimals
      );
      const outTokenAmount = weiToUnit(
        BigNumber.from(swapQuoteData.outAmount),
        outToken.decimals
      );

      const inTokenPrice = tokenPriceData[inToken.code]["usd"];
      const outTokenPrice = tokenPriceData[outToken.code]["usd"];
      const priceImpact =
        (inTokenAmount * inTokenPrice - outTokenAmount * outTokenPrice) /
        (inTokenAmount * inTokenPrice);

      setPriceImpact(priceImpact * 100);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [swapQuoteData, tokenPriceData]);

  return (
    <ContentBox>
      <Column>
        <Row style={{ justifyContent: "space-between" }}>
          <div
            style={{
              fontSize: "20px",
              fontWeight: "bold",
              color: color.greys.grey(),
            }}
          >
            Swap Tokens
          </div>
          <div
            style={{
              borderRadius: "34px",
              backgroundColor: color.primary.black(),
            }}
          >
            <Row style={{ justifyContent: "space-between", gap: "1rem" }}>
              <Typo3
                style={{ color: "#67748B", padding: ".5rem 0 .5rem 1rem" }}
              >
                {aggregator === "OO"
                  ? "Powered by OpenOcean"
                  : "Powered by OrionProtocol"}
              </Typo3>
              <img
                style={{ width: "33px", height: "33px", zIndex: 1 }}
                alt="aggregator"
                src={aggregator === "OO" ? openoceanImg : orionprotocolImg}
              />
            </Row>
          </div>
        </Row>
        <Spacer size="lg" />
        {inToken && (
          <SwapTokenInput
            inputValue={inTokenAmount}
            setInputValue={setInTokenAmount}
            tokenList={tokenList}
            setToken={setInToken}
            token={inToken}
            title={"Pay"}
            refetchTimer={refetchTimer}
            disabledInput={isSwapPending || isSwapCompleted}
            min={minInAmount}
          />
        )}
        <Spacer size="lg" />
        <Row style={{ justifyContent: "center", alignItems: "center" }}>
          <div
            style={{ height: "1px", width: "100%", backgroundColor: "#67748B" }}
          />
          <OverlayButton style={{ padding: 0 }} onClick={handleSwapInOut}>
            <Row
              style={{
                alignItems: "center",
                justifyContent: "center",
                height: "64px",
                width: "64px",
                border: "1px solid #67748B",
                borderRadius: "50%",
              }}
            >
              <img alt="swap" style={{ height: "20px" }} src={SwapImg} />
            </Row>
          </OverlayButton>
          <div
            style={{ height: "1px", width: "100%", backgroundColor: "#67748B" }}
          />
        </Row>
        <Spacer size="lg" />
        <Spacer />
        {outToken && (
          <SwapTokenInput
            inputValue={outTokenAmount}
            setInputValue={setOutTokenAmount}
            disabledInput={true}
            tokenList={tokenList}
            setToken={setOutToken}
            token={outToken}
            title={"Receive"}
            refetchTimer={refetchTimer}
          />
        )}
        {hasAllowance() ? (
          <>
            <Row style={{ justifyContent: "end" }}>
              <InputInteger
                title="Slippage"
                value={slippage}
                setValue={setSlippage}
                min={0.1}
                max={5}
                valueName="%"
                type="minimal"
                setError={() => console.log}
              />
            </Row>
            <Spacer />
            <Button
              variant="primary"
              onClick={handleSwap}
              disabled={isSwapPending || isSwapCompleted || !minReceived}
            >
              {isSwapPending
                ? "Swapping..."
                : isSwapCompleted
                ? "Swap successful"
                : !minReceived
                ? "Fetching best price..."
                : "Swap"}
            </Button>
          </>
        ) : (
          <>
            <Spacer size="lg" />
            <Button
              variant="primary"
              onClick={handleApprove}
              disabled={isApproveCompleted || isApprovePending}
            >
              {isApprovePending
                ? "Approving..."
                : isApproveCompleted
                ? "Approved!"
                : "Approve"}
            </Button>
          </>
        )}
        {/*{tx && tx.error ? (*/}
        {/*  <>*/}
        {/*    <Spacer size="xs" />*/}
        {/*    <Row style={{ justifyContent: "center" }}>*/}
        {/*      <InputError fontSize="18px" error={tx.error.message} />*/}
        {/*    </Row>*/}
        {/*    <Spacer />*/}
        {/*  </>*/}
        {/*) : (*/}
        {/*  <>*/}
        {/*    <Spacer />*/}
        {/*    <Spacer />*/}
        {/*  </>*/}
        {/*)}*/}
        <Spacer size="xxl" />
        <ContentBox style={{ backgroundColor: "#202f49" }}>
          <Column style={{ width: "100%", gap: "1rem" }}>
            <Typo2
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <div>Estimated cost</div>
              {estimatedGas ? (
                <FormattedValue
                  formattedValue={toFormattedBalance(estimatedGas.toString())}
                  tokenSymbol={"FTM"}
                />
              ) : (
                "-"
              )}
            </Typo2>
            <Typo2
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <div>Price impact</div>
              {priceImpact ? (
                <FormattedValue
                  formattedValue={toFormattedBalance(priceImpact.toString())}
                  tokenSymbol={"%"}
                />
              ) : (
                "-"
              )}
            </Typo2>
            <Typo2
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
              }}
            >
              <div>Minimum received</div>
              {minReceived ? (
                <FormattedValue
                  formattedValue={toFormattedBalance(minReceived.toString())}
                  tokenSymbol={outToken.symbol}
                />
              ) : (
                "-"
              )}
            </Typo2>
          </Column>
        </ContentBox>
      </Column>
    </ContentBox>
  );
};

const TokenChart: React.FC<any> = ({ activeTokens, refetchTimer, width }) => {
  const { getMarketHistory } = useCoingeckoApi();
  const { apiData } = useApiData();
  const [interval, setInterval] = useState("15m");
  const [chartData, setChartData] = useState(null);
  const [pricePoint, setPricePoint] = useState(null);
  const [priceTime, setPriceTime] = useState(null);

  const handleCrosshairData = (data: any[]) => {
    setPricePoint(data[1] ? data[1] : chartData[chartData.length - 1].value);
    setPriceTime(data[0] ? data[0] : chartData[chartData.length - 1].time);
  };

  const inTokenChartData =
    apiData[
      COINGECKO_BASEURL +
        COINGECKO_METHODS.GET_MARKET_CHART +
        `/${activeTokens[0].code}/market_chart`
    ]?.response?.data;
  const outTokenChartData =
    apiData[
      COINGECKO_BASEURL +
        COINGECKO_METHODS.GET_MARKET_CHART +
        `/${activeTokens[1].code}/market_chart`
    ]?.response?.data;

  const intervalToDays = {
    "5m": 1,
    "15m": 3,
    "30m": 7,
    "1h": 14,
    "1d": 30,
  } as any;

  useEffect(() => {
    if (activeTokens[0].code !== "null" && activeTokens[1].code !== "null") {
      getMarketHistory(activeTokens[0].code, intervalToDays[interval], "usd");
      getMarketHistory(activeTokens[1].code, intervalToDays[interval], "usd");
      return;
    }
    setChartData(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTokens, interval, refetchTimer]);

  useEffect(() => {
    if (inTokenChartData && outTokenChartData) {
      const inReversed = inTokenChartData.prices.reverse();
      const outReversed = outTokenChartData.prices.reverse();

      const graphDataReversed = inReversed.map(
        (dataPoint: any[], index: number) => {
          if (outReversed.length > index) {
            return {
              time: parseInt((dataPoint[0] / 1000).toString()),
              value: dataPoint[1] / outReversed[index][1],
            };
          }
          return null;
        }
      );
      const graphData = graphDataReversed
        .filter((data: any) => data !== null)
        .reverse();

      setChartData(graphData);
      setPricePoint(graphData[graphData.length - 1].value);
      setPriceTime(graphData[graphData.length - 1].time);
    }
  }, [inTokenChartData, outTokenChartData]);

  useEffect(() => {
    if (!chartData) {
      setPricePoint(null);
      setPriceTime(null);
    }
  }, [chartData]);

  return (
    <Column>
      <Row style={{ justifyContent: "space-between" }}>
        <Column>
          <Row>
            <img
              alt=""
              style={{ height: "40px", width: "40px", zIndex: 2 }}
              src={activeTokens[0].icon}
            />
            <img
              alt=""
              src={activeTokens[1].icon}
              style={{ height: "40px", width: "40px", marginLeft: "-.5rem" }}
            />
            <Spacer />
            {activeTokens[0].symbol}
            <Spacer size="xs" />
            /
            <Spacer size="xs" />
            {activeTokens[1].symbol}
          </Row>
          <Spacer size="sm" />
          <Row>
            {["5m", "15m", "30m", "1h", "1d"].map((selectInterval) => {
              return (
                <OverlayButton
                  key={`interval-${selectInterval}`}
                  onClick={() => setInterval(selectInterval)}
                >
                  <Typo1
                    style={{
                      fontWeight:
                        selectInterval === interval ? "bold" : "normal",
                    }}
                  >
                    {selectInterval}
                  </Typo1>
                </OverlayButton>
              );
            })}
          </Row>
        </Column>
        <Column style={{ alignItems: "end" }}>
          {pricePoint ? pricePoint.toFixed(6) : ""}
          <Spacer size="sm" />
          <Typo1>
            {priceTime ? formatDate(new Date(priceTime * 1000)) : ""}
          </Typo1>
        </Column>
      </Row>
      {chartData && (
        <div key={width + (chartData?.length || 0)}>
          <Chart data={chartData} handleCrossHairData={handleCrosshairData} />
        </div>
      )}
    </Column>
  );
};

const SwapRoute: React.FC<any> = ({
  aggregator,
  route,
  tokenList,
  activeTokens,
}) => {
  const RouteBoxOO = (part: any, first: boolean) => {
    const token = tokenList.find(
      (token: any) =>
        token.address.toLowerCase() ===
        (first ? part.from.toLowerCase() : part.to.toLowerCase())
    );
    return (
      <ContentBox
        key={`route-column-${part.parts}-${part.dexes[0].dex}-${token.symbol}`}
        style={{ padding: ".5rem", width: "150px" }}
      >
        <Row style={{ alignItems: "center" }}>
          <img
            alt=""
            style={{ height: "32px", width: "32px" }}
            src={token?.icon}
          />
          <Spacer size="sm" />
          <Column>
            <Typo3 style={{ fontWeight: "bold" }}>{token.symbol}</Typo3>
            <Typo3>{part.dexes[0].dex}</Typo3>
          </Column>
        </Row>
      </ContentBox>
    );
  };

  const RouteBoxOP = (symbol: string) => {
    const token = tokenList.find(
      (token: any) => token.symbol.toLowerCase() === symbol.toLowerCase()
    );
    return (
      <ContentBox
        key={`route-column-${symbol}`}
        style={{ padding: ".5rem", width: "150px" }}
      >
        <Row
          style={{
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
          }}
        >
          <img
            alt=""
            style={{ height: "32px", width: "32px" }}
            src={token?.icon}
          />
        </Row>
      </ContentBox>
    );
  };

  return (
    <Column style={{ width: "100%" }}>
      <Heading3>Routing</Heading3>
      <Spacer size="xs" />
      <Row style={{ justifyContent: "space-between", alignItems: "center" }}>
        <Row style={{ alignItems: "center" }}>
          <img
            alt=""
            style={{ height: "40px", width: "40px" }}
            src={activeTokens[0].icon}
          />
          <Spacer size="sm" />
          <div
            style={{ width: "1px", height: "30px", backgroundColor: "#232F46" }}
          />
        </Row>
        <Column style={{ gap: ".2rem" }}>
          {aggregator === "OO" &&
            route?.routes?.map((routePart: any) => {
              return (
                <Row
                  key={`route-row-${routePart.parts}`}
                  style={{
                    gap: ".2rem",
                    flexWrap: "wrap",
                    justifyContent: "center",
                  }}
                >
                  {routePart.subRoutes.map(
                    (subRoutePart: any, index: number) => {
                      return RouteBoxOO(subRoutePart, index === 0);
                    }
                  )}
                </Row>
              );
            })}
          {aggregator === "OP" && route?.length && (
            <Row>
              {route?.map((symbol: string) => {
                return RouteBoxOP(symbol);
              })}
            </Row>
          )}
        </Column>
        <Row style={{ alignItems: "center" }}>
          <div
            style={{ width: "1px", height: "30px", backgroundColor: "#232F46" }}
          />
          <Spacer size="sm" />
          <img
            alt=""
            style={{ height: "40px", width: "40px" }}
            src={activeTokens[1].icon}
          />
        </Row>
      </Row>
    </Column>
  );
};

const Swap: React.FC<any> = () => {
  const { getTokenBalance } = useFantomERC20();
  const { getTokenList } = useOpenOceanApi();
  const { walletContext } = useWalletProvider();
  const { apiData: fantomApiData } = useFantomApiData();
  const { width } = useDetectResolutionType();
  const { apiData } = useApiData();
  const [tokenList, setTokenList] = useState(null);
  const [switchTokenList, setSwitchTokenList] = useState([]);
  const [activeTokens, setActiveTokens] = useState([
    {
      address: "0x0000000000000000000000000000000000000000",
      code: "fantom",
      decimals: 18,
      icon:
        "https://ethapi.openocean.finance/logos/fantom/0x0000000000000000000000000000000000000000.png",
      symbol: "FTM",
    },
    {
      address: "0x04068da6c83afcfa0e13ba15a6696662335d5b75",
      code: "usd-coin",
      decimals: 6,
      icon:
        "https://ethapi.openocean.finance/logos/fantom/0x04068da6c83afcfa0e13ba15a6696662335d5b75.png",
      symbol: "USDC",
    },
  ]);
  const [swapRoute, setSwapRoute] = useState(null);
  const [refetchTimer, setRefetchTimer] = useState(0);
  const [aggregator, setAggregator] = useState("OO");
  const activeAddress = walletContext.activeWallet.address
    ? walletContext.activeWallet.address.toLowerCase()
    : null;

  useFantomApi(
    FantomApiMethods.getAssetsListForAccount,
    {
      owner: activeAddress,
    },
    activeAddress
    // 5000
  );
  useFantomApi(
    FantomApiMethods.getAccountBalance,
    {
      address: activeAddress,
    },
    activeAddress
    // 5000
  );

  const assetsListData = fantomApiData[
    FantomApiMethods.getAssetsListForAccount
  ].get(activeAddress)?.data;
  const accountFantomBalanceData = fantomApiData[
    FantomApiMethods.getAccountBalance
  ].get(activeAddress)?.data;
  const OOTokenListData =
    apiData[OPENOCEAN_BASEURL + OPENOCEAN_METHODS.GET_TOKENLIST]?.response?.data
      ?.data;

  useEffect(() => {
    let interval: any;
    let times = 0;
    if (!interval) {
      interval = setInterval(() => {
        times += 1;
        setRefetchTimer(times);
      }, 30000);
    }

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    getTokenList();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (assetsListData && OOTokenListData && accountFantomBalanceData) {
      const fantomBalance = getAccountBalance(accountFantomBalanceData);
      const accountAssets = getAccountAssets(assetsListData);
      setTokenList(
        OOTokenListData.map((OOToken: OOToken) => {
          const accountToken = accountAssets.find(
            (token) =>
              token.address.toLowerCase() === OOToken.address.toLowerCase()
          );
          return {
            ...OOToken,
            balanceOf:
              OOToken.address === "0x0000000000000000000000000000000000000000"
                ? fantomBalance
                : accountToken
                ? accountToken.balanceOf
                : "0x0",
            logoURL: OOToken.icon,
          };
        })
      );
    }
  }, [assetsListData, OOTokenListData, accountFantomBalanceData, aggregator]);

  //https://api.coingecko.com/api/v3/coins/beethoven-x/market_chart?vs_currency=usd&days=60
  //https://api.coingecko.com/api/v3/coins/beethoven-x/market-chart?vs_currency=usd&days=1

  // Integrate ORION
  const { orionUnit } = useOrionProtocolSDK();
  const { orionBlockchain, orionAggregator } = orionUnit;

  useEffect(() => {
    if (!tokenList) {
      return;
    }

    const fetchPairsPromise = simpleFetch(orionAggregator.getPairsList)();
    const fetchChainInfoPromise = simpleFetch(orionBlockchain.getInfo)();
    const fetchOrnBalancePromise = getTokenBalance(
      "0xd2cdcb6bdee6f78de7988a6a60d13f6ef0b576d9"
    );

    Promise.all([
      fetchPairsPromise,
      fetchChainInfoPromise,
      fetchOrnBalancePromise,
    ]).then(([pairs, info, ornBalance]) => {
      if (aggregator === "OO") {
        return setSwitchTokenList(tokenList);
      }

      const allTokens = pairs.flatMap((pair: string) => {
        return pair.split("-");
      });
      const uniqueTokens = [...new Set(allTokens)];

      // TODO migrate to own tokenlist instead of using OO and mutating
      const OOTokenSymbol = (token: string) => {
        if (token === "USDT") {
          return "fUSDT";
        }
        if (token === "ETH") {
          return "WETH";
        }
        return token;
      };

      const swapTokenList = uniqueTokens.map((token) => {
        let OOToken = tokenList.find(
          (ooToken: any) =>
            ooToken.symbol.toLowerCase() === OOTokenSymbol(token).toLowerCase()
        );

        if (!OOToken) {
          if (token === "ORN") {
            // getTokenBalance(info.assetToAddress[token]).then((balance) => {
            OOToken = {
              code: "orion-protocol",
              logoURL:
                "https://assets.coingecko.com/coins/images/11841/small/orion_logo.png?1594943318",
              balanceOf: ornBalance,
            };
            // });
          } else {
            console.warn(`[Swap][Orion] OOToken not found for ${token}`);
            return null;
          }
        }

        return {
          address: info.assetToAddress[token],
          code: OOToken.code,
          balanceOf: OOToken.balanceOf,
          decimals: info.assetToDecimals[token],
          logoURL: OOToken.logoURL,
          icon: OOToken.logoURL,
          name: token,
          symbol: token,
        };
      });

      setSwitchTokenList(swapTokenList);
    });
  }, [tokenList, aggregator]);

  useEffect(() => {
    setSwapRoute(null);
  }, [aggregator]);

  return (
    <ErrorBoundary name="[Swap]">
      <FadeInOut>
        <CategorySwitch
          categories={["OO", "OP"]}
          activeCategory={aggregator}
          setActiveCategory={setAggregator}
        />
        <Row
          style={{
            gap: "2rem",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <SwapTokensContent
            tokenList={switchTokenList}
            setActiveTokens={setActiveTokens}
            setSwapRoute={setSwapRoute}
            refetchTimer={refetchTimer}
            aggregator={aggregator}
          />
          <Column style={{ flex: 2, minWidth: "500px" }}>
            <FadeInOut>
              <TokenChart
                width={width}
                activeTokens={activeTokens}
                refetchTimer={refetchTimer}
              />
              <Spacer />
              <SwapRoute
                route={swapRoute}
                tokenList={tokenList}
                activeTokens={activeTokens}
                aggregator={aggregator}
              />
            </FadeInOut>
          </Column>
        </Row>
        <Spacer />
      </FadeInOut>
    </ErrorBoundary>
  );
};

export default Swap;
