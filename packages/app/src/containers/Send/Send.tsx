import React, { useContext, useEffect, useState } from "react";
import {
  Button,
  ContentBox,
  OverlayButton,
  Typo1,
  Typo2,
} from "../../components";
import Column from "../../components/Column";
import Spacer from "../../components/Spacer";
import useFantomApiData from "../../hooks/useFantomApiData";
import useWalletProvider from "../../hooks/useWalletProvider";
import useSettings from "../../hooks/useSettings";
import useFantomApi, { FantomApiMethods } from "../../hooks/useFantomApi";
import styled, { ThemeContext } from "styled-components";
import Row from "../../components/Row";
import walletSymbol from "../../assets/img/symbols/wallet.svg";
import {
  getAccountAssetBalance,
  getAccountAssets,
  getAccountBalance,
} from "../../utils/account";
import { FANTOM_NATIVE, getTokenPrice } from "../../utils/common";
import {
  toCurrencySymbol,
  toFormattedBalance,
  unitToWei,
  weiToMaxUnit,
  weiToUnit,
} from "../../utils/conversion";

import ftmIcon from "../../assets/img/tokens/FTM.svg";
import backArrowSymbol from "../../assets/img/symbols/BackArrow.svg";
import vShape from "../../assets/img/shapes/vShape.png";
import { isValidAddress } from "../../utils/wallet";
import { useQuery } from "@apollo/react-hooks";
import { ERC20_ASSETS, GET_ACCOUNT_BALANCE } from "../../graphql/subgraph";
import { BigNumber } from "@ethersproject/bignumber";

const ErrorLine: React.FC<any> = ({ error }) => {
  return (
    <div
      style={{
        height: "32px",
        fontSize: "24px",
        color: "#F84239",
        paddingLeft: "1rem",
      }}
    >
      {error}
    </div>
  );
};
const AmountInput: React.FC<any> = ({
  accountBalance,
  accountAssets,
  fantomPrice,
  currency,
  token,
  setAmountToSend,
  initial,
}) => {
  const { color } = useContext(ThemeContext);
  const [amount, setAmount] = useState(
    initial ? weiToMaxUnit(initial.toString()).toString() : ""
  );
  const [value, setValue] = useState(null);
  const [error, setError] = useState(null);
  const isNative = token.symbol === "FTM";
  const tokenBalanceInWei = isNative ? accountBalance : token.balanceOf;
  const tokenBalance = weiToMaxUnit(tokenBalanceInWei, token.decimals);
  const formattedBalance = toFormattedBalance(tokenBalance);
  const formattedTotalValue = value && toFormattedBalance(value);

  const handleChange = (value: string) => {
    setError(null);
    if (value && !Number(value)) {
      if (value === "0") setAmount("0");
      if (value === "0.") setAmount("0.");
      return;
    }

    if (parseFloat(value) > tokenBalance) {
      setError("Insufficient funds");
      setAmount(value);
      return setAmountToSend(BigNumber.from(0));
    }
    setAmount(value);
    return setAmountToSend(unitToWei(value, token.decimals));
  };
  const handleSetMax = () => {
    handleChange(weiToMaxUnit(accountBalance, token.decimals).toString());
  };

  useEffect(() => {
    if (!amount) {
      return setValue(null);
    }
    setValue(parseFloat(amount) * fantomPrice);
  }, [amount, fantomPrice]);

  return (
    <Column>
      <Row style={{ position: "relative", justifyContent: "space-between" }}>
        <Typo2 style={{ color: color.greys.grey() }}>Amount</Typo2>
        <Row>
          <img alt="" src={walletSymbol} />
          <Spacer size="sm" />
          <Typo2 style={{ color: color.greys.grey() }}>
            {`${formattedBalance[0]}${
              formattedBalance[1] !== ".00" ? formattedBalance[1] : ""
            } ${token.symbol}`}
          </Typo2>
        </Row>
      </Row>
      <Spacer size="sm" />
      <Row
        style={{
          backgroundColor: "#202F49",
          borderRadius: "8px",
          height: "64px",
          alignItems: "center",
        }}
      >
        <Spacer />
        <StyledInput
          type="text"
          value={amount}
          onChange={(event) => handleChange(event.target.value)}
          placeholder="Enter an amount"
        />

        <Row style={{ flex: 1, alignItems: "center" }}>
          {formattedTotalValue?.length ? (
            <Typo2 style={{ flex: 4, color: color.greys.grey() }}>
              ~
              {`${toCurrencySymbol(currency)}${formattedTotalValue[0]}${
                formattedTotalValue[1] !== ".00" ? formattedTotalValue[1] : ""
              }`}
            </Typo2>
          ) : (
            <div style={{ flex: 4 }} />
          )}
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
          <Button style={{ flex: 2, padding: "10px" }} variant="secondary">
            <Row style={{ alignItems: "center" }}>
              <img
                alt=""
                src={token.symbol === "FTM" ? ftmIcon : token.logoURL}
              />
              <Spacer size="sm" />
              <Typo2>{token.symbol}</Typo2>
              <Spacer size="sm" />
              <Spacer size="xs" />
              <img alt="" src={vShape} />
            </Row>
          </Button>
          <Spacer />
        </Row>
      </Row>
      <Spacer size="sm" />
      {error ? <ErrorLine error={error} /> : <Spacer size="lg" />}
    </Column>
  );
};

