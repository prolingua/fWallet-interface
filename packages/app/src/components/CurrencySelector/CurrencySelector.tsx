import React, { useEffect, useState } from "react";
import { Button, Container, WrapA } from "../index";
import Column from "../Column";
import Row from "../Row";
import DropDownButton from "../DropDownButton";

import vShape from "../../assets/img/shapes/vShape.png";
import usFlagIcon from "../../assets/img/icons/usFlag.svg";
import euFlagIcon from "../../assets/img/icons/euFlag.png";

export const currencyOptions: any = {
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
    <Container padding="1rem">
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

const CurrencySelector: React.FC<any> = ({ current, dispatch }) => {
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

export default CurrencySelector;
