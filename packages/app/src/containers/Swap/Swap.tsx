import React, { useContext, useEffect, useState } from "react";
import { ThemeContext } from "styled-components";
import { FANTOM_NATIVE, getTokenPrice } from "../../utils/common";
import useFantomNative from "../../hooks/useFantomNative";
import useFantomERC20 from "../../hooks/useFantomERC20";
import useTransaction from "../../hooks/useTransaction";
import {
  toCurrencySymbol,
  toFormattedBalance,
  unitToWei,
  weiToMaxUnit,
} from "../../utils/conversion";
import { BigNumber } from "@ethersproject/bignumber";
import useModal from "../../hooks/useModal";
import InfoModal from "../../components/InfoModal";
import Column from "../../components/Column";
import Spacer from "../../components/Spacer";
import AmountInputRow from "../Send/AmountInputRow";
import {
  getAccountAssetBalance,
  getAccountAssets,
  getAccountBalance,
} from "../../utils/account";
import InputAddress from "../../components/InputAddress";
import {
  Button,
  Heading1,
  OverlayButton,
  Typo1,
  Typo2,
} from "../../components";
import Row from "../../components/Row";
import backArrowSymbol from "../../assets/img/symbols/BackArrow.svg";
import InputError from "../../components/InputError";
import EstimatedFees from "../Send/EstimatedFees";
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

const SwapTokenInput: React.FC<any> = ({ token, setToken, tokenList }) => {
  const { color } = useContext(ThemeContext);
  const [inputValue, setInputValue] = useState(0);
  const [error, setError] = useState(null);
  const tokenBalance = 0;
  const formattedTokenBalance: any = ["0", "0"];

  const handleSetMax = () => {
    // setError(null);
    // setInputValue(weiToMaxUnit(tokenBalanceInWei, token.decimals).toString());
    console.log("MAX!!");
  };
  const handleTokenChange = (token: any) => {
    setError(null);
    setToken(token);
  };

  return (
    <Column>
      <Row style={{ position: "relative", justifyContent: "space-between" }}>
        <Typo2 style={{ color: color.greys.grey() }}>Amount</Typo2>
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
          value={inputValue}
          max={tokenBalance}
          handleValue={setInputValue}
          handleError={setError}
          token={token}
        />
        <Row style={{ flex: 1, alignItems: "center" }}>
          <Spacer />
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
          <Spacer />
          <TokenSelectButton
            currentToken={token}
            ftmBalance={BigNumber.from(tokenBalance)}
            assets={tokenList}
            setTokenSelected={handleTokenChange}
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

  const [inToken, setInToken] = useState(null);
  const [outToken, setOutToken] = useState(null);
  const [inTokenAmount, setInTokenAmount] = useState(0);

  useEffect(() => {
    if (tokenList) {
      console.log(tokenList);
      setInToken(tokenList.find((token: OOToken) => token.symbol === "FTM"));
      setOutToken(tokenList.find((token: OOToken) => token.symbol === "USDC"));
    }
  }, [tokenList]);

  return (
    <Column style={{ width: "100%", height: "620px" }}>
      <>
        <div
          style={{
            fontSize: "20px",
            fontWeight: "bold",
            color: color.greys.grey(),
          }}
        >
          Send Tokens
        </div>
        <Spacer size="lg" />
        {inToken && (
          <AmountInputRow
            accountBalance={0}
            accountAssets={tokenList}
            currency={"eur"}
            fantomPrice={0}
            initialInputValue={0}
            setAmountToSend={setInTokenAmount}
            setTokenSelected={setInToken}
            token={inToken}
          />
        )}
        <Spacer size="lg" />
        <Spacer />
        {/*<InputAddress*/}
        {/*  token={tokenSelected}*/}
        {/*  setReceiverAddress={setReceiverAddress}*/}
        {/*  initial={receiverAddress}*/}
        {/*/>*/}
        <Spacer size="lg" />
        <Spacer />
        {/*<Button*/}
        {/*  padding="17px"*/}
        {/*  disabled={!isValidTransaction}*/}
        {/*  variant="primary"*/}
        {/*  onClick={() => setReadyToSend(true)}*/}
        {/*>*/}
        {/*  Continue*/}
        {/*</Button>*/}
        <Spacer />
        <Spacer />
      </>
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
      {/*<EstimatedFees*/}
      {/*  currency={currency}*/}
      {/*  token={tokenSelected}*/}
      {/*  tokenPrice={tokenPrice}*/}
      {/*  gasPrice={gasPrice}*/}
      {/*  loading={loading}*/}
      {/*/>*/}
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
  );

  const assetsListData = fantomApiData[
    FantomApiMethods.getAssetsListForAccount
  ].get(activeAddress)?.data;
  const OOTokenListData =
    apiData[OPENOCEAN_BASEURL + OPENOCEAN_METHODS.GET_TOKENLIST]?.response?.data
      ?.data;

  console.log(OOTokenListData);
  console.log(assetsListData);
  useEffect(() => {
    getTokenList();
  }, []);
  useEffect(() => {
    if (assetsListData && OOTokenListData) {
      const accountAssets = getAccountAssets(assetsListData);
      setTokenList(
        OOTokenListData.map((OOToken: OOToken) => {
          const accountToken = accountAssets.find(
            (token) =>
              token.address.toLowerCase() === OOToken.address.toLowerCase()
          );
          return {
            ...OOToken,
            balanceOf: accountToken ? accountToken.balanceOf : "0x0",
            logoURL: OOToken.icon,
          };
        })
      );
    }
  }, [assetsListData, OOTokenListData]);

  return (
    <div>
      <SwapTokensContent tokenList={tokenList} />
    </div>
  );
};

export default Swap;
