import React, { useEffect, useState } from "react";
import { Button, Container, OverlayButton, Typo1 } from "../index";
import Column from "../Column";
import Row from "../Row";
import DropDownButton from "../DropDownButton";

import vShape from "../../assets/img/shapes/vShape.png";
import usFlagIcon from "../../assets/img/icons/usFlag.svg";
import euFlagIcon from "../../assets/img/icons/euFlag.png";
import cnFlagIcon from "../../assets/img/icons/cnFlag.png";
import gbFlagIcon from "../../assets/img/icons/gbFlag.png";
import jpFlagIcon from "../../assets/img/icons/jpFlag.png";
import skrFlagIcon from "../../assets/img/icons/skrFlag.png";
import auFlagIcon from "../../assets/img/icons/auFlag.png";
import caFlagIcon from "../../assets/img/icons/caFlag.png";
import chFlagIcon from "../../assets/img/icons/chFlag.png";
import uaeFlagIcon from "../../assets/img/icons/uaeFlag.png";

export const currencyOptions: any = {
  usd: {
    name: "USD",
    long: "US Dollar",
    symbol: "$",
    icon: usFlagIcon,
  },
  eur: {
    name: "EUR",
    long: "Euro",
    symbol: "€",
    icon: euFlagIcon,
  },
  cny: {
    name: "CNY",
    long: "Chinese Yuan",
    symbol: "¥",
    icon: cnFlagIcon,
  },
  gbp: {
    name: "GBP",
    long: "Pound",
    symbol: "£",
    icon: gbFlagIcon,
  },
  jpy: {
    name: "JPY",
    long: "Japanese Yen",
    symbol: "¥",
    icon: jpFlagIcon,
  },
  krw: {
    name: "KRW",
    long: "South-Korean Won",
    symbol: "₩",
    icon: skrFlagIcon,
  },
  aud: {
    name: "AUD",
    long: "Australian Dollar",
    symbol: "A$",
    icon: auFlagIcon,
  },
  cad: {
    name: "CAD",
    long: "Canadian Dollar",
    symbol: "C$",
    icon: caFlagIcon,
  },
  chf: {
    name: "CHF",
    long: "Swiss Franc",
    symbol: "CHF",
    icon: chFlagIcon,
  },
  aed: {
    name: "AED",
    long: "UAE Dirham",
    symbol: "AED",
    icon: uaeFlagIcon,
  },
};

const CurrencySelect: React.FC<any> = ({ dispatch, handleClose }) => {
  return (
    <Container padding="1rem">
      <Column>
        {Object.keys(currencyOptions).map((key: string) => {
          const value = currencyOptions[key];
          return (
            <OverlayButton
              key={value.name}
              onClick={() => {
                dispatch({ type: "changeCurrency", currency: key });
                handleClose();
              }}
            >
              <Row>
                <Typo1
                  style={{ fontWeight: "bold" }}
                >{`${value.long} - ${value.name} - ${value.symbol}`}</Typo1>
              </Row>
            </OverlayButton>
          );
        })}
      </Column>
    </Container>
  );
};

const CurrencySelector: React.FC<any> = ({ current, width, dispatch }) => {
  const [closeDropDown, setCloseDropDown] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

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
      width={width}
      triggerClose={closeDropDown}
      DropDown={() => CurrencySelect({ dispatch, handleClose })}
      dropdownWidth={336}
      dropdownTop={70}
      dropdownLeft={0}
      getState={setIsDropdownOpen}
    >
      <Button
        variant="secondary"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontWeight: "bold",
          width: "100%",
          height: "56px",
        }}
      >
        <Row style={{ alignItems: "center", justifyContent: "center" }}>
          <img
            alt=""
            src={currencyOptions[current].icon}
            style={{ height: "25px", width: "25px", paddingRight: ".5rem" }}
          />
          {current.toUpperCase()}
        </Row>
        <img
          alt=""
          src={vShape}
          style={{
            paddingLeft: ".5rem",
            transform: isDropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
          }}
        />
      </Button>
    </DropDownButton>
  );
};

export default CurrencySelector;
