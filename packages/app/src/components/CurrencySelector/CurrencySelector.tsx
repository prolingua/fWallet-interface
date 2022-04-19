import React, { useEffect, useState } from "react";
import { Button, Container, OverlayButton, Typo1 } from "../index";
import Column from "../Column";
import Row from "../Row";
import DropDownButton from "../DropDownButton";

import vShape from "../../assets/img/shapes/vShape.png";
import usFlagIcon from "../../assets/img/icons/usFlag.svg";
import euFlagIcon from "../../assets/img/icons/euFlag.png";

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
      dropdownLeft={5}
      getState={setIsDropdownOpen}
    >
      <Button
        variant="secondary"
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontWeight: "bold",
          width: "100%",
          height: "56px",
        }}
      >
        <img
          alt=""
          src={currencyOptions[current].icon}
          style={{ height: "20px", width: "20px", paddingRight: ".5rem" }}
        />
        {current.toUpperCase()}
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
