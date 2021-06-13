import React, { useContext, useEffect, useState } from "react";
import {
  Button,
  ContentBox,
  Heading1,
  Input,
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
  weiToMaxUnit,
  weiToUnit,
} from "../../utils/conversion";

import backArrowSymbol from "../../assets/img/symbols/BackArrow.svg";
import { isValidAddress } from "../../utils/wallet";
import { useQuery } from "@apollo/react-hooks";
import { ERC20_ASSETS, GET_ACCOUNT_BALANCE } from "../../graphql/subgraph";
import { BigNumber } from "@ethersproject/bignumber";
import useFantomNative from "../../hooks/useFantomNative";
import useTransaction from "../../hooks/useTransaction";
import useFantomERC20 from "../../hooks/useFantomERC20";
import AmountInputRow from "./AmountInputRow";
import InputError from "../../components/InputError";

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
      {balance ? `${formattedBalance[0]}${formattedBalance[1]}` : "0 "}
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
            <Typo2 style={{ color: color.greys.grey() }}>
              {`0 ${token.symbol}`}`
            </Typo2>
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
        <Input
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
      {error ? <InputError error={error} /> : <Spacer size="lg" />}
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
  accountDataRefetch,
  assetsList,
  tokenPrice,
  currency,
}) => {
  const { color } = useContext(ThemeContext);
  const [amountToSend, setAmountToSend] = useState(null);
  const [receiverAddress, setReceiverAddress] = useState(null);
  const [isValidTransaction, setIsValidTransaction] = useState(false);
  const [readyToSend, setReadyToSend] = useState(false);
  const [acceptedRisk, setAcceptedRisk] = useState(false);
  const [tokenSelected, setTokenSelected] = useState(FANTOM_NATIVE);
  const { sendNativeTokens } = useFantomNative();
  const { sendTokens } = useFantomERC20();
  const { transaction, dispatchTx } = useTransaction();
  const formattedAmountToSend = amountToSend
    ? toFormattedBalance(weiToMaxUnit(amountToSend, tokenSelected.decimals), 18)
    : ["", ""];

  const isNative = tokenSelected.symbol === "FTM";
  const resetStep2 = () => {
    setReadyToSend(false);
    setAcceptedRisk(false);
    dispatchTx({ type: "reset" });
    accountDataRefetch();
  };
  const resetState = () => {
    setAmountToSend(null);
    setReceiverAddress(null);
    setIsValidTransaction(false);
    resetStep2();
  };

  useEffect(() => {
    if (amountToSend && amountToSend.gt(BigNumber.from(0)) && receiverAddress) {
      return setIsValidTransaction(true);
    }
    return setIsValidTransaction(false);
  }, [amountToSend, receiverAddress]);

  useEffect(() => {
    if (transaction.state === "completed") {
      setTimeout(() => {
        resetState();
      }, 1000);
    }
  }, [transaction]);

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
          <AmountInputRow
            accountBalance={getAccountBalance(accountData)}
            accountAssets={getAccountAssets(assetsList)}
            fantomPrice={getTokenPrice(tokenPrice)}
            currency={currency}
            token={tokenSelected}
            setAmountToSend={setAmountToSend}
            initialInputValue={amountToSend}
            setTokenSelected={setTokenSelected}
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
            <OverlayButton style={{ zIndex: 1 }} onClick={() => resetStep2()}>
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
          <Column>
            <Row
              style={{
                width: "100%",
                backgroundColor: color.primary.black(),
                borderRadius: "8px",
              }}
            >
              <Column
                style={{ padding: "2rem", alignItems: "center", width: "100%" }}
              >
                <Heading1
                  style={{ color: color.primary.cyan() }}
                >{`${formattedAmountToSend[0]}${formattedAmountToSend[1]} ${tokenSelected.symbol}`}</Heading1>
                <Spacer size="sm" />
                <Typo2>{`~${toCurrencySymbol(currency)}${(
                  weiToMaxUnit(amountToSend, tokenSelected.decimals) *
                  getTokenPrice(tokenPrice)
                ).toFixed(2)}`}</Typo2>
                <Spacer size="lg" />
                <Row style={{ alignItems: "center" }}>
                  <Typo2 style={{ display: "flex", marginTop: "auto" }}>
                    To
                  </Typo2>
                  <Spacer size="lg" />
                  <Typo1 style={{ fontWeight: "bold", marginTop: "auto" }}>
                    {receiverAddress}
                  </Typo1>
                </Row>
              </Column>
            </Row>
            <Spacer size="lg" />
            <Spacer size="lg" />
            <Row>
              <Spacer size="lg" />
              <Spacer size="lg" />
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <StyledCheckbox
                  name="acceptRisk"
                  type="checkbox"
                  checked={acceptedRisk}
                  onChange={() => setAcceptedRisk(!acceptedRisk)}
                />
              </div>
              <Spacer size="lg" />
              <Spacer size="lg" />
              <Typo2 style={{ marginRight: "4rem", alignSelf: "center" }}>
                I understand that I'm sending tokens to a Fantom Opera mainnet
                wallet, and not to an Ethereum wallet. If I send tokens to a
                non-Fantom Opera address, they may never be recoverable.
              </Typo2>
              <Spacer size="lg" />
            </Row>
            <Spacer size="lg" />
            <Spacer />
            <Button
              padding="17px"
              disabled={
                !acceptedRisk ||
                transaction.state === "pending" ||
                transaction.state === "completed"
              }
              variant="primary"
              onClick={() =>
                isNative
                  ? sendNativeTokens(receiverAddress, amountToSend)
                  : sendTokens(
                      tokenSelected.address,
                      receiverAddress,
                      amountToSend
                    )
              }
            >
              {transaction.state === "pending"
                ? "Sending..."
                : transaction.state === "completed"
                ? "Success"
                : transaction.state === "failed"
                ? "Failed, try again"
                : "Send now"}
            </Button>
            {transaction.error ? (
              <>
                <Spacer size="sm" />
                <Row style={{ justifyContent: "center" }}>
                  <InputError
                    fontSize="18px"
                    error={transaction.error.message}
                  />
                </Row>
                <Spacer />
              </>
            ) : (
              <>
                <Spacer />
                <Spacer />
              </>
            )}
          </Column>
        </>
      )}
      <Estimated currency={currency} />
    </Column>
  );
};

const StyledCheckbox = styled.input`
  -webkit-appearance: none;
  background-color: transparent;
  width: 1.5rem;
  height: 1.5rem;
  border: 2px solid ${(props) => props.theme.color.primary.cyan()};
  border-radius: 4px;
  display: inline-block;
  position: relative;

  :checked {
    background-color: ${(props) => props.theme.color.primary.cyan()};
  }

  :checked:after {
    content: "\\2714";
    font-size: 1.5rem;
    position: absolute;
    top: -4px;
    left: 0px;
    color: ${(props) => props.theme.color.secondary.navy()};
  }
`;

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
          accountDataRefetch={accountData.refetch}
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

  // TODO create HOC / hook for loading all required endpoints
  useFantomApi(
    FantomApiMethods.getAccountBalance,
    {
      address: activeAddress,
    },
    activeAddress,
    1000
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

  // TODO workaround for broken polling of useQuery
  useEffect(() => {
    const interval = setInterval(() => {
      accountData && accountData.refetch && accountData.refetch();
      assetsList && assetsList.refetch && assetsList.refetch();
    }, 1000);

    return () => clearInterval(interval);
  }, []);

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
