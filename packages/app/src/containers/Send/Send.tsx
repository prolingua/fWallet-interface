import React, { useContext, useEffect, useState } from "react";
import {
  Button,
  ContentBox,
  Heading1,
  mediaExact,
  mediaFrom,
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
import { getAccountAssets, getAccountBalance } from "../../utils/account";
import { FANTOM_NATIVE, getTokenPrice } from "../../utils/common";
import {
  toCurrencySymbol,
  toFormattedBalance,
  weiToMaxUnit,
} from "../../utils/conversion";

import backArrowSymbol from "../../assets/img/symbols/BackArrow.svg";
import { BigNumber } from "@ethersproject/bignumber";
import useFantomNative from "../../hooks/useFantomNative";
import useTransaction from "../../hooks/useTransaction";
import useFantomERC20 from "../../hooks/useFantomERC20";
import AmountInputRow from "./AmountInputRow";
import InputError from "../../components/InputError";
import InputAddress from "../../components/InputAddress";
import EstimatedFees from "./EstimatedFees";
import useModal from "../../hooks/useModal";
import InfoModal from "../../components/InfoModal";
import FadeInOut from "../../components/AnimationFade";
import ErrorBoundary from "../../components/ErrorBoundary";
import useUnstoppableDomains from "../../hooks/useUnstoppableDomains";

const SendTokensContent: React.FC<any> = ({
  accountData,
  assetsList,
  tokenPrice,
  gasPrice,
  currency,
  loading,
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
    ? toFormattedBalance(
        parseFloat(weiToMaxUnit(amountToSend, tokenSelected.decimals)),
        18
      )
    : ["", ""];
  const isNative = tokenSelected.symbol === "FTM";
  const [txHash, setTxHash] = useState(null);
  const tx = transaction[txHash];
  const isSending = tx && tx.status === "pending";
  const isSend = tx && tx.status === "completed";

  const handleSend = async () => {
    try {
      const hash = isNative
        ? await sendNativeTokens(receiverAddress, amountToSend)
        : await sendTokens(
            tokenSelected.address,
            receiverAddress,
            amountToSend
          );
      setTxHash(hash);
    } catch (err) {
      console.error(err);
    }
  };

  const resetStep1 = () => {
    setAmountToSend(null);
    setReceiverAddress(null);
    setIsValidTransaction(false);
  };
  const resetStep2 = () => {
    setReadyToSend(false);
    setAcceptedRisk(false);
    dispatchTx({ type: "reset" });
  };
  const resetInitial = () => {
    resetStep1();
    resetStep2();
  };

  useEffect(() => {
    if (amountToSend && amountToSend.gt(BigNumber.from(0)) && receiverAddress) {
      return setIsValidTransaction(true);
    }
    return setIsValidTransaction(false);
  }, [amountToSend, receiverAddress]);

  const [onPresentTransactionModal] = useModal(
    <InfoModal
      message={
        <div>
          <div>Transaction {tx && tx.status}</div>
          <div>TransactionId {tx && tx.hash}</div>
        </div>
      }
    />
  );

  useEffect(() => {
    if (isSend) {
      onPresentTransactionModal();
      setTimeout(() => {
        resetInitial();
      }, 1000);
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tx]);

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
            currency={currency}
            fantomPrice={getTokenPrice(tokenPrice)}
            initialInputValue={amountToSend}
            setAmountToSend={setAmountToSend}
            setTokenSelected={setTokenSelected}
            token={tokenSelected}
          />
          <Spacer size="lg" />
          <Spacer />
          <InputAddress
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
                <Spacer size="xs" />
                {isNative && amountToSend ? (
                  <Typo2>{`~${toCurrencySymbol(currency)}${(
                    parseFloat(
                      weiToMaxUnit(amountToSend, tokenSelected.decimals)
                    ) * getTokenPrice(tokenPrice)
                  ).toFixed(2)}`}</Typo2>
                ) : (
                  <Spacer />
                )}
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
              disabled={!acceptedRisk || isSending || isSend}
              variant="primary"
              onClick={handleSend}
            >
              {isSending
                ? "Sending..."
                : isSend
                ? "Success"
                : tx && tx.state === "failed"
                ? "Failed, try again"
                : "Send now"}
            </Button>
            {tx && tx.error ? (
              <>
                <Spacer size="xs" />
                <Row style={{ justifyContent: "center" }}>
                  <InputError fontSize="18px" error={tx.error.message} />
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
      <EstimatedFees
        currency={currency}
        token={tokenSelected}
        tokenPrice={tokenPrice}
        gasPrice={gasPrice}
        loading={loading}
      />
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
  gasPrice,
  currency,
}) => {
  return (
    <StyledContentBox>
      <ErrorBoundary name="[Send]">
        <SendTokensContent
          accountData={accountData?.data}
          assetsList={assetsList?.data}
          tokenPrice={tokenPrice?.data}
          gasPrice={gasPrice?.data}
          currency={currency}
          loading={loading}
        />
      </ErrorBoundary>
    </StyledContentBox>
  );
};

const StyledContentBox = styled(ContentBox)`
  box-sizing: border-box;
  ${mediaExact["xs"](`width: 100vw`)};
  ${mediaExact["sm"](`width: 90vw`)};
  ${mediaFrom["md"](`width: 610px`)};
`;

const Send: React.FC<any> = () => {
  const { apiData } = useFantomApiData();
  const { walletContext } = useWalletProvider();
  const { settings } = useSettings();
  const activeAddress = walletContext.activeWallet.address
    ? walletContext.activeWallet.address.toLowerCase()
    : null;

  const tokenPrice = apiData[FantomApiMethods.getTokenPrice];
  const gasPrice = apiData[FantomApiMethods.getGasPrice];
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
  useFantomApi(
    FantomApiMethods.getAssetsListForAccount,
    {
      owner: activeAddress,
    },
    activeAddress,
    1000
  );
  useFantomApi(FantomApiMethods.getTokenPrice, {
    to: settings.currency.toUpperCase(),
  });
  useFantomApi(FantomApiMethods.getGasPrice, null);

  const isDoneLoading =
    activeAddress && accountData?.data && assetsList?.data && tokenPrice?.data;

  // TODO remove UD examples / test
  // const {
  //   getFantomAddressForDomain,
  //   getFantomDomainForAddress,
  // } = useUnstoppableDomains();
  // useEffect(() => {
  //   getFantomAddressForDomain("jim-unstoppable.x").then((result) => {
  //     console.log({ result });
  //   });
  //   getFantomDomainForAddress(
  //     "0x621bf2A4720DbFF5E0AC4A94f539ef7c4555Cf22"
  //   ).then((result) => {
  //     console.log({ result });
  //   });
  // }, []);

  return (
    <FadeInOut>
      <Column style={{ alignItems: "center" }}>
        <Spacer size="lg" />
        <SendTokens
          loading={!isDoneLoading}
          accountData={accountData}
          assetsList={assetsList}
          tokenPrice={tokenPrice}
          gasPrice={gasPrice}
          currency={settings.currency}
        />
      </Column>
    </FadeInOut>
  );
};

export default Send;