const StyledInput = styled.input`
  flex: 1;
  background-color: transparent;
  border: none;
  color: white;
  font-size: 20px;
  font-weight: bold;

  :focus {
    outline: none;
  }
`;

const CounterAddressBalance: React.FC<any> = ({ address, token }) => {
  const { color } = useContext(ThemeContext);
  const isNative = token.symbol === "FTM";
  const { loading, error, data } = useQuery(
    isNative ? GET_ACCOUNT_BALANCE : ERC20_ASSETS,
    { variables: isNative ? { address } : { owner: address } }
  );
  const balance =
    data && isNative
      ? getAccountBalance(data)
      : getAccountAssetBalance(data, token.address);
  const formattedBalance = balance && toFormattedBalance(weiToUnit(balance));

  return (
    <Typo2 style={{ color: color.greys.grey() }}>
      {balance ? `${formattedBalance[0]}${formattedBalance[1]}` : "0"}
      {token.symbol}
    </Typo2>
  );
};
const AddressInput: React.FC<any> = ({
  token,
  setReceiverAddress,
  initial,
}) => {
  const { color } = useContext(ThemeContext);
  const [value, setValue] = useState(initial || "");
  const [error, setError] = useState(null);
  const [validAddress, setValidAddress] = useState(null);
  const onHandleBlur = (value: string) => {
    if (!value.length) {
      return;
    }
    if (!isValidAddress(value)) {
      setError("Invalid address");
    }
  };
  const onHandleChange = (value: string) => {
    setError(null);
    setValidAddress(null);
    setReceiverAddress(null);
    setValue(value);
    if ((value.length === 42 && !isValidAddress(value)) || value.length > 42) {
      return setError("Invalid address");
    }
    if (value.length === 42 && isValidAddress(value)) {
      setValidAddress(value);
      setReceiverAddress(value);
    }
  };

  return (
    <Column>
      <Row style={{ justifyContent: "space-between" }}>
        <Typo2 style={{ color: color.greys.grey() }}>To</Typo2>
        <Row>
          <img src={walletSymbol} />
          <Spacer size="sm" />
          {validAddress ? (
            <CounterAddressBalance address={validAddress} token={token} />
          ) : (
            <Typo2 style={{ color: color.greys.grey() }}>0 FTM</Typo2>
          )}
        </Row>
      </Row>
      <Spacer size="sm" />
      <Row
        style={{
          backgroundColor: "#202F49",
          borderRadius: "8px",
          height: "64px",
          alignItems: "center",
        }}
      >
        <Spacer />
        <StyledInput
          type="text"
          value={value}
          onChange={(event) => {
            onHandleChange(event.target.value);
          }}
          onBlur={(event) => onHandleBlur(event.target.value)}
          placeholder="Input a Fantom Opera address"
        />
      </Row>
      <Spacer size="sm" />
      {error ? <ErrorLine error={error} /> : <Spacer size="lg" />}
    </Column>
  );
};

const Estimated: React.FC<any> = ({ currency }) => {
  const { color } = useContext(ThemeContext);
  return (
    <Row style={{ justifyContent: "center" }}>
      <Column
        style={{
          width: "60%",
          backgroundColor: color.primary.black(),
          borderRadius: "8px",
          padding: "1rem",
        }}
      >
        <Typo2>Estimated Fees</Typo2>
        <Spacer size="sm" />
        <Typo2>Estimated Fees in {toCurrencySymbol(currency)}</Typo2>
      </Column>
    </Row>
  );
};

