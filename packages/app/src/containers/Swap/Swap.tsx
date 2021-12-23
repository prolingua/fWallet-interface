import React, { useContext, useEffect, useState } from "react";
import { ThemeContext } from "styled-components";
import { BigNumber } from "@ethersproject/bignumber";
import Column from "../../components/Column";
import Spacer from "../../components/Spacer";
import { getAccountAssets, getAccountBalance } from "../../utils/account";
import { Button, ContentBox, OverlayButton, Typo2 } from "../../components";
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
import { MaxUint256 } from "@ethersproject/constants";
import SwapImg from "../../assets/img/symbols/Swap.svg";
import useFantomNative from "../../hooks/useFantomNative";
import useFantomERC20 from "../../hooks/useFantomERC20";
import config from "../../config/config";
// @ts-ignore
import { addresses } from "@f-wallet/contracts";
import useSendTransaction from "../../hooks/useSendTransaction";

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
  const [maximum, setMaximum] = useState(weiToMaxUnit(MaxUint256.toString()));
  const handleSetMax = () => {
    setError(null);
    setInputValue(weiToMaxUnit(tokenBalance.toString(), token.decimals));
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
        setMaximum(weiToUnit(BigNumber.from(token.balanceOf), token.decimals));
      }
    }
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
  }, [token, refetchTimer]);

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
              MAX
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

const SwapTokensContent: React.FC<any> = ({ tokenList }) => {
  const { color } = useContext(ThemeContext);
  const { walletContext } = useWalletProvider();
  const { sendTx } = useFantomNative();
  const { getAllowance, approve } = useFantomERC20();
  const { getSwapQuote } = useOpenOceanApi();
  const { apiData } = useApiData();
  const OOQuoteData =
    apiData[OPENOCEAN_BASEURL + OPENOCEAN_METHODS.GET_SWAP_QUOTE]?.response
      ?.data?.data;

  const [inToken, setInToken] = useState(null);
  const [outToken, setOutToken] = useState(null);
  const [inTokenAmount, setInTokenAmount] = useState("");
  const [outTokenAmount, setOutTokenAmount] = useState("");
  const [estimatedGas, setEstimatedGas] = useState(null);
  const [priceImpact, setPriceImpact] = useState(null);
  const [minReceived, setMinReceived] = useState(null);
  const [allowance, setAllowance] = useState(BigNumber.from(0));
  const [refetchTimer, setRefetchTimer] = useState(0);

  const hasAllowance = (value: BigNumber) => {
    if (inToken?.decimals) {
      if (inToken.address === "0x0000000000000000000000000000000000000000") {
        if (isApproveCompleted) {
          resetApproveTx();
        }
        return true;
      }
      return value.gte(unitToWei(inTokenAmount, inToken.decimals));
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
      addresses[parseInt(config.chainId)]["openOceanExchange"],
      unitToWei(inTokenAmount, inToken.decimals).toString()
    )
  );

  const {
    sendTx: handleSwap,
    isPending: isSwapPending,
    isCompleted: isSwapCompleted,
    reset: resetSwapTx,
  } = useSendTransaction(() =>
    sendTx(
      OOQuoteData.to,
      Math.floor(OOQuoteData.estimatedGas * 1.5),
      +OOQuoteData.gasPrice * 2,
      OOQuoteData.data,
      OOQuoteData.inToken.address ===
        "0x0000000000000000000000000000000000000000"
        ? OOQuoteData.value
        : null
    )
  );

  const handleSwapInOut = () => {
    setInTokenAmount("");
    setOutTokenAmount("");
    setEstimatedGas(null);
    setMinReceived(null);
    setPriceImpact(null);
    setInToken(outToken);
    setOutToken(inToken);
  };

  useEffect(() => {
    let interval: any;
    let times = 0;
    if (!interval) {
      interval = setInterval(() => {
        console.log(times);
        times += 1;
        setRefetchTimer(times);
      }, 5000);
    }

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (tokenList) {
      setInToken(tokenList.find((token: OOToken) => token.symbol === "FTM"));
      setOutToken(tokenList.find((token: OOToken) => token.symbol === "USDC"));
    }
  }, [tokenList]);

  useEffect(() => {
    if (inTokenAmount === "") {
      setOutTokenAmount("");
    }
  }, [inTokenAmount]);

  useEffect(() => {
    if (inToken) {
      setInTokenAmount("");
      setOutTokenAmount("");
    }
  }, [inToken]);

  useEffect(() => {
    let timeout: any;
    if (isSwapCompleted) {
      timeout = setTimeout(() => {
        setInTokenAmount("");
        setOutTokenAmount("");
        resetSwapTx();
      }, 2000);
    }
    return () => clearTimeout(timeout);
  }, [isSwapCompleted]);

  useEffect(() => {
    if (inToken && outToken && parseFloat(inTokenAmount) > 0) {
      getSwapQuote(
        inToken,
        outToken,
        parseFloat(inTokenAmount),
        2,
        walletContext.activeWallet.address
      );
    }
  }, [inToken, outToken, inTokenAmount, refetchTimer]);

  useEffect(() => {
    if (inToken && outToken && parseFloat(inTokenAmount) > 0) {
      if (inToken.address === "0x0000000000000000000000000000000000000000") {
        return;
      }
      getAllowance(
        inToken.address,
        addresses[parseInt(config.chainId)]["openOceanExchange"]
      ).then((result) => {
        setAllowance(result);
      });
    }
  }, [inToken, outToken, inTokenAmount, isApproveCompleted, refetchTimer]);

  useEffect(() => {
    if (OOQuoteData && outToken?.decimals && parseFloat(inTokenAmount) > 0) {
      setOutTokenAmount(
        weiToUnit(
          BigNumber.from(OOQuoteData.outAmount),
          outToken.decimals
        ).toString()
      );

      setMinReceived(
        weiToUnit(
          BigNumber.from(OOQuoteData.minOutAmount),
          outToken.decimals
        ).toString()
      );
      setEstimatedGas(
        weiToUnit(
          BigNumber.from(OOQuoteData.estimatedGas).mul(
            BigNumber.from(OOQuoteData.gasPrice)
          )
        ).toString()
      );
    }
  }, [OOQuoteData]);

  return (
    <Column style={{ width: "100%" }}>
      <div
        style={{
          fontSize: "20px",
          fontWeight: "bold",
          color: color.greys.grey(),
        }}
      >
        Swap Tokens
      </div>
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
      <Spacer size="lg" />
      <Spacer />
      {hasAllowance(allowance) ? (
        <Button
          variant="primary"
          onClick={handleSwap}
          disabled={isSwapPending || isSwapCompleted}
        >
          {isSwapPending
            ? "Swapping..."
            : isSwapCompleted
            ? "Swap successful"
            : "Swap"}
        </Button>
      ) : (
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
      <ContentBox>
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
              <FormattedValue formattedValue={["0", ".0"]} tokenSymbol={"%"} />
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
  );
};

const Swap: React.FC<any> = () => {
  const { getTokenList } = useOpenOceanApi();
  const { walletContext } = useWalletProvider();
  const { apiData: fantomApiData } = useFantomApiData();
  const { apiData } = useApiData();
  const [tokenList, setTokenList] = useState(null);
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
    getTokenList();
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
  }, [assetsListData, OOTokenListData, accountFantomBalanceData]);

  return (
    <div>
      <SwapTokensContent tokenList={tokenList} />
    </div>
  );
};

export default Swap;
