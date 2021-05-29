import React, { useContext, useEffect, useState } from "react";
import { Button, ContentBox, Typo1, Typo2 } from "../../components";
import Column from "../../components/Column";
import Spacer from "../../components/Spacer";
import useFantomApiData from "../../hooks/useFantomApiData";
import useWalletProvider from "../../hooks/useWalletProvider";
import useSettings from "../../hooks/useSettings";
import useFantomApi, { FantomApiMethods } from "../../hooks/useFantomApi";
import styled, { ThemeContext } from "styled-components";
import Row from "../../components/Row";
import walletSymbol from "../../assets/img/symbols/wallet.svg";
import { getAccountAssets, getAccountBalance } from "../../utils/account";
import { getTokenPrice } from "../../utils/common";
import {
  toCurrencySymbol,
  toFormattedBalance,
  weiToMaxUnit,
  weiToUnit,
} from "../../utils/conversion";
import DropDownButton from "../../components/DropDownButton";
import TokenSelector from "../../components/TokenSelector";

const AmountInput: React.FC<any> = ({
  accountBalance,
  accountAssets,
  fantomPrice,
  currency,
}) => {
  const { color } = useContext(ThemeContext);
  const [amount, setAmount] = useState("");
  const [value, setValue] = useState(null);

  const handleChange = (value: string) => {
    if (value && !Number(value)) {
      return;
    }

    setAmount(value);
  };
  const formattedBalance = toFormattedBalance(weiToUnit(accountBalance));
  const formattedTotalValue = value && toFormattedBalance(value);

  const handleSetMax = () => {
    setAmount(weiToMaxUnit(accountBalance).toString());
  };

  useEffect(() => {
    if (!amount) {
      return setValue(null);
    }
    setValue(parseFloat(amount) * fantomPrice);
  }, [amount, fantomPrice]);

  return (
    <Column>
      <Row style={{ justifyContent: "space-between" }}>
        <Typo2 style={{ color: color.greys.grey() }}>Amount</Typo2>
        <Row>
          <img alt="" src={walletSymbol} />
          <Spacer size="sm" />
          <Typo2 style={{ color: color.greys.grey() }}>
            {`${formattedBalance[0]}${
              formattedBalance[1] !== ".00" ? formattedBalance[1] : ""
            } FTM`}
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
            <Typo2>FTM</Typo2>
          </Button>
          <Spacer />
        </Row>
      </Row>
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

const AddressInput: React.FC<any> = () => {
  const { color } = useContext(ThemeContext);
  return (
    <Column>
      <Row style={{ justifyContent: "space-between" }}>
        <Typo2 style={{ color: color.greys.grey() }}>To</Typo2>
        <Row>
          <img src={walletSymbol} />
          <Spacer size="sm" />
          <Typo2 style={{ color: color.greys.grey() }}>0 FTM</Typo2>
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
        <StyledInput />
      </Row>
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
  return (
    <Column style={{ width: "100%" }}>
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
      />
      <Spacer size="lg" />
      <Spacer size="lg" />
      <Spacer />
      <AddressInput />
      <Spacer size="lg" />
      <Spacer size="lg" />
      <Button variant="primary"> CONTINUE </Button>
      <Spacer />
      <Spacer />
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
