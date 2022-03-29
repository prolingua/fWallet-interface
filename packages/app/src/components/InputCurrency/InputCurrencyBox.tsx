import React, { useContext, useState } from "react";
import { ThemeContext } from "styled-components";
import Row from "../Row";
import Spacer from "../Spacer";
import InputCurrency from "./InputCurrency";
import { FANTOM_NATIVE } from "../../utils/common";
import { Button } from "../index";

const InputCurrencyBox: React.FC<any> = ({
  value,
  max,
  setValue,
  disabled,
  minus,
  variant = "old",
}) => {
  const { color } = useContext(ThemeContext);
  const [error, setError] = useState(null);
  const handleSetMax = () => {
    setError(null);
    setValue(max);
  };

  return (
    <Row
      style={{
        width: "100%",
        backgroundColor: variant === "new" ? color.primary.black() : "#202F49",
        borderRadius: "8px",
        height: "64px",
        alignItems: "center",
      }}
    >
      <Spacer />
      <InputCurrency
        disabled={disabled}
        value={value}
        max={max}
        handleValue={setValue}
        handleError={setError}
        token={FANTOM_NATIVE}
      />
      <Row style={{ alignItems: "center" }}>
        <Button
          disabled={disabled}
          fontSize="14px"
          color={color.greys.grey()}
          padding="8px"
          style={{ flex: 1 }}
          variant="tertiary"
          onClick={handleSetMax}
        >
          MAX {minus ? " - 1" : ""}
        </Button>
        <Spacer />
      </Row>
    </Row>
  );
};

export default InputCurrencyBox;
