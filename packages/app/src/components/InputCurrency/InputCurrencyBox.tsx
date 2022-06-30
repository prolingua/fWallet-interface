import React, { useContext, useState } from "react";
import styled, { ThemeContext } from "styled-components";
import Row from "../Row";
import Spacer from "../Spacer";
import InputCurrency from "./InputCurrency";
import { FANTOM_NATIVE } from "../../utils/common";
import { Button, mediaExact } from "../index";
import { Item } from "../Grid/Grid";

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
    <StyledInputCurrencyBox
      style={{
        width: "100%",
        backgroundColor: variant === "new" ? color.primary.black() : "#202F49",
        borderRadius: "8px",
        alignItems: "center",
        justifyContent: "space-between",
      }}
    >
      <Row>
        <Spacer />
        <InputCurrency
          disabled={disabled}
          value={value}
          max={max}
          handleValue={setValue}
          handleError={setError}
          token={FANTOM_NATIVE}
        />
      </Row>
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
          MAX {minus ? "" : ""}
        </Button>
        <Spacer />
      </Row>
    </StyledInputCurrencyBox>
  );
};

const StyledInputCurrencyBox = styled(Row)`
  ${mediaExact.xs(`height: 54px`)};
  ${mediaExact.sm(`height: 54px`)};
  ${mediaExact.md(`height: 64px`)};
  ${mediaExact.lg(`height: 64px`)};
`;

export default InputCurrencyBox;