const SendTokensContent: React.FC<any> = ({
  accountData,
  assetsList,
  tokenPrice,
  currency,
}) => {
  const { color } = useContext(ThemeContext);
  const [amountToSend, setAmountToSend] = useState(null);
  const [receiverAddress, setReceiverAddress] = useState(null);
  const [isValidTransaction, setIsValidTransaction] = useState(false);
  const [readyToSend, setReadyToSend] = useState(false);
  const [tokenSelected, setTokenSelected] = useState(FANTOM_NATIVE);

  const formattedAmountToSend =
    amountToSend && toFormattedBalance(weiToMaxUnit(amountToSend));

  useEffect(() => {
    if (amountToSend && amountToSend.gt(BigNumber.from(0)) && receiverAddress) {
      return setIsValidTransaction(true);
    }
    return setIsValidTransaction(false);
  }, [amountToSend, receiverAddress]);
  console.log(amountToSend, receiverAddress);
  console.log({ isValidTransaction });
  return (
    <Column style={{ width: "100%", height: "620px" }}>
      {!readyToSend ? (
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
          <AmountInput
            accountBalance={getAccountBalance(accountData)}
            accountAssets={getAccountAssets(assetsList)}
            fantomPrice={getTokenPrice(tokenPrice)}
            currency={currency}
            token={tokenSelected}
            setAmountToSend={setAmountToSend}
            initial={amountToSend}
          />
          <Spacer size="lg" />
          <Spacer />
          <AddressInput
            token={tokenSelected}
            setReceiverAddress={setReceiverAddress}
            initial={receiverAddress}
          />
          <Spacer size="lg" />
          <Spacer />
          <Button
            padding="17px"
            disabled={!isValidTransaction}
            variant="primary"
            onClick={() => setReadyToSend(true)}
          >
            Continue
          </Button>
          <Spacer />
          <Spacer />
        </>
      ) : (
        <>
          <Row>
            <OverlayButton
              style={{ zIndex: 1 }}
              onClick={() => setReadyToSend(false)}
            >
              <img alt="" src={backArrowSymbol} />
            </OverlayButton>
            <Row
              style={{
                flex: 1,
                marginLeft: "-32px",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "20px",
                fontWeight: "bold",
                color: color.primary.semiWhite(),
              }}
            >
              You are sending
            </Row>
          </Row>
          <Spacer size="lg" />
          <Row
            style={{
              width: "100%",
              backgroundColor: color.primary.black(),
              borderRadius: "8px",
            }}
          >
            <Column style={{ padding: "2rem" }}>
              <div>{`${formattedAmountToSend[0]}${formattedAmountToSend[1]} ${tokenSelected.symbol}`}</div>
              <div>{`~${toCurrencySymbol(currency)}${(
                weiToMaxUnit(amountToSend) * getTokenPrice(tokenPrice)
              ).toFixed(2)}`}</div>
              <div>To {receiverAddress}</div>
            </Column>
          </Row>
        </>
      )}
      <Estimated currency={currency} />
    </Column>
  );
};

const SendTokens: React.FC<any> = ({
  loading,
  accountData,
  assetsList,
  tokenPrice,
  currency,
}) => {
  return (
    <ContentBox style={{ width: "610px" }}>
      {loading ? (
        <div>LOADING...</div>
      ) : (
        <SendTokensContent
          accountData={accountData.data}
          assetsList={assetsList.data}
          tokenPrice={tokenPrice.data}
          currency={currency}
        />
      )}
    </ContentBox>
  );
};

const Send: React.FC<any> = () => {
  const { apiData } = useFantomApiData();
  const { walletContext } = useWalletProvider();
  const { settings } = useSettings();
  const activeAddress = walletContext.activeWallet.address
    ? walletContext.activeWallet.address.toLowerCase()
    : null;

  const tokenPrice = apiData[FantomApiMethods.getTokenPrice];
  const accountData = apiData[FantomApiMethods.getAccountBalance].get(
    activeAddress
  );
  const assetsList = apiData[FantomApiMethods.getAssetsListForAccount].get(
    activeAddress
  );

  useFantomApi(
    FantomApiMethods.getAccountBalance,
    {
      address: activeAddress,
    },
    activeAddress
  );
  useFantomApi(FantomApiMethods.getTokenPrice, {
    to: settings.currency.toUpperCase(),
  });
  useFantomApi(
    FantomApiMethods.getAssetsListForAccount,
    {
      owner: activeAddress,
    },
    activeAddress
  );

  const isDoneLoading =
    activeAddress && accountData?.data && assetsList?.data && tokenPrice?.data;

  return (
    <Column style={{ alignItems: "center" }}>
      <Spacer size="lg" />
      <SendTokens
        loading={!isDoneLoading}
        accountData={accountData}
        assetsList={assetsList}
        tokenPrice={tokenPrice}
        currency={settings.currency}
      />
    </Column>
  );
};

export default Send;
