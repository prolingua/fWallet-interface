import React, { useEffect, useState } from "react";

import { Button, Container, Header, WrapA } from "../../components";
import WalletButton from "../../components/WalletButton/WalletButton";
import useWalletProvider from "../../hooks/useWalletProvider";
import DropDownButton from "../../components/DropDownButton";
import useSettings from "../../hooks/useSettings";
import Row from "../../components/Row";
import Column from "../../components/Column";

import usFlagIcon from "../../assets/img/icons/usFlag.svg";
import euFlagIcon from "../../assets/img/icons/euFlag.png";
import vShape from "../../assets/img/shapes/vShape.png";

const currencyOptions: any = {
  USD: {
    name: "USD",
    symbol: "$",
    icon: usFlagIcon,
  },
  EUR: {
    name: "EUR",
    symbol: "€",
    icon: euFlagIcon,
  },
};

const CurrencySelect: React.FC<any> = ({ dispatch, handleClose }) => {
  return (
    <Container>
      <Column>
        {Object.keys(currencyOptions).map((key: string) => {
          const value = currencyOptions[key];
          return (
            <WrapA
              key={value.name}
              onClick={() => {
                dispatch({ type: "changeCurrency", currency: value.name });
                handleClose();
              }}
            >
              <Row>{`${value.name} (${value.symbol})`}</Row>
            </WrapA>
          );
        })}
      </Column>
    </Container>
  );
};

const CurrencyDropdown: React.FC<any> = ({ current, dispatch }) => {
  const [closeDropDown, setCloseDropDown] = useState(false);
  const handleClose = () => {
    setCloseDropDown(true);
  };

  useEffect(() => {
    if (closeDropDown) {
      setCloseDropDown(false);
    }
  }, [closeDropDown]);
  return (
    <DropDownButton
      triggerClose={closeDropDown}
      DropDown={() => CurrencySelect({ dispatch, handleClose })}
    >
      <Button
        variant="secondary"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: "bold",
        }}
      >
        <img
          src={currencyOptions[current].icon}
          style={{ height: "20px", width: "20px", paddingRight: ".5rem" }}
        />
        {current}
        <img src={vShape} style={{ paddingLeft: ".5rem" }} />
      </Button>
    </DropDownButton>
  );
};

const TopBar: React.FC<any> = () => {
  const { wallet } = useWalletProvider();
  const { settings, dispatchSettings } = useSettings();

  return (
    <Header>
      {!wallet.account && <WalletButton />}
      <div style={{ marginRight: "2rem" }}>
        {wallet.account ? wallet.account : "No WALLET connected"}
      </div>
      <CurrencyDropdown
        current={settings.currency}
        dispatch={dispatchSettings}
      />
    </Header>
  );
};

export default TopBar;
